"""
AutoWorth AI — Admin Router
All endpoints require ADMIN role.
GET  /api/v1/admin/stats
GET  /api/v1/admin/users
GET  /api/v1/admin/model-versions
POST /api/v1/admin/model-versions/{id}/activate
"""
from datetime import date, datetime, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from ..database import get_db
from ..dependencies import get_admin_user
from ..models import User, Valuation, Vehicle, ModelVersion
from ..schemas import AdminStatsResponse, ModelVersionResponse, UserResponse, MessageResponse
from ..ml.model_loader import model_loader

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/stats", response_model=AdminStatsResponse)
def get_admin_stats(
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    total_users = db.query(User).count()
    total_valuations = db.query(Valuation).count()
    total_vehicles = db.query(Vehicle).count()

    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    predictions_today = (
        db.query(Valuation)
        .filter(Valuation.created_at >= today_start)
        .count()
    )

    avg_pred = db.query(func.avg(Valuation.predicted_price)).scalar() or 0

    most_valued = (
        db.query(Vehicle.brand, func.avg(Valuation.predicted_price).label("avg"))
        .join(Valuation, Vehicle.id == Valuation.vehicle_id)
        .group_by(Vehicle.brand)
        .order_by(func.avg(Valuation.predicted_price).desc())
        .first()
    )
    most_valued_brand = most_valued[0] if most_valued else "N/A"

    most_popular = (
        db.query(Vehicle.brand, Vehicle.model, func.count(Valuation.id).label("cnt"))
        .join(Valuation, Vehicle.id == Valuation.vehicle_id)
        .group_by(Vehicle.brand, Vehicle.model)
        .order_by(func.count(Valuation.id).desc())
        .first()
    )
    most_popular_vehicle = f"{most_popular[0]} {most_popular[1]}" if most_popular else "N/A"

    active_model = db.query(ModelVersion).filter(ModelVersion.is_active == True).first()
    active_version = active_model.version if active_model else (
        model_loader.metadata.get("version") if model_loader.is_ready else None
    )

    return AdminStatsResponse(
        total_users=total_users,
        total_valuations=total_valuations,
        total_vehicles=total_vehicles,
        predictions_today=predictions_today,
        avg_predicted_value=float(avg_pred),
        most_valued_brand=most_valued_brand,
        most_popular_vehicle=most_popular_vehicle,
        active_model_version=active_version,
        system_health={
            "model_loaded": model_loader.is_ready,
            "database": "healthy",
            "api": "healthy",
        },
    )


@router.get("/users", response_model=List[UserResponse])
def list_users(
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    return db.query(User).order_by(User.created_at.desc()).all()


@router.get("/model-versions", response_model=List[ModelVersionResponse])
def list_model_versions(
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    return db.query(ModelVersion).order_by(ModelVersion.trained_at.desc()).all()


@router.post("/model-versions/{version_id}/activate", response_model=MessageResponse)
def activate_model_version(
    version_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    version = db.query(ModelVersion).filter(ModelVersion.id == version_id).first()
    if not version:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Model version not found")

    # Deactivate all others
    db.query(ModelVersion).update({"is_active": False})
    version.is_active = True
    db.commit()
    return MessageResponse(message=f"Model version {version.version} activated.")


@router.get("/model-info")
def get_model_info(_: User = Depends(get_admin_user)):
    """Return current in-memory model metadata."""
    if not model_loader.is_ready:
        return {"loaded": False, "message": "Model not loaded"}
    return {"loaded": True, **model_loader.metadata}
