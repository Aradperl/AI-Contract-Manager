import os
import uuid
import time
import fitz  # PyMuPDF
import boto3
from datetime import datetime
from dotenv import load_dotenv
from google_auth_oauthlib.flow import Flow
from openai import OpenAI
from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from passlib.context import CryptContext
from boto3.dynamodb.conditions import Key
from typing import Annotated
import json
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from starlette.responses import HTMLResponse

# טעינת משתני סביבה
load_dotenv()

app = FastAPI(title="Smart Contract Analyzer API")

# הגדרת CORS - מאפשר ל-React (פורט 5173 או localhost) לדבר עם השרת
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# הגדרות גוגל (שים ב-.env שלך)
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
# ה-URL שגוגל תחזור אליו אחרי האישור
REDIRECT_URI = "http://localhost:8000/auth/callback"

# הגדרת ההרשאות שאנחנו מבקשים (גישה ליומן)
SCOPES = ['https://www.googleapis.com/auth/calendar.events']

# הגדרות AWS
aws_config = {
    "aws_access_key_id": os.getenv("AWS_ACCESS_KEY_ID"),
    "aws_secret_access_key": os.getenv("AWS_SECRET_ACCESS_KEY"),
    "region_name": os.getenv("AWS_REGION")
}
s3_client = boto3.client('s3', **aws_config)

dynamodb = boto3.resource('dynamodb', **aws_config)
contracts_table = dynamodb.Table('Analyzed_Contracts')
users_table = dynamodb.Table('Users')

# הגדרת OpenAI
ai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

ses_client = boto3.client(
    'ses',
    region_name='us-east-1'
)

class ReminderUpdate(BaseModel):
    contract_id: str
    user_id: str
    reminder_setting: str
# הגדרות אבטחה וסיסמאות
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_password_hash(password):
    # חיתוך ל-72 תווים למניעת שגיאת bcrypt
    if len(password) > 72:
        password = password[:72]
    return pwd_context.hash(password)


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_event_id_from_db(user_id, contract_id):
    """Retrieves the Google Event ID associated with a specific contract."""
    response = contracts_table.get_item(Key={'user_id': user_id, 'contract_id': contract_id})
    return response.get('Item', {}).get('google_event_id')


def get_user_google_creds(user_id: str):
    """
    Retrieves Google OAuth2 credentials from the Users table and refreshes if needed.
    """
    # Fetch user data from DynamoDB
    response = users_table.get_item(Key={'username': user_id})
    user_data = response.get('Item')

    if not user_data or 'google_tokens' not in user_data:
        return None

    tokens = user_data['google_tokens']

    # Create a Credentials object using the stored tokens
    creds = Credentials(
        token=tokens.get('access_token'),
        refresh_token=tokens.get('refresh_token'),
        token_uri="https://oauth2.googleapis.com/token",
        client_id=os.getenv("GOOGLE_CLIENT_ID"),
        client_secret=os.getenv("GOOGLE_CLIENT_SECRET")
    )
    
    # Refresh token if expired
    if creds.expired and creds.refresh_token:
        try:
            creds.refresh(Request())
            # Update tokens in database
            users_table.update_item(
                Key={'username': user_id},
                UpdateExpression="set google_tokens = :t",
                ExpressionAttributeValues={
                    ':t': {
                        'access_token': creds.token,
                        'refresh_token': creds.refresh_token,
                        'token_uri': creds.token_uri,
                        'client_id': creds.client_id,
                        'client_secret': creds.client_secret,
                        'scopes': creds.scopes
                    }
                }
            )
            print(f"Refreshed Google token for user: {user_id}")
        except Exception as e:
            print(f"Error refreshing token: {e}")
            return None
    
    return creds

# --- פונקציות עזר לניתוח ---

def call_openai_api(text_content):
    """שליחת הטקסט ל-AI לקבלת סיכום"""
    try:
        response = ai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a legal document analysis assistant. Analyze the following contract and do the following: 1.	Summarize briefly the critical points that require special attention, including but not limited to: •	Termination clauses •	Penalties or liabilities •	Payment obligations •	Renewal conditions •	Unusual or one-sided clauses 2.	Explicitly extract the contract expiration date. •	If an expiration date exists, present it clearly in a separate line. •	If no explicit expiration date is found, state: “No explicit expiration date found in the contract.” Keep the output concise, structured, and easy to scan."},
                {"role": "user", "content": f"Analyze the following text.: {text_content[:5000]}"}
            ]
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"OpenAI Error: {e}")
        return "Analysis failed, but the file was saved"

def get_contract_metadata(text_content):
    response = ai_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": "Extract data from the contract. Return ONLY a JSON object with these keys: "
                           "'subject' (short title), 'party' (other company name), "
                           "'summary' (3-4 sentences), and 'expiry_date' (YYYY-MM-DD)."
            },
            {"role": "user", "content": text_content[:4000]}
        ],
        response_format={"type": "json_object"}
    )
    return response.choices[0].message.content

def create_google_calendar_event(user_id, contract_id, contract_data, reminder_days):
    """Creates or updates a Google Calendar event with reminders
    Returns: (event_dict, error_message) tuple. If successful, event_dict is not None. If failed, error_message contains the reason.
    """
    try:
        creds = get_user_google_creds(user_id)
        if not creds:
            error_msg = f"No Google credentials found for user: {user_id}. User may need to reconnect Google account."
            print(f"Error: {error_msg}")
            return None, error_msg
        
        service = build('calendar', 'v3', credentials=creds)
        
        # Calculate reminder date based on expiry_date
        expiry_date = contract_data.get('expiry_date', 'N/A')
        
        if expiry_date == 'N/A' or not expiry_date or expiry_date == '':
            error_msg = f"No expiry date found for contract. Current value: '{expiry_date}'. Please ensure the contract has a valid expiry date."
            print(f"Error: {error_msg}")
            return None, error_msg
        
        try:
            from datetime import datetime, timedelta
            expiry = datetime.strptime(expiry_date, '%Y-%m-%d')
            reminder_date = expiry - timedelta(days=reminder_days)
        except ValueError as e:
            error_msg = f"Invalid expiry date format: '{expiry_date}'. Expected format: YYYY-MM-DD. Error: {str(e)}"
            print(f"Error: {error_msg}")
            return None, error_msg
        except Exception as e:
            error_msg = f"Unexpected error parsing dates: {str(e)}"
            print(f"Error: {error_msg}")
            return None, error_msg
        
        # Check if event already exists
        event_id = get_event_id_from_db(user_id, contract_id)
        
        # Parse analysis if it's a string
        analysis_data = contract_data.get('analysis', {})
        if isinstance(analysis_data, str):
            try:
                analysis_data = json.loads(analysis_data)
            except:
                analysis_data = {}
        
        party_name = analysis_data.get('party', 'N/A') if isinstance(analysis_data, dict) else 'N/A'
        filename = contract_data.get('filename', 'Contract')
        
        event_body = {
            'summary': f"Contract Expiry: {filename}",
            'description': f"Contract with {party_name} expires on {expiry_date}. This is a reminder set {reminder_days} days before expiry.",
            'start': {
                'date': reminder_date.strftime('%Y-%m-%d'),
                'timeZone': 'UTC',
            },
            'end': {
                'date': (reminder_date + timedelta(days=1)).strftime('%Y-%m-%d'),
                'timeZone': 'UTC',
            },
            'reminders': {
                'useDefault': False,
                'overrides': [
                    {'method': 'popup', 'minutes': 0},  # Notification at the time
                    {'method': 'email', 'minutes': 0},  # Email notification too
                ],
            },
        }
        
        if event_id:
            # Update existing event
            event = service.events().update(
                calendarId='primary',
                eventId=event_id,
                body=event_body
            ).execute()
            return event, None
        else:
            # Create new event
            event = service.events().insert(
                calendarId='primary',
                body=event_body
            ).execute()
            
            # Save event ID to database
            contracts_table.update_item(
                Key={'user_id': user_id, 'contract_id': contract_id},
                UpdateExpression="set google_event_id = :e",
                ExpressionAttributeValues={':e': event['id']}
            )
            return event, None
        
        return event, None
    except Exception as e:
        import traceback
        error_msg = f"Google Calendar API error: {str(e)}"
        print(f"Error creating Google Calendar event: {error_msg}")
        print(traceback.format_exc())
        return None, error_msg

def update_google_calendar_event(user_id, contract_id, new_reminder_date):
    # 1. קבלת ה-Token של המשתמש מה-Database (אחרי שעבר OAuth)
    creds = get_user_google_creds(user_id)
    service = build('calendar', 'v3', credentials=creds)

    # 2. מציאת ה-Event ID שנשמר ב-DynamoDB בעת ההעלאה
    event_id = get_event_id_from_db(user_id, contract_id)

    # 3. עדכון התאריך של האירוע ביומן
    event = service.events().get(calendarId='primary', eventId=event_id).execute()
    event['start'] = {'date': new_reminder_date}
    event['end'] = {'date': new_reminder_date}

    # 4. ביצוע העדכון מול גוגל
    updated_event = service.events().update(calendarId='primary', eventId=event_id, body=event).execute()
    return updated_event


# --- נתיבים (Endpoints) ---

@app.post("/signup")
async def signup(username: str = Form(...), password: str = Form(...), email: str = Form(...)):
    try:
        # בדיקה אם המשתמש כבר קיים
        existing_user = users_table.get_item(Key={"username": username})
        if "Item" in existing_user:
            raise HTTPException(status_code=400, detail="Username already exists")

        hashed = get_password_hash(password)

        # שמירת המשתמש עם שדה אימייל
        users_table.put_item(Item={
            "username": username,
            "password": hashed,
            "email": email  # הוספת המייל לטבלה
        })
        return {"message": "Success", "username": username}
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Signup Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/login")
async def login(username: str = Form(...), password: str = Form(...)):
    user_data = users_table.get_item(Key={'username': username})
    if 'Item' not in user_data:
        raise HTTPException(status_code=400, detail="User not found")

    user = user_data['Item']
    if not verify_password(password, user['password']):
        raise HTTPException(status_code=400, detail="Incorrect password")

    return {"username": username, "status": "success"}


@app.post("/upload")
async def upload_and_analyze(file: UploadFile = File(...), user_id: str = Form(...)):
    try:
        file_bytes = await file.read()
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        text_content = "".join([page.get_text() for page in doc])

        # Save the file to S3
        s3_client.put_object(
            Bucket=os.getenv("S3_BUCKET_NAME"),
            Key=f"{user_id}/{file.filename}",
            Body=file_bytes,
            ContentType="application/pdf"
        )

        # 1. Detailed analysis
        detailed_analysis = call_openai_api(text_content)

        # 2. Extract metadata - כאן היה התיקון!
        # ה-OpenAI מחזיר מחרוזת, אנחנו חייבים להפוך אותה ל-Dict
        metadata_raw = get_contract_metadata(text_content)
        metadata = json.loads(metadata_raw) # הופך את הסטרינג לאובייקט פייתון

        # 3. Combine into JSON string for the DB
        combined_data = json.dumps({
            "subject": metadata.get("subject", "N/A"),
            "party": metadata.get("party", "N/A"), # וודא שזה תואם למפתח ב-Prompt
            "summary": detailed_analysis
        })

        contract_id = str(uuid.uuid4())

        contracts_table.put_item(
            Item={
                'user_id': user_id,
                'contract_id': contract_id,
                'filename': file.filename,
                'analysis': combined_data,
                'expiry_date': metadata.get("expiry_date", "N/A"),
                'reminder_setting': "none",
                'timestamp': datetime.now().isoformat()
            }
        )
        return {"status": "success"}
    except Exception as e:
        print(f"ERROR DURING UPLOAD: {str(e)}") # הדפסת השגיאה המדויקת לטרמינל
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/update-reminder")
async def update_reminder(data: ReminderUpdate):
    try:
        # 1. עדכון ה-DynamoDB
        contracts_table.update_item(
            Key={'user_id': data.user_id, 'contract_id': data.contract_id},
            UpdateExpression="set reminder_setting = :r",
            ExpressionAttributeValues={':r': data.reminder_setting}
        )

        # 2. Handle Google Calendar event
        calendar_event_created = False
        error_message = None
        
        if data.reminder_setting == "none":
            # Delete the calendar event if it exists
            try:
                event_id = get_event_id_from_db(data.user_id, data.contract_id)
                if event_id:
                    creds = get_user_google_creds(data.user_id)
                    if creds:
                        service = build('calendar', 'v3', credentials=creds)
                        service.events().delete(
                            calendarId='primary',
                            eventId=event_id
                        ).execute()
                        print(f"Calendar event deleted: {event_id}")
                        
                        # Remove event ID from database
                        contracts_table.update_item(
                            Key={'user_id': data.user_id, 'contract_id': data.contract_id},
                            UpdateExpression="remove google_event_id"
                        )
                    else:
                        # If no credentials, just remove from database
                        contracts_table.update_item(
                            Key={'user_id': data.user_id, 'contract_id': data.contract_id},
                            UpdateExpression="remove google_event_id"
                        )
            except Exception as delete_err:
                error_message = f"Failed to delete calendar event: {str(delete_err)}"
                print(f"Warning: {error_message}")
                # Still try to remove from database even if deletion failed
                try:
                    contracts_table.update_item(
                        Key={'user_id': data.user_id, 'contract_id': data.contract_id},
                        UpdateExpression="remove google_event_id"
                    )
                except:
                    pass
        
        elif data.reminder_setting != "none":
            try:
                # Get contract data
                contract_response = contracts_table.get_item(
                    Key={'user_id': data.user_id, 'contract_id': data.contract_id}
                )
                contract_data = contract_response.get('Item')
                
                if not contract_data:
                    error_message = "Contract not found in database"
                else:
                    # Check for expiry date
                    expiry_date = contract_data.get('expiry_date', 'N/A')
                    if expiry_date == 'N/A' or not expiry_date:
                        error_message = f"No expiry date found for this contract. Current expiry_date value: '{expiry_date}'"
                    else:
                        # Map reminder setting to days
                        reminder_days_map = {
                            'week': 7,
                            'two_weeks': 14,
                            'month': 30
                        }
                        reminder_days = reminder_days_map.get(data.reminder_setting, 7)
                        
                        # Create or update Google Calendar event
                        event, event_error = create_google_calendar_event(data.user_id, data.contract_id, contract_data, reminder_days)
                        if event:
                            calendar_event_created = True
                            return {
                                "status": "success", 
                                "message": "Reminder updated successfully",
                                "calendar_event_created": True,
                                "event_link": event.get('htmlLink', '')
                            }
                        else:
                            error_message = event_error or "Failed to create calendar event. Check backend logs for details."
                            
            except Exception as calendar_err:
                import traceback
                error_message = f"Exception occurred: {str(calendar_err)}"
                print(f"Warning: Google Calendar event could not be created/updated. Error: {calendar_err}")

        response = {
            "status": "success", 
            "message": "Reminder updated successfully",
            "calendar_event_created": calendar_event_created
        }
        
        if error_message:
            response["error_message"] = error_message
            
        return response

    except Exception as e:
        print(f"Critical Error: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

@app.get("/check-google-connection")
async def check_google_connection(user_id: str):
    """Check if user has Google Calendar connected"""
    try:
        response = users_table.get_item(Key={'username': user_id})
        user_data = response.get('Item')
        
        if user_data and 'google_tokens' in user_data:
            return {"connected": True}
        return {"connected": False}
    except Exception as e:
        return {"connected": False}

@app.get("/contracts")
async def get_contracts(user_id: str):
    """שליפת חוזים רק עבור המשתמש המחובר"""
    try:
        response = contracts_table.query(
            KeyConditionExpression=Key('user_id').eq(user_id)
        )
        return {"contracts": response.get('Items', [])}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/contracts/{contract_id}")
async def delete_contract(contract_id: str, user_id: str):
    try:
        contracts_table.delete_item(
            Key={
                'user_id': user_id,
                'contract_id': contract_id
            }
        )
        return {"status": "success"}
    except Exception as e:
        print(f"Delete Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/view/{contract_id}")
async def get_pdf_preview(contract_id: str, user_id: str):
    try:
        # 1. Verify the contract belongs to the user
        res = contracts_table.get_item(Key={'user_id': user_id, 'contract_id': contract_id})
        if 'Item' not in res:
            raise HTTPException(status_code=404, detail="Contract not found")

        filename = res['Item']['filename']

        # 2. Generate a Presigned URL from S3
        # Ensure the 'Bucket' name matches your actual S3 bucket name
        url = s3_client.generate_presigned_url(
            'get_object',
            Params={
                'Bucket': os.getenv("S3_BUCKET_NAME"),  # Use the variable here too
                'Key': f"{user_id}/{filename}"
            },
            ExpiresIn=3600
        )

        return {"url": url}
    except Exception as e:
        print(f"Error generating preview: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/auth/google")
async def auth_google(user_id: str):
    # יצירת תהליך האישור מול גוגל
    flow = Flow.from_client_config(
        {
            "web": {
                "client_id": GOOGLE_CLIENT_ID,
                "client_secret": GOOGLE_CLIENT_SECRET,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
            }
        },
        scopes=SCOPES
    )
    flow.redirect_uri = REDIRECT_URI

    # יצירת ה-URL שהמשתמש יופנה אליו (כולל ה-user_id כדי שנדע מי חזר)
    auth_url, _ = flow.authorization_url(prompt='consent', access_type='offline', state=user_id)
    return JSONResponse({"url": auth_url})


@app.get("/auth/callback")
async def auth_callback(code: str, state: str):
    # state כאן הוא ה-user_id ששלחנו קודם
    user_id = state

    flow = Flow.from_client_config(
        {
            "web": {
                "client_id": GOOGLE_CLIENT_ID,
                "client_secret": GOOGLE_CLIENT_SECRET,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
            }
        },
        scopes=SCOPES
    )
    flow.redirect_uri = REDIRECT_URI

    # החלפת הקוד ב-"Token" (המפתח האמיתי)
    flow.fetch_token(code=code)
    credentials = flow.credentials

    # שמירת הטוקנים בטבלה של המשתמש ב-DynamoDB
    users_table.update_item(
        Key={'username': user_id},
        UpdateExpression="set google_tokens = :t",
        ExpressionAttributeValues={
            ':t': {
                'access_token': credentials.token,
                'refresh_token': credentials.refresh_token,
                'token_uri': credentials.token_uri,
                'client_id': credentials.client_id,
                'client_secret': credentials.client_secret,
                'scopes': credentials.scopes
            }
        }
    )

    # בסיום, החזרת המשתמש לאתר שלך
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
    return HTMLResponse(content=f"""
        <!DOCTYPE html>
        <html>
            <head>
                <title>Google Calendar Connected</title>
                <meta charset="UTF-8">
                <style>
                    * {{ margin: 0; padding: 0; box-sizing: border-box; }}
                    body {{ 
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        height: 100vh;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: #1e293b;
                    }}
                    .card {{ 
                        background: white;
                        padding: 48px;
                        border-radius: 20px;
                        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                        text-align: center;
                        max-width: 500px;
                        width: 90%;
                    }}
                    .success-icon {{
                        width: 80px;
                        height: 80px;
                        margin: 0 auto 24px;
                        background: #10b981;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 40px;
                        color: white;
                    }}
                    h1 {{ 
                        color: #1e293b;
                        font-size: 28px;
                        margin-bottom: 12px;
                        font-weight: 600;
                    }}
                    p {{
                        color: #64748b;
                        font-size: 16px;
                        margin-bottom: 8px;
                    }}
                    .spinner {{
                        border: 3px solid #f3f4f6;
                        border-top: 3px solid #3b82f6;
                        border-radius: 50%;
                        width: 40px;
                        height: 40px;
                        animation: spin 1s linear infinite;
                        margin: 24px auto;
                    }}
                    @keyframes spin {{
                        0% {{ transform: rotate(0deg); }}
                        100% {{ transform: rotate(360deg); }}
                    }}
                    .redirect-text {{
                        color: #64748b;
                        font-size: 14px;
                        margin-top: 16px;
                    }}
                </style>
            </head>
            <body>
                <div class="card">
                    <div class="success-icon">✓</div>
                    <h1>Google Calendar Connected!</h1>
                    <p>Your Google Calendar is now synced with your account.</p>
                    <div class="spinner"></div>
                    <p class="redirect-text">Redirecting you back to the dashboard...</p>
                </div>
                <script>
                    // Try to close if opened in popup, otherwise redirect
                    if (window.opener) {{
                        // Opened in popup - close it and refresh parent
                        window.opener.location.reload();
                        window.close();
                    }} else {{
                        // Opened in same window - redirect
                        setTimeout(function() {{
                            window.location.href = "{frontend_url}";
                        }}, 1500);
                    }}
                </script>
            </body>
        </html>
    """)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8000)