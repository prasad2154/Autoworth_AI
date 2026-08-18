"""
AutoWorth AI — Prediction Router
POST /api/v1/predict
POST /api/v1/valuation
POST /api/v1/simulation
POST /api/v1/negotiation
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import json

from ..database import get_db
from ..dependencies import get_current_active_user
from ..models import User, Valuation
from ..schemas import (
    PredictionRequest, PredictionResponse,
    SimulationRequest, SimulationResponse,
    NegotiationRequest, NegotiationResponse,
    ValuationHistoryItem, MessageResponse, PaginatedResponse, SHAPFeature,
)
from ..services.prediction_service import run_full_prediction
from ..ml.predictor import predict, generate_depreciation_curve
from ..ml.model_loader import model_loader

router = APIRouter(tags=["Prediction"])


@router.post("/predict", response_model=PredictionResponse)
def predict_price(
    payload: PredictionRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Full AI prediction with SHAP, deal score, depreciation, and comparables."""
    try:
        result = run_full_prediction(payload.model_dump(), db, current_user.id)
        shap_features = [SHAPFeature(**f) for f in result["shap_features"]]
        return PredictionResponse(
            predicted_price=result["predicted_price"],
            lower_bound=result["lower_bound"],
            upper_bound=result["upper_bound"],
            confidence=result["confidence"],
            market_average=result["market_average"],
            recommended_listing_price=result["recommended_listing_price"],
            deal_score=result["deal_score"],
            market_status=result["market_status"],
            shap_features=shap_features,
            depreciation_curve=result["depreciation_curve"],
            comparable_vehicles=result["comparable_vehicles"],
            ai_recommendation=result["ai_recommendation"],
            model_version=result["model_version"],
            valuation_id=result["valuation_id"],
        )
    except RuntimeError as e:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Prediction failed: {str(e)}")


@router.post("/simulation", response_model=SimulationResponse)
def run_simulation(
    payload: SimulationRequest,
    current_user: User = Depends(get_current_active_user),
):
    """What-if simulator — run multiple scenarios without saving."""
    results = []
    base = payload.model_dump()
    for scenario in payload.scenarios:
        scenario_data = {**base, **scenario}
        try:
            r = predict(scenario_data)
            results.append({
                **scenario,
                "predicted_price": r["predicted_price"],
                "lower_bound": r["lower_bound"],
                "upper_bound": r["upper_bound"],
            })
        except Exception as e:
            results.append({**scenario, "error": str(e)})

    return SimulationResponse(scenarios=results)


@router.post("/negotiation", response_model=NegotiationResponse)
def get_negotiation_advice(
    payload: NegotiationRequest,
    current_user: User = Depends(get_current_active_user),
):
    """Generate negotiation strategy based on asking vs predicted price."""
    diff = payload.asking_price - payload.predicted_price
    diff_pct = (diff / payload.predicted_price) * 100

    if diff_pct > 15:
        assessment = "The asking price is significantly above our estimated fair value."
        suggested = round(payload.predicted_price * 0.97, 2)
        tips = [
            f"Open negotiations at ₹{round(payload.predicted_price * 0.93 / 100000, 2)}L — well below asking.",
            "Highlight comparable vehicles available at lower prices.",
            "Request a full service history and independent inspection.",
            "Mention specific depreciation factors to justify your lower offer.",
            "Be prepared to walk away — alternatives exist at fair value.",
        ]
        walk_away = round(payload.predicted_price * 1.05, 2)
    elif diff_pct > 5:
        assessment = "The asking price is slightly above fair market value — negotiation is recommended."
        suggested = round(payload.predicted_price * 0.99, 2)
        tips = [
            f"Counter-offer at ₹{round(payload.predicted_price * 0.97 / 100000, 2)}L.",
            "Request complementary accessories or extended warranty as part of the deal.",
            "Use our AI fair range as your negotiation anchor.",
            "Check if the seller is motivated — recent relisting or days on market.",
        ]
        walk_away = round(payload.predicted_price * 1.08, 2)
    else:
        assessment = "The asking price is within fair market range for this vehicle."
        suggested = round(payload.predicted_price * 1.01, 2)
        tips = [
            "This is a reasonably priced vehicle — negotiate for add-ons, not price.",
            "Request a thorough inspection before finalizing.",
            "Verify ownership documents and clear any outstanding loans.",
        ]
        walk_away = round(payload.predicted_price * 1.12, 2)

    return NegotiationResponse(
        assessment=assessment,
        suggested_offer=suggested,
        negotiation_tips=tips,
        walk_away_price=walk_away,
        fair_range={
            "min": payload.predicted_price * 0.93,
            "max": payload.predicted_price * 1.07,
        },
    )


@router.get("/valuations", response_model=PaginatedResponse)
def get_valuations(
    page: int = 1,
    page_size: int = 10,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Get the current user's valuation history."""
    query = (
        db.query(Valuation)
        .filter(Valuation.user_id == current_user.id)
        .order_by(Valuation.created_at.desc())
    )
    total = query.count()
    items = query.offset((page - 1) * page_size).limit(page_size).all()
    return PaginatedResponse(
        items=[ValuationHistoryItem.model_validate(v) for v in items],
        total=total,
        page=page,
        page_size=page_size,
        pages=(total + page_size - 1) // page_size,
    )


@router.get("/valuations/{valuation_id}", response_model=ValuationHistoryItem)
def get_valuation(
    valuation_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    valuation = (
        db.query(Valuation)
        .filter(Valuation.id == valuation_id, Valuation.user_id == current_user.id)
        .first()
    )
    if not valuation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Valuation not found")
    return valuation


@router.delete("/valuations/{valuation_id}", response_model=MessageResponse)
def delete_valuation(
    valuation_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    valuation = (
        db.query(Valuation)
        .filter(Valuation.id == valuation_id, Valuation.user_id == current_user.id)
        .first()
    )
    if not valuation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Valuation not found")
    db.delete(valuation)
    db.commit()
    return MessageResponse(message="Valuation deleted successfully.")
