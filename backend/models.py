from pydantic import BaseModel
from typing import Optional

class ReminderUpdate(BaseModel):
    contract_id: str
    user_id: Optional[str] = None  # ignored; user from JWT
    reminder_setting: str

class UserLogin(BaseModel):
    username: str
    password: str