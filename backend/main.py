import os
import uuid
import json
import fitz  # PyMuPDF
import boto3
from datetime import datetime
from typing import Optional
from dotenv import load_dotenv
from openai import OpenAI
from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, HTMLResponse
from passlib.context import CryptContext
from pydantic import BaseModel
from boto3.dynamodb.conditions import Key
from google_auth_oauthlib.flow import Flow
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build

load_dotenv()

app = FastAPI(title="AI Contract Manager API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Configuration ---
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
REDIRECT_URI = "http://localhost:8000/auth/callback"
SCOPES = [
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/userinfo.profile',
    'openid'
]

aws_config = {
    "aws_access_key_id": os.getenv("AWS_ACCESS_KEY_ID"),
    "aws_secret_access_key": os.getenv("AWS_SECRET_ACCESS_KEY"),
    "region_name": os.getenv("AWS_REGION")
}

s3_client = boto3.client('s3', **aws_config)
dynamodb = boto3.resource('dynamodb', **aws_config)
contracts_table = dynamodb.Table('Analyzed_Contracts')
users_table = dynamodb.Table('Users')
ai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class ReminderUpdate(BaseModel):
    contract_id: str
    user_id: str
    reminder_setting: str


# --- Helpers ---
def get_password_hash(password):
    return pwd_context.hash(password[:72])


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def call_openai_analysis(text_content):
    prompt_instruction = """
    You are an expert legal assistant. Analyze the contract and return a JSON object with:
    1. "subject": A very short title (3-5 words).
    2. "party": The main second party company/individual.
    3. "expiry_date": ISO date (YYYY-MM-DD) or "N/A".
    4. "summary": A structured Markdown summary using this exact template:

    📌 Main Purpose
    [One sentence description of what this contract is about]

    ⚖️ Key Obligations
    - [Obligation 1]
    - [Obligation 2]

    💰 Financial Terms
    - [Payment details, fees, or 'Not specified']

    ⚠️ Potential Risks & Red Flags
    - [Mention any cancellation fees, long notice periods, or hidden costs]

    📅 Termination Terms
    - [How to cancel and notice period]
    """

    response = ai_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": prompt_instruction},
            {"role": "user", "content": f"Analyze this contract text:\n\n{text_content[:6000]}"}
        ],
        response_format={"type": "json_object"}
    )
    return json.loads(response.choices[0].message.content)


# --- Routes ---

@app.post("/signup")
async def signup(username: str = Form(...), password: str = Form(...), email: str = Form(...)):
    if "Item" in users_table.get_item(Key={"username": username}):
        raise HTTPException(status_code=400, detail="User exists")
    users_table.put_item(Item={"username": username, "password": get_password_hash(password), "email": email})
    return {"status": "success"}


@app.post("/login")
async def login(username: str = Form(...), password: str = Form(...)):
    res = users_table.get_item(Key={'username': username})
    if 'Item' not in res or not verify_password(password, res['Item']['password']):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    return {"username": username, "status": "success"}


@app.get("/check-google-connection")
async def check_google_connection(user_id: str):
    res = users_table.get_item(Key={'username': user_id})
    item = res.get('Item', {})
    return {
        "connected": 'google_tokens' in item,
        "picture_url": item.get('picture_url')
    }


@app.post("/upload")
async def upload_contract(file: UploadFile = File(...), user_id: str = Form(...)):
    try:
        file_bytes = await file.read()
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        text = "".join([page.get_text() for page in doc])

        # S3 Upload
        s3_client.put_object(Bucket=os.getenv("S3_BUCKET_NAME"), Key=f"{user_id}/{file.filename}", Body=file_bytes)

        # AI Analysis
        analysis = call_openai_analysis(text)
        contract_id = str(uuid.uuid4())

        contracts_table.put_item(Item={
            'user_id': user_id,
            'contract_id': contract_id,
            'filename': file.filename,
            'analysis': analysis,
            'timestamp': datetime.now().isoformat(),
            'reminder_setting': 'none'
        })
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/contracts")
async def get_contracts(user_id: str):
    res = contracts_table.query(KeyConditionExpression=Key('user_id').eq(user_id))
    items = res.get('Items', [])

    return {"contracts": items}


@app.delete("/contracts/{contract_id}")
async def delete_contract(contract_id: str, user_id: str):
    contracts_table.delete_item(Key={'user_id': user_id, 'contract_id': contract_id})
    return {"status": "success"}


@app.get("/view/{contract_id}")
async def view_contract(contract_id: str, user_id: str):
    res = contracts_table.get_item(Key={'user_id': user_id, 'contract_id': contract_id})
    if 'Item' not in res: raise HTTPException(status_code=404)
    url = s3_client.generate_presigned_url('get_object', Params={'Bucket': os.getenv("S3_BUCKET_NAME"),
                                                                 'Key': f"{user_id}/{res['Item']['filename']}"},
                                           ExpiresIn=3600)
    return {"url": url}


@app.get("/auth/google")
async def auth_google(user_id: str):
    flow = Flow.from_client_config(
        {"web": {"client_id": GOOGLE_CLIENT_ID, "client_secret": GOOGLE_CLIENT_SECRET,
                 "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                 "token_uri": "https://oauth2.googleapis.com/token"}},
        scopes=SCOPES
    )
    flow.redirect_uri = REDIRECT_URI
    auth_url, _ = flow.authorization_url(prompt='consent', access_type='offline', state=user_id)
    return {"url": auth_url}


@app.get("/auth/callback")
async def auth_callback(code: str, state: str):
    flow = Flow.from_client_config(
        {"web": {"client_id": GOOGLE_CLIENT_ID, "client_secret": GOOGLE_CLIENT_SECRET,
                 "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                 "token_uri": "https://oauth2.googleapis.com/token"}},
        scopes=SCOPES
    )
    flow.redirect_uri = REDIRECT_URI
    flow.fetch_token(code=code)
    creds = flow.credentials

    user_info_service = build('oauth2', 'v2', credentials=creds)
    user_info = user_info_service.userinfo().get().execute()

    users_table.update_item(
        Key={'username': state},
        UpdateExpression="set google_tokens = :t, picture_url = :p",
        ExpressionAttributeValues={
            ':t': {'access_token': creds.token, 'refresh_token': creds.refresh_token, 'token_uri': creds.token_uri,
                   'client_id': GOOGLE_CLIENT_ID, 'client_secret': GOOGLE_CLIENT_SECRET, 'scopes': creds.scopes},
            ':p': user_info.get('picture')
        }
    )

    return HTMLResponse(content=f"""
        <html>
            <body style="font-family: sans-serif; text-align: center; padding-top: 100px;">
                <h1 style="color: #10b981;">Connected Successfully!</h1>
                <p>Closing window...</p>
                <script>
                    window.opener.postMessage("google-success", "*");
                    setTimeout(() => window.close(), 500);
                </script>
            </body>
        </html>
    """)


@app.post("/disconnect-google")
async def disconnect(user_id: str = Form(...)):
    users_table.update_item(Key={'username': user_id}, UpdateExpression="remove google_tokens, picture_url")
    return {"status": "success"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8000)