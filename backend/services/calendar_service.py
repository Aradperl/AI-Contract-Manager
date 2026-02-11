"""
Create and delete Google Calendar reminder events using stored OAuth tokens.
"""
import json
from datetime import datetime, timedelta
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build


def _get_calendar_service(token_dict):
    """Build Calendar API v3 service from stored token dict. Refreshes token if expired."""
    if not token_dict or not token_dict.get("refresh_token"):
        return None
    creds = Credentials(
        token=token_dict.get("access_token"),
        refresh_token=token_dict.get("refresh_token"),
        token_uri=token_dict.get("token_uri", "https://oauth2.googleapis.com/token"),
        client_id=token_dict.get("client_id"),
        client_secret=token_dict.get("client_secret"),
    )
    if creds.expired and creds.refresh_token:
        creds.refresh(Request())
    return build("calendar", "v3", credentials=creds)


def _parse_expiry(analysis):
    """Extract expiry date from contract analysis (JSON or dict). Return date or None."""
    if not analysis:
        return None
    try:
        data = analysis if isinstance(analysis, dict) else json.loads(analysis)
        expiry = data.get("expiry_date") or data.get("expiry")
        if not expiry or expiry == "N/A":
            return None
        return datetime.strptime(expiry[:10], "%Y-%m-%d").date()
    except (TypeError, ValueError, json.JSONDecodeError):
        return None


def _reminder_date(expiry_date, setting):
    """Return the date to put the reminder event on (all-day event on that date). expiry_date must be a date."""
    if isinstance(expiry_date, str):
        try:
            expiry_date = datetime.strptime(expiry_date[:10], "%Y-%m-%d").date()
        except (ValueError, TypeError):
            return None
    if setting == "week":
        return expiry_date - timedelta(days=7)
    if setting == "month":
        return expiry_date - timedelta(days=30)
    return None


def create_or_update_reminder_event(service, contract_id, party_name, expiry_date, setting, existing_event_id=None):
    """
    Create a Google Calendar all-day event for the reminder, or update/delete if needed.
    expiry_date can be a date or an ISO date string.
    Returns (event_id, None) on success, or (None, error_message) on failure.
    """
    if isinstance(expiry_date, str):
        try:
            expiry_date = datetime.strptime(expiry_date[:10], "%Y-%m-%d").date()
        except (ValueError, TypeError):
            return None, "Invalid expiry date"
    reminder_d = _reminder_date(expiry_date, setting)
    if not reminder_d:
        return None, "Invalid reminder setting"
    # Avoid past reminder dates
    if reminder_d <= datetime.now().date():
        reminder_d = datetime.now().date() + timedelta(days=1)
    start = reminder_d.isoformat()
    end = (reminder_d + timedelta(days=1)).isoformat()
    expiry_str = expiry_date.isoformat() if hasattr(expiry_date, "isoformat") else str(expiry_date)
    when_label = "1 week" if setting == "week" else "1 month"
    title = f"LegalVault – Contract expiring: {party_name} on {expiry_str}"
    description = (
        f"Contract with {party_name} expires on {expiry_str}. "
        f"This reminder was set for {when_label} before the expiry date. "
        "Open LegalVault to review the contract or renew."
    )
    body = {
        "summary": title,
        "description": description,
        "start": {"date": start},
        "end": {"date": end},
    }
    try:
        if existing_event_id:
            event = service.events().update(calendarId="primary", eventId=existing_event_id, body=body).execute()
        else:
            event = service.events().insert(calendarId="primary", body=body).execute()
        return event.get("id"), None
    except Exception as e:
        return None, str(e)


def delete_reminder_event(service, event_id):
    """Delete a calendar event. Returns None on success, error message on failure."""
    if not event_id:
        return None
    try:
        service.events().delete(calendarId="primary", eventId=event_id).execute()
        return None
    except Exception as e:
        return str(e)
