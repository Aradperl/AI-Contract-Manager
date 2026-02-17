from fastapi import APIRouter, Depends, Form, HTTPException
from config import users_table
from services.auth_service import get_password_hash, verify_password, create_access_token
from deps import get_current_user

router = APIRouter(tags=["Authentication"])


@router.post("/signup")
async def signup(username: str = Form(...), password: str = Form(...), email: str = Form(...)):
    if "Item" in users_table.get_item(Key={"username": username}):
        raise HTTPException(status_code=400, detail="User exists")
    users_table.put_item(Item={"username": username, "password": get_password_hash(password), "email": email})
    return {"status": "success"}


@router.post("/login")
async def login(username: str = Form(...), password: str = Form(...)):
    res = users_table.get_item(Key={"username": username})
    if "Item" not in res or not verify_password(password, res["Item"]["password"]):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    access_token = create_access_token(data={"sub": username})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "username": username,
    }


@router.get("/check-google-connection")
async def check_google_connection(current_user: str = Depends(get_current_user)):
    res = users_table.get_item(Key={"username": current_user})
    item = res.get("Item", {})
    return {"connected": "google_tokens" in item, "picture_url": item.get("picture_url")}