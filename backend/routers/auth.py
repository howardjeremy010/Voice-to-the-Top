import secrets

from fastapi import APIRouter, Depends, HTTPException, Request, Response

from lib.auth import COOKIE, COOKIE_SECURE, get_current_user, verify_password
from lib.db import db
from lib.tickets import now
from models.schemas import LoginIn, User

router = APIRouter(prefix="/auth")


@router.post("/login", response_model=User)
async def login(body: LoginIn, response: Response):
    user = await db.users.find_one({"email": body.email.strip().lower()}, {"_id": 0})
    if not user or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Email atau kata sandi tidak sesuai")
    token = secrets.token_urlsafe(32)
    await db.sessions.insert_one({"token": token, "user_id": user["id"], "created_at": now()})
    response.set_cookie(COOKIE, token, httponly=True, samesite="lax", secure=COOKIE_SECURE, max_age=60 * 60 * 24 * 7, path="/")
    return User(**user)


@router.post("/logout")
async def logout(request: Request, response: Response):
    token = request.cookies.get(COOKIE)
    if token:
        await db.sessions.delete_one({"token": token})
    response.delete_cookie(COOKIE, path="/")
    return {"ok": True}


@router.get("/me", response_model=User)
async def me(user: dict = Depends(get_current_user)):
    return User(**user)
