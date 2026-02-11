import json
import os
import uuid
import fitz
from datetime import datetime
from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from boto3.dynamodb.conditions import Key
from config import s3_client, contracts_table, users_table
from services.ai_service import call_openai_analysis
from services.calendar_service import (
    _get_calendar_service,
    _parse_expiry,
    create_or_update_reminder_event,
    delete_reminder_event,
)

def _party_from_analysis(analysis):
    if not analysis:
        return "Contract"
    try:
        data = analysis if isinstance(analysis, dict) else json.loads(analysis)
        return (data.get("party") or "Contract").strip() or "Contract"
    except (TypeError, ValueError):
        return "Contract"


router = APIRouter(prefix="/contracts", tags=["Contracts"])


@router.post("/upload")
async def upload_contract(file: UploadFile = File(...), user_id: str = Form(...)):
    try:
        file_bytes = await file.read()
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        text = "".join([page.get_text() for page in doc])

        s3_client.put_object(Bucket=os.getenv("S3_BUCKET_NAME"), Key=f"{user_id}/{file.filename}", Body=file_bytes)

        analysis = call_openai_analysis(text)
        contract_id = str(uuid.uuid4())
        reminder_setting = "week"

        contracts_table.put_item(Item={
            "user_id": user_id,
            "contract_id": contract_id,
            "filename": file.filename,
            "analysis": analysis,
            "timestamp": datetime.now().isoformat(),
            "reminder_setting": reminder_setting,
        })

        expiry_date = _parse_expiry(analysis)
        if expiry_date:
            user_res = users_table.get_item(Key={"username": user_id})
            tokens = (user_res.get("Item") or {}).get("google_tokens")
            if tokens:
                service = _get_calendar_service(tokens)
                if service:
                    party_name = _party_from_analysis(analysis)
                    event_id, err = create_or_update_reminder_event(
                        service, contract_id, party_name, expiry_date, reminder_setting, None
                    )
                    if event_id:
                        contracts_table.update_item(
                            Key={"user_id": user_id, "contract_id": contract_id},
                            UpdateExpression="SET calendar_event_id = :e",
                            ExpressionAttributeValues={":e": event_id},
                        )

        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/")
async def get_contracts(user_id: str):
    res = contracts_table.query(KeyConditionExpression=Key('user_id').eq(user_id))
    return {"contracts": res.get('Items', [])}


@router.delete("/{contract_id}")
async def delete_contract(contract_id: str, user_id: str):
    res = contracts_table.get_item(Key={"user_id": user_id, "contract_id": contract_id})
    item = res.get("Item")
    if item:
        event_id = item.get("calendar_event_id")
        if event_id:
            user_res = users_table.get_item(Key={"username": user_id})
            tokens = (user_res.get("Item") or {}).get("google_tokens")
            if tokens:
                service = _get_calendar_service(tokens)
                if service:
                    delete_reminder_event(service, event_id)
    contracts_table.delete_item(Key={"user_id": user_id, "contract_id": contract_id})
    return {"status": "success"}