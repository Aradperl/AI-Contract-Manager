import os
from fastapi import APIRouter, Depends, Form, HTTPException
from fastapi.responses import HTMLResponse
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from config import (
    users_table,
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    REDIRECT_URI,
    SCOPES,
)
from deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Google OAuth"])


@router.get("/google")
async def auth_google(current_user: str = Depends(get_current_user)):
    flow = Flow.from_client_config(
        {"web": {"client_id": GOOGLE_CLIENT_ID, "client_secret": GOOGLE_CLIENT_SECRET,
                 "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                 "token_uri": "https://oauth2.googleapis.com/token"}},
        scopes=SCOPES
    )
    flow.redirect_uri = REDIRECT_URI
    auth_url, _ = flow.authorization_url(
        prompt="consent", access_type="offline", state=current_user
    )
    return {"url": auth_url}

@router.get("/callback")
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
            ':t': {'access_token': creds.token, 'refresh_token': creds.refresh_token,
                   'token_uri': creds.token_uri, 'client_id': GOOGLE_CLIENT_ID,
                   'client_secret': GOOGLE_CLIENT_SECRET, 'scopes': creds.scopes},
            ':p': user_info.get('picture')
        }
    )

    return HTMLResponse(content=f"""
        <html>
            <body style="font-family: sans-serif; text-align: center; padding-top: 100px;">
                <h1 style="color: #6366f1;">Connected Successfully!</h1>
                <p>LegalVault is now synced with your Google Calendar.</p>
                <script>
                    window.opener.postMessage("google-success", "*");
                    setTimeout(() => window.close(), 1000);
                </script>
            </body>
        </html>
    """)

@router.post("/disconnect-google")
async def disconnect(current_user: str = Depends(get_current_user)):
    users_table.update_item(
        Key={"username": current_user},
        UpdateExpression="remove google_tokens, picture_url",
    )
    return {"status": "success"}