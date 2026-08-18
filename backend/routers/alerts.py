"""
AutoWorth AI — Alerts Router
POST   /api/v1/alerts
GET    /api/v1/alerts
PATCH  /api/v1/alerts/{id}
DELETE /api/v1/alerts/{id}
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..dependencies import get_current_active_user
from ..models import User, PriceAlert, Vehicle
from ..schemas import CreateAlertRequest, AlertResponse, UpdateAlertRequest, MessageResponse

router = APIRouter(prefix="/alerts", tags=["Price Alerts"])


@router.post("", response_model=AlertResponse, status_code=status.HTTP_201_CREATED)
def create_alert(
    payload: CreateAlertRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    vehicle = db.query(Vehicle).filter(Vehicle.id == payload.vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found")

    alert = PriceAlert(
        user_id=current_user.id,
        vehicle_id=payload.vehicle_id,
        target_price=payload.target_price,
        percentage_change=payload.percentage_change,
        alert_type=payload.alert_type,
        is_active=True,
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return alert


@router.get("", response_model=List[AlertResponse])
def get_alerts(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    return db.query(PriceAlert).filter(PriceAlert.user_id == current_user.id).all()


@router.patch("/{alert_id}", response_model=AlertResponse)
def update_alert(
    alert_id: int,
    payload: UpdateAlertRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    alert = db.query(PriceAlert).filter(
        PriceAlert.id == alert_id, PriceAlert.user_id == current_user.id
    ).first()
    if not alert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found")
    if payload.is_active is not None:
        alert.is_active = payload.is_active
    if payload.target_price is not None:
        alert.target_price = payload.target_price
    if payload.percentage_change is not None:
        alert.percentage_change = payload.percentage_change
    db.commit()
    db.refresh(alert)
    return alert


@router.delete("/{alert_id}", response_model=MessageResponse)
def delete_alert(
    alert_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    alert = db.query(PriceAlert).filter(
        PriceAlert.id == alert_id, PriceAlert.user_id == current_user.id
    ).first()
    if not alert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found")
    db.delete(alert)
    db.commit()
    return MessageResponse(message="Alert deleted successfully.")
