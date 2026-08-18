"""
AutoWorth AI — Prediction Service
Orchestrates ML prediction, SHAP explanation, deal scoring, and recommendations.
"""
from __future__ import annotations
import json
import math
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session

from ..models import Valuation, Vehicle
from ..ml.predictor import predict, generate_depreciation_curve
from ..ml.explainer import explain_prediction
from ..ml.model_loader import model_loader


BRANDS = [
    "Maruti Suzuki", "Hyundai", "Tata", "Mahindra", "Honda",
    "Toyota", "Kia", "Renault", "Volkswagen", "Skoda",
    "Ford", "MG", "Jeep", "Nissan", "Datsun",
    "Mercedes-Benz", "BMW", "Audi", "Volvo",
]

CITIES = [
    "Mumbai", "Delhi", "Bangalore", "Chennai", "Hyderabad",
    "Pune", "Kolkata", "Ahmedabad", "Jaipur", "Lucknow",
    "Surat", "Bhopal", "Indore", "Nagpur", "Chandigarh",
]


def calculate_deal_score(
    predicted_price: float,
    market_average: Optional[float],
    condition_score: float,
    km_driven: int,
    accident_history: bool,
    service_history: bool,
) -> float:
    """Compute a 0–100 deal score."""
    score = 50.0

    # Vs market average
    if market_average and market_average > 0:
        ratio = predicted_price / market_average
        if ratio < 0.9:
            score += 20
        elif ratio < 0.95:
            score += 10
        elif ratio > 1.1:
            score -= 20
        elif ratio > 1.05:
            score -= 10

    # Condition bonus
    score += (condition_score - 50) * 0.3

    # Mileage factor
    if km_driven < 30000:
        score += 10
    elif km_driven > 100000:
        score -= 10

    # History
    if not accident_history:
        score += 8
    else:
        score -= 15

    if service_history:
        score += 7
    else:
        score -= 5

    return max(0.0, min(100.0, round(score, 1)))


def determine_market_status(deal_score: float) -> str:
    if deal_score >= 70:
        return "Good Deal"
    elif deal_score >= 45:
        return "Fair Price"
    else:
        return "Overpriced"


def generate_ai_recommendation(
    deal_score: float,
    market_status: str,
    shap_features: List[Dict],
    predicted_price: float,
    lower: float,
    upper: float,
) -> str:
    positive = [f for f in shap_features if f["direction"] == "positive"][:2]
    negative = [f for f in shap_features if f["direction"] == "negative"][:2]

    pos_str = ", ".join([f["feature"] for f in positive]) if positive else "vehicle condition"
    neg_str = ", ".join([f["feature"] for f in negative]) if negative else "age and mileage"

    rec = (
        f"Based on our AI analysis, this vehicle is estimated at ₹{predicted_price/100000:.2f}L "
        f"with a fair market range of ₹{lower/100000:.2f}L–₹{upper/100000:.2f}L. "
    )

    if deal_score >= 70:
        rec += (
            f"Key value drivers include {pos_str}. "
            "This appears to be a strong deal — we recommend proceeding with a professional inspection "
            "before finalizing the purchase."
        )
    elif deal_score >= 45:
        rec += (
            f"Value is influenced positively by {pos_str}, "
            f"and negatively by {neg_str}. "
            "This is fairly priced for the market. Use the What-If Simulator to explore how "
            "different conditions affect value."
        )
    else:
        rec += (
            f"Value is reduced primarily by {neg_str}. "
            "This vehicle appears above fair market value. We recommend negotiating down "
            f"toward ₹{lower/100000:.2f}L, or exploring comparable vehicles."
        )

    return rec


def generate_comparable_vehicles(brand: str, predicted_price: float) -> List[Dict]:
    """Generate sample comparable listings."""
    import random
    random.seed(42)
    comparables = []
    other_brands = [b for b in BRANDS if b != brand][:4]
    for ob in other_brands:
        price_variation = random.uniform(0.85, 1.15)
        comparables.append({
            "brand": ob,
            "model": "Similar Model",
            "year": 2021,
            "km_driven": random.randint(20000, 80000),
            "price": round(predicted_price * price_variation, 2),
            "deal_score": round(random.uniform(55, 85), 1),
            "fuel_type": "Petrol",
        })
    return comparables


def run_full_prediction(
    data: Dict[str, Any],
    db: Session,
    user_id: int,
) -> Dict[str, Any]:
    """Full prediction pipeline: predict → explain → score → save."""

    # 1. ML prediction
    result = predict(data)
    pred_price = result["predicted_price"]
    lower = result["lower_bound"]
    upper = result["upper_bound"]
    confidence = result["confidence"]

    # 2. Market average (simplified: ±5% of prediction as proxy)
    market_average = pred_price * 1.03

    # 3. SHAP explanation
    shap_features = explain_prediction(result["X_transformed"], result["features_df"])

    # 4. Deal scoring
    deal_score = calculate_deal_score(
        pred_price, market_average,
        float(data.get("condition_score", 75)),
        int(data.get("km_driven", 0)),
        bool(data.get("accident_history", False)),
        bool(data.get("service_history", True)),
    )
    market_status = determine_market_status(deal_score)

    # 5. Recommended listing price (slightly above predicted)
    recommended_listing = round(pred_price * 1.04, 2)

    # 6. AI recommendation text
    ai_rec = generate_ai_recommendation(
        deal_score, market_status, shap_features, pred_price, lower, upper
    )

    # 7. Depreciation curve
    depreciation_curve = generate_depreciation_curve(data, pred_price)

    # 8. Comparable vehicles
    comparables = generate_comparable_vehicles(str(data.get("brand", "")), pred_price)

    # 9. Find or create vehicle in DB
    vehicle = (
        db.query(Vehicle)
        .filter(
            Vehicle.brand == data.get("brand"),
            Vehicle.model == data.get("model"),
            Vehicle.year == data.get("year"),
            Vehicle.fuel_type == data.get("fuel_type"),
            Vehicle.transmission == data.get("transmission"),
        )
        .first()
    )
    if not vehicle:
        vehicle = Vehicle(
            brand=str(data.get("brand", "")),
            model=str(data.get("model", "")),
            variant=data.get("variant"),
            year=int(data.get("year", 2020)),
            fuel_type=str(data.get("fuel_type", "Petrol")),
            transmission=str(data.get("transmission", "Manual")),
            engine_cc=data.get("engine_cc"),
            mileage=data.get("mileage_kmpl"),
            seating_capacity=data.get("seating_capacity"),
        )
        db.add(vehicle)
        db.flush()

    # 10. Save valuation to DB
    version = model_loader.metadata.get("version", "unknown") if model_loader.is_ready else "demo"
    valuation = Valuation(
        user_id=user_id,
        vehicle_id=vehicle.id,
        km_driven=int(data.get("km_driven", 0)),
        owner_count=int(data.get("owner_count", 1)),
        condition_score=float(data.get("condition_score", 75)),
        accident_history=bool(data.get("accident_history", False)),
        service_history=bool(data.get("service_history", True)),
        city=data.get("city"),
        state=data.get("state"),
        predicted_price=pred_price,
        lower_price=lower,
        upper_price=upper,
        confidence=confidence,
        market_average=market_average,
        recommended_listing_price=recommended_listing,
        deal_score=deal_score,
        market_status=market_status,
        model_version=version,
        shap_values=json.dumps(shap_features),
    )
    db.add(valuation)
    db.commit()
    db.refresh(valuation)

    return {
        "predicted_price": pred_price,
        "lower_bound": lower,
        "upper_bound": upper,
        "confidence": confidence,
        "market_average": market_average,
        "recommended_listing_price": recommended_listing,
        "deal_score": deal_score,
        "market_status": market_status,
        "shap_features": shap_features,
        "depreciation_curve": depreciation_curve,
        "comparable_vehicles": comparables,
        "ai_recommendation": ai_rec,
        "model_version": version,
        "valuation_id": valuation.id,
    }
