"""
AutoWorth AI — Vehicles Router
GET /api/v1/vehicles
GET /api/v1/vehicles/{id}
POST /api/v1/vehicles (admin only)
"""
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import get_current_active_user, get_admin_user
from ..models import User, Vehicle
from ..schemas import VehicleResponse, VehicleCreate, PaginatedResponse

router = APIRouter(prefix="/vehicles", tags=["Vehicles"])


@router.get("", response_model=PaginatedResponse)
def list_vehicles(
    brand: Optional[str] = Query(None),
    model: Optional[str] = Query(None),
    fuel_type: Optional[str] = Query(None),
    transmission: Optional[str] = Query(None),
    year_min: Optional[int] = Query(None),
    year_max: Optional[int] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_active_user),
):
    query = db.query(Vehicle)
    if brand:
        query = query.filter(Vehicle.brand.ilike(f"%{brand}%"))
    if model:
        query = query.filter(Vehicle.model.ilike(f"%{model}%"))
    if fuel_type:
        query = query.filter(Vehicle.fuel_type == fuel_type)
    if transmission:
        query = query.filter(Vehicle.transmission == transmission)
    if year_min:
        query = query.filter(Vehicle.year >= year_min)
    if year_max:
        query = query.filter(Vehicle.year <= year_max)

    total = query.count()
    items = query.offset((page - 1) * page_size).limit(page_size).all()
    return PaginatedResponse(
        items=[VehicleResponse.model_validate(v) for v in items],
        total=total,
        page=page,
        page_size=page_size,
        pages=(total + page_size - 1) // page_size,
    )


@router.get("/{vehicle_id}", response_model=VehicleResponse)
def get_vehicle(
    vehicle_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_active_user),
):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found")
    return vehicle


@router.post("", response_model=VehicleResponse, status_code=status.HTTP_201_CREATED)
def create_vehicle(
    payload: VehicleCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    vehicle = Vehicle(**payload.model_dump())
    db.add(vehicle)
    db.commit()
    db.refresh(vehicle)
    return vehicle
