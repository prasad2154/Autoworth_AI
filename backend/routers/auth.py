"""
AutoWorth AI — Auth Router
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/logout
POST /api/v1/auth/forgot-password
POST /api/v1/auth/reset-password
GET  /api/v1/auth/me
"""
from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import create_access_token, get_current_active_user
from ..models import User
from ..schemas import (
    RegisterRequest, LoginRequest, TokenResponse,
    ForgotPasswordRequest, ResetPasswordRequest, UserResponse, MessageResponse
)
from ..services import auth_service
from ..config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    existing = auth_service.get_user_by_email(db, payload.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )
    auth_service.create_user(db, payload.full_name, payload.email, payload.password)
    return MessageResponse(message="Account created successfully. Please log in.")


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = auth_service.authenticate_user(db, payload.email, payload.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    expire = timedelta(days=7) if payload.remember_me else timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    token = create_access_token({"sub": str(user.id), "role": user.role}, expires_delta=expire)
    return TokenResponse(
        access_token=token,
        expires_in=int(expire.total_seconds()),
    )


@router.post("/logout", response_model=MessageResponse)
def logout(current_user: User = Depends(get_current_active_user)):
    # JWT is stateless — client discards the token.
    # For server-side revocation, a token blacklist/Redis layer can be added.
    return MessageResponse(message="Logged out successfully.")


@router.post("/forgot-password", response_model=MessageResponse)
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = auth_service.get_user_by_email(db, payload.email)
    if user:
        token = auth_service.set_reset_token(db, user)
        # In production: send email with reset link containing token
        # For now: token is stored in DB, reset via /reset-password
    # Always return the same message — never expose whether email exists
    return MessageResponse(
        message="If an account exists for this email, password reset instructions have been sent."
    )


@router.post("/reset-password", response_model=MessageResponse)
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    user = auth_service.verify_reset_token(db, payload.token)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token",
        )
    auth_service.reset_password(db, user, payload.new_password)
    return MessageResponse(message="Password reset successfully. Please log in.")


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_active_user)):
    return current_user
