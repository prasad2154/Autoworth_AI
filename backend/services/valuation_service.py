"""
AutoWorth AI — Valuation Service
"""
from sqlalchemy.orm import Session
from ..models import Valuation, User
from typing import List


def get_user_valuations(db: Session, user_id: int, limit: int = 5) -> List[Valuation]:
    return (
        db.query(Valuation)
        .filter(Valuation.user_id == user_id)
        .order_by(Valuation.created_at.desc())
        .limit(limit)
        .all()
    )


def get_total_user_valuations(db: Session, user_id: int) -> int:
    return db.query(Valuation).filter(Valuation.user_id == user_id).count()
