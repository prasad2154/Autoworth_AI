"""
AutoWorth AI — Market Service
"""
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..models import Valuation, Vehicle, MarketData


def get_market_average(db: Session, brand: str, model: str, year: int, fuel_type: str) -> Optional[float]:
    """Get average predicted price for similar vehicles."""
    result = (
        db.query(func.avg(Valuation.predicted_price))
        .join(Vehicle, Valuation.vehicle_id == Vehicle.id)
        .filter(
            Vehicle.brand == brand,
            Vehicle.fuel_type == fuel_type,
            Vehicle.year.between(year - 2, year + 2),
        )
        .scalar()
    )
    return float(result) if result else None
