from pydantic import BaseModel

class ReminderUpdate(BaseModel):
    contract_id: str
    user_id: str
    reminder_setting: str

class UserLogin(BaseModel):
    username: str
    password: str