"""
AutoWorth AI — Users Router
GET    /api/v1/users/profile
PATCH  /api/v1/users/profile
POST   /api/v1/users/change-password
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import get_current_active_user
from ..models import User
from ..schemas import UserResponse, UpdateProfileRequest, ChangePasswordRequest, MessageResponse
from ..services import auth_service

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/profile", response_model=UserResponse)
def get_profile(current_user: User = Depends(get_current_active_user)):
    return current_user


@router.patch("/profile", response_model=UserResponse)
def update_profile(
    payload: UpdateProfileRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    updated = auth_service.update_profile(db, current_user, payload.full_name, payload.profile_image)
    return updated


@router.post("/change-password", response_model=MessageResponse)
def change_password(
    payload: ChangePasswordRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    if not auth_service.verify_password(payload.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect",
        )
    auth_service.reset_password(db, current_user, payload.new_password)
    return MessageResponse(message="Password changed successfully.")
