"""
AutoWorth AI — Saved Cars Router
POST   /api/v1/saved-cars
GET    /api/v1/saved-cars
DELETE /api/v1/saved-cars/{id}
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import get_current_active_user
from ..models import User, SavedCar, Vehicle
from ..schemas import SavedCarResponse, SaveCarRequest, MessageResponse

router = APIRouter(prefix="/saved-cars", tags=["Saved Cars"])


@router.post("", response_model=SavedCarResponse, status_code=status.HTTP_201_CREATED)
def save_car(
    payload: SaveCarRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    vehicle = db.query(Vehicle).filter(Vehicle.id == payload.vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found")

    existing = db.query(SavedCar).filter(
        SavedCar.user_id == current_user.id,
        SavedCar.vehicle_id == payload.vehicle_id,
    ).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Car already saved")

    saved = SavedCar(user_id=current_user.id, vehicle_id=payload.vehicle_id)
    db.add(saved)
    db.commit()
    db.refresh(saved)
    return saved


@router.get("", response_model=List[SavedCarResponse])
def get_saved_cars(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    return db.query(SavedCar).filter(SavedCar.user_id == current_user.id).all()


@router.delete("/{saved_id}", response_model=MessageResponse)
def remove_saved_car(
    saved_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    saved = db.query(SavedCar).filter(
        SavedCar.id == saved_id, SavedCar.user_id == current_user.id
    ).first()
    if not saved:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Saved car not found")
    db.delete(saved)
    db.commit()
    return MessageResponse(message="Car removed from saved list.")
