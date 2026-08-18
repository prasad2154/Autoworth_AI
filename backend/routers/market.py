"""
AutoWorth AI — Market Router
GET /api/v1/market-summary
GET /api/v1/market/brands
GET /api/v1/market/cities
POST /api/v1/compare
"""
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from ..database import get_db
from ..dependencies import get_current_active_user
from ..models import User, Valuation, Vehicle, MarketData
from ..schemas import MarketSummaryResponse
from ..ml.predictor import predict
from ..ml.model_loader import model_loader

router = APIRouter(tags=["Market"])

BRANDS = [
    "Maruti Suzuki", "Hyundai", "Tata", "Mahindra", "Honda",
    "Toyota", "Kia", "Renault", "Volkswagen", "Skoda",
    "Ford", "MG", "Jeep", "Nissan",
    "Mercedes-Benz", "BMW", "Audi",
]

CITIES = [
    "Mumbai", "Delhi", "Bangalore", "Chennai", "Hyderabad",
    "Pune", "Kolkata", "Ahmedabad", "Jaipur", "Lucknow",
    "Surat", "Bhopal", "Indore", "Nagpur", "Chandigarh",
]


@router.get("/market-summary", response_model=MarketSummaryResponse)
def get_market_summary(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_active_user),
):
    """Aggregate market statistics from valuation history."""
    total = db.query(Valuation).count()
    avg_price = db.query(func.avg(Valuation.predicted_price)).scalar() or 0
    median_result = (
        db.query(Valuation.predicted_price)
        .order_by(Valuation.predicted_price)
        .all()
    )
    prices = [r[0] for r in median_result if r[0]]
    median_price = float(prices[len(prices) // 2]) if prices else 0

    # Brand distribution from vehicles
    brand_counts = (
        db.query(Vehicle.brand, func.count(Valuation.id).label("count"))
        .join(Valuation, Vehicle.id == Valuation.vehicle_id)
        .group_by(Vehicle.brand)
        .order_by(func.count(Valuation.id).desc())
        .limit(10)
        .all()
    )
    brand_dist = [{"brand": b, "count": c} for b, c in brand_counts]
    most_popular_brand = brand_dist[0]["brand"] if brand_dist else "Maruti Suzuki"

    # Model distribution
    model_counts = (
        db.query(Vehicle.model, func.count(Valuation.id).label("count"))
        .join(Valuation, Vehicle.id == Valuation.vehicle_id)
        .group_by(Vehicle.model)
        .order_by(func.count(Valuation.id).desc())
        .first()
    )
    most_popular_model = model_counts[0] if model_counts else "Swift"

    # Fuel distribution
    fuel_counts = (
        db.query(Vehicle.fuel_type, func.count(Valuation.id).label("count"))
        .join(Valuation, Vehicle.id == Valuation.vehicle_id)
        .group_by(Vehicle.fuel_type)
        .all()
    )
    fuel_dist = [{"fuel_type": f, "count": c} for f, c in fuel_counts]

    # Price range distribution
    price_ranges = [
        {"range": "< ₹3L", "min": 0, "max": 300000},
        {"range": "₹3L–₹5L", "min": 300000, "max": 500000},
        {"range": "₹5L–₹8L", "min": 500000, "max": 800000},
        {"range": "₹8L–₹12L", "min": 800000, "max": 1200000},
        {"range": "₹12L–₹20L", "min": 1200000, "max": 2000000},
        {"range": "> ₹20L", "min": 2000000, "max": 999999999},
    ]
    price_range_dist = []
    for pr in price_ranges:
        count = (
            db.query(func.count(Valuation.id))
            .filter(Valuation.predicted_price >= pr["min"], Valuation.predicted_price < pr["max"])
            .scalar()
            or 0
        )
        price_range_dist.append({"range": pr["range"], "count": count})

    avg_km = db.query(func.avg(Valuation.km_driven)).scalar() or 0

    return MarketSummaryResponse(
        total_listings=total,
        average_price=float(avg_price),
        median_price=float(median_price),
        price_trend=-3.2,  # Would be calculated from time-series in production
        most_popular_brand=most_popular_brand,
        most_popular_model=most_popular_model,
        avg_km_driven=float(avg_km),
        brand_distribution=brand_dist,
        fuel_distribution=fuel_dist,
        price_range_distribution=price_range_dist,
    )


@router.get("/market/brands")
def get_brands(_: User = Depends(get_current_active_user)):
    return {"brands": BRANDS}


@router.get("/market/cities")
def get_cities(_: User = Depends(get_current_active_user)):
    return {"cities": CITIES}


@router.post("/compare")
def compare_vehicles(
    vehicle_ids: List[int],
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Compare up to 3 vehicles side-by-side."""
    if len(vehicle_ids) > 3:
        vehicle_ids = vehicle_ids[:3]

    vehicles = db.query(Vehicle).filter(Vehicle.id.in_(vehicle_ids)).all()
    results = []
    for v in vehicles:
        # Get most recent valuation for this vehicle
        latest_val = (
            db.query(Valuation)
            .filter(Valuation.vehicle_id == v.id)
            .order_by(Valuation.created_at.desc())
            .first()
        )
        results.append({
            "vehicle": {
                "id": v.id,
                "brand": v.brand,
                "model": v.model,
                "year": v.year,
                "fuel_type": v.fuel_type,
                "transmission": v.transmission,
                "engine_cc": v.engine_cc,
                "mileage": v.mileage,
                "seating_capacity": v.seating_capacity,
            },
            "valuation": {
                "predicted_price": latest_val.predicted_price if latest_val else None,
                "deal_score": latest_val.deal_score if latest_val else None,
                "confidence": latest_val.confidence if latest_val else None,
                "market_status": latest_val.market_status if latest_val else None,
                "km_driven": latest_val.km_driven if latest_val else None,
                "condition_score": latest_val.condition_score if latest_val else None,
            } if latest_val else None,
        })

    return {"comparisons": results}
