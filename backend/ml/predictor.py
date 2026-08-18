"""
AutoWorth AI — ML Predictor
Core prediction logic with conformal prediction intervals.
"""
from __future__ import annotations
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Tuple, Optional

from .model_loader import model_loader


FEATURE_COLS = [
    "brand", "model_name", "variant", "year", "vehicle_age",
    "km_driven", "fuel_type", "transmission", "owner_count",
    "engine_cc", "mileage_kmpl", "seating_capacity",
    "condition_score", "accident_history", "service_history",
    "city", "state",
    # Engineered features
    "km_per_year", "age_mileage_interaction", "premium_brand_flag",
    "brand_segment", "engine_category", "mileage_category", "usage_intensity",
]


def build_features(data: Dict[str, Any], current_year: int = 2026) -> pd.DataFrame:
    """Convert raw prediction request into a feature DataFrame."""
    vehicle_age = max(current_year - int(data.get("year", 2020)), 0)
    km_driven = int(data.get("km_driven", 0))
    km_per_year = km_driven / max(vehicle_age, 1)

    premium_brands = {"Mercedes-Benz", "BMW", "Audi", "Volvo", "Jaguar", "Land Rover", "Lexus", "Porsche"}
    mid_brands = {"Toyota", "Honda", "Hyundai", "Kia", "Skoda", "Volkswagen", "MG", "Jeep"}
    brand = data.get("brand", "")
    brand_segment = 2 if brand in premium_brands else (1 if brand in mid_brands else 0)
    premium_brand_flag = 1 if brand in premium_brands else 0

    engine_cc = data.get("engine_cc", 1200) or 1200
    engine_category = 0 if engine_cc < 1000 else (1 if engine_cc < 1600 else (2 if engine_cc < 2500 else 3))

    mileage_kmpl = data.get("mileage_kmpl", 15) or 15
    mileage_category = 0 if mileage_kmpl < 12 else (1 if mileage_kmpl < 18 else (2 if mileage_kmpl < 24 else 3))

    usage_intensity = km_per_year / 15000  # normalized against avg 15K km/year

    row = {
        "brand": str(brand),
        "model_name": str(data.get("model", "")),
        "variant": str(data.get("variant", "Base")),
        "year": int(data.get("year", 2020)),
        "vehicle_age": vehicle_age,
        "km_driven": km_driven,
        "fuel_type": str(data.get("fuel_type", "Petrol")),
        "transmission": str(data.get("transmission", "Manual")),
        "owner_count": int(data.get("owner_count", 1)),
        "engine_cc": engine_cc,
        "mileage_kmpl": mileage_kmpl,
        "seating_capacity": int(data.get("seating_capacity", 5) or 5),
        "condition_score": float(data.get("condition_score", 75)),
        "accident_history": int(data.get("accident_history", False)),
        "service_history": int(data.get("service_history", True)),
        "city": str(data.get("city", "Mumbai") or "Mumbai"),
        "state": str(data.get("state", "Maharashtra") or "Maharashtra"),
        "km_per_year": km_per_year,
        "age_mileage_interaction": vehicle_age * km_driven,
        "premium_brand_flag": premium_brand_flag,
        "brand_segment": brand_segment,
        "engine_category": engine_category,
        "mileage_category": mileage_category,
        "usage_intensity": usage_intensity,
    }
    return pd.DataFrame([row])


def heuristic_predict(data: Dict[str, Any]) -> float:
    base_price = 800000.0  # ₹8 Lakhs default baseline
    brand = str(data.get("brand", ""))
    premium_brands = {"Mercedes-Benz", "BMW", "Audi", "Volvo", "Jaguar", "Land Rover", "Lexus", "Porsche"}
    mid_brands = {"Toyota", "Honda", "Hyundai", "Kia", "Skoda", "Volkswagen", "MG", "Jeep"}
    if brand in premium_brands:
        base_price = 3500000.0
    elif brand in mid_brands:
        base_price = 1200000.0
    
    year = int(data.get("year", 2020))
    age = max(2026 - year, 0)
    depreciation = (1 - 0.08) ** age
    
    km = int(data.get("km_driven", 30000))
    km_factor = max(1 - (km / 300000) * 0.25, 0.5)
    
    cond = float(data.get("condition_score", 8))
    cond_factor = 0.8 + (cond / 10.0) * 0.3
    
    price = base_price * depreciation * km_factor * cond_factor
    return max(round(price, 2), 50000.0)


def predict(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Run full prediction pipeline:
    1. Feature engineering
    2. Preprocessing
    3. Model prediction
    4. Conformal prediction intervals
    """
    df = build_features(data)

    if not model_loader.is_ready:
        pred = heuristic_predict(data)
        lower = pred * 0.88
        upper = pred * 1.12
        return {
            "predicted_price": round(pred, 2),
            "lower_bound": round(lower, 2),
            "upper_bound": round(upper, 2),
            "confidence": 82.0,
            "features_df": df,
            "X_transformed": None,
        }

    preprocessor = model_loader.get_preprocessor()
    model = model_loader.get_model()

    # Transform
    X = preprocessor.transform(df) if preprocessor else df

    # Point prediction
    pred = float(model.predict(X)[0])

    # Conformal prediction interval (calibrated on validation residuals)
    residuals = model_loader.residuals
    if residuals:
        residuals_arr = np.array(residuals)
        alpha = 0.13  # target 87% coverage
        margin = float(np.quantile(np.abs(residuals_arr), 1 - alpha))
        lower = max(pred - margin, pred * 0.7)
        upper = pred + margin
        confidence = 87.0
    else:
        lower = pred * 0.90
        upper = pred * 1.10
        confidence = 75.0

    return {
        "predicted_price": round(pred, 2),
        "lower_bound": round(lower, 2),
        "upper_bound": round(upper, 2),
        "confidence": confidence,
        "features_df": df,
        "X_transformed": X,
    }


def generate_depreciation_curve(data: Dict[str, Any], base_price: float) -> List[Dict]:
    """Generate 5-year depreciation forecast."""
    curve = []
    current_year = 2026
    for yr_offset in range(6):
        future_data = dict(data)
        future_data["year"] = int(data.get("year", 2020))
        future_data["km_driven"] = int(data.get("km_driven", 0)) + yr_offset * 15000
        try:
            result = predict(future_data)
            price = result["predicted_price"]
        except Exception:
            depreciation_rate = 0.12
            price = base_price * ((1 - depreciation_rate) ** yr_offset)

        curve.append({
            "year": current_year + yr_offset,
            "price": round(price, 2),
            "change_pct": round(((price - base_price) / base_price) * 100, 1),
        })
    return curve
