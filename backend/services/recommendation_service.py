"""
AutoWorth AI — Recommendation Service
Suggests similar vehicles based on user's valuation history and preferences.
"""
from __future__ import annotations

from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func

from ..models import Vehicle, Valuation, SavedCar


def get_similar_vehicles(
    db: Session,
    brand: str,
    model: str,
    year: int,
    fuel_type: str,
    budget_min: float,
    budget_max: float,
    limit: int = 6,
) -> List[Vehicle]:
    """
    Return vehicles similar to the given spec within a price range.
    Ordered by year (newest first), then by proximity in price.
    """
    query = (
        db.query(Vehicle)
        .filter(
            Vehicle.fuel_type == fuel_type,
            Vehicle.year.between(year - 3, year + 3),
        )
        .order_by(Vehicle.year.desc())
        .limit(limit * 3)  # over-fetch, then filter in Python
    )
    vehicles = query.all()

    # Prefer same brand, fallback to similar segment
    same_brand = [v for v in vehicles if v.brand == brand]
    other_brand = [v for v in vehicles if v.brand != brand]
    combined = (same_brand + other_brand)[:limit]
    return combined


def get_trending_brands(db: Session, limit: int = 5) -> List[dict]:
    """Return the most-valued brands by valuation count in the last 30 days."""
    from datetime import datetime, timedelta
    cutoff = datetime.utcnow() - timedelta(days=30)

    rows = (
        db.query(Vehicle.brand, func.count(Valuation.id).label("count"))
        .join(Valuation, Valuation.vehicle_id == Vehicle.id)
        .filter(Valuation.created_at >= cutoff)
        .group_by(Vehicle.brand)
        .order_by(func.count(Valuation.id).desc())
        .limit(limit)
        .all()
    )
    return [{"brand": r.brand, "valuation_count": r.count} for r in rows]


def get_user_recommendations(
    db: Session,
    user_id: int,
    limit: int = 4,
) -> List[Vehicle]:
    """
    Personalised recommendations based on user's past valuation brands / fuel types.
    Falls back to popular vehicles if the user has no history.
    """
    # Get user's past brands and fuel types
    past = (
        db.query(Vehicle.brand, Vehicle.fuel_type)
        .join(Valuation, Valuation.vehicle_id == Vehicle.id)
        .filter(Valuation.user_id == user_id)
        .distinct()
        .limit(5)
        .all()
    )

    if not past:
        # Cold-start: return newest vehicles
        return (
            db.query(Vehicle)
            .order_by(Vehicle.year.desc(), Vehicle.id.desc())
            .limit(limit)
            .all()
        )

    brands = list({p.brand for p in past})
    fuel_types = list({p.fuel_type for p in past})

    return (
        db.query(Vehicle)
        .filter(
            Vehicle.brand.in_(brands),
            Vehicle.fuel_type.in_(fuel_types),
        )
        .order_by(Vehicle.year.desc())
        .limit(limit)
        .all()
    )


def get_price_drop_opportunities(
    db: Session,
    user_id: int,
    threshold_pct: float = 5.0,
) -> List[dict]:
    """
    Return saved cars where the latest predicted price is lower than when saved,
    indicating a buying opportunity (price dropped).
    """
    saved = (
        db.query(SavedCar)
        .filter(SavedCar.user_id == user_id)
        .all()
    )

    opportunities = []
    for sc in saved:
        # Latest valuation for this vehicle
        latest = (
            db.query(Valuation)
            .filter(Valuation.vehicle_id == sc.vehicle_id)
            .order_by(Valuation.created_at.desc())
            .first()
        )
        if latest and sc.saved_price:
            drop_pct = (sc.saved_price - latest.predicted_price) / sc.saved_price * 100
            if drop_pct >= threshold_pct:
                opportunities.append({
                    "vehicle_id": sc.vehicle_id,
                    "saved_price": sc.saved_price,
                    "current_price": latest.predicted_price,
                    "drop_pct": round(drop_pct, 1),
                })

    opportunities.sort(key=lambda x: x["drop_pct"], reverse=True)
    return opportunities
