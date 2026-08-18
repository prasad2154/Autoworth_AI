"""
AutoWorth AI — Feature Engineering Module
Standalone feature engineering for use in training and prediction.
"""
from __future__ import annotations
import numpy as np
import pandas as pd
from typing import Optional

CURRENT_YEAR = 2026

PREMIUM_BRANDS = {"Mercedes-Benz", "BMW", "Audi", "Volvo", "Jaguar", "Land Rover", "Lexus", "Porsche"}
MID_BRANDS = {"Toyota", "Honda", "Hyundai", "Kia", "Skoda", "Volkswagen", "MG", "Jeep"}


def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Apply all feature engineering transformations.
    Input DataFrame must have at minimum:
      brand, year, km_driven, engine_cc, mileage (or mileage_kmpl)
    """
    df = df.copy()

    # ── Rename columns for consistency ──────────────────────────
    rename_map = {}
    if "model" in df.columns and "model_name" not in df.columns:
        rename_map["model"] = "model_name"
    if "mileage" in df.columns and "mileage_kmpl" not in df.columns:
        rename_map["mileage"] = "mileage_kmpl"
    if rename_map:
        df = df.rename(columns=rename_map)

    # ── Vehicle age ──────────────────────────────────────────────
    df["vehicle_age"] = (CURRENT_YEAR - df["year"].astype(int)).clip(lower=0)

    # ── KM per year ──────────────────────────────────────────────
    # Avoid division by zero for brand-new cars
    safe_age = df["vehicle_age"].replace(0, 1)
    df["km_per_year"] = df["km_driven"] / safe_age

    # ── Price per km (only useful if market_price available) ─────
    if "market_price" in df.columns:
        df["price_per_km"] = df["market_price"] / df["km_driven"].replace(0, 1)

    # ── Age × Mileage interaction ────────────────────────────────
    df["age_mileage_interaction"] = df["vehicle_age"] * df["km_driven"]

    # ── Brand features ───────────────────────────────────────────
    df["premium_brand_flag"] = df["brand"].apply(lambda b: 1 if b in PREMIUM_BRANDS else 0)
    df["brand_segment"] = df["brand"].apply(
        lambda b: 2 if b in PREMIUM_BRANDS else (1 if b in MID_BRANDS else 0)
    )

    # ── Engine category ──────────────────────────────────────────
    engine = df.get("engine_cc", pd.Series(np.full(len(df), 1200))).fillna(1200)
    df["engine_category"] = pd.cut(
        engine,
        bins=[-1, 999, 1599, 2499, float("inf")],
        labels=[0, 1, 2, 3],
    ).astype(int)

    # ── Mileage category ─────────────────────────────────────────
    mileage = df.get("mileage_kmpl", pd.Series(np.full(len(df), 15))).fillna(15)
    df["mileage_category"] = pd.cut(
        mileage,
        bins=[-1, 11.9, 17.9, 23.9, float("inf")],
        labels=[0, 1, 2, 3],
    ).astype(int)

    # ── Condition category ───────────────────────────────────────
    if "condition_score" in df.columns:
        conditions = [
            (df["condition_score"] >= 85, "Excellent"),
            (df["condition_score"] >= 70, "Good"),
            (df["condition_score"] >= 55, "Fair"),
            (df["condition_score"] >= 40, "Below Average"),
        ]
        df["condition_category"] = "Poor"
        for mask, label in reversed(conditions):
            df.loc[mask, "condition_category"] = label

    # ── Usage intensity ──────────────────────────────────────────
    df["usage_intensity"] = df["km_per_year"] / 15000  # normalized against 15K km/year benchmark

    return df


def get_feature_names() -> list:
    """Return list of all engineered feature column names."""
    return [
        "brand", "model_name", "variant", "year", "vehicle_age",
        "km_driven", "fuel_type", "transmission", "owner_count",
        "engine_cc", "mileage_kmpl", "seating_capacity",
        "condition_score", "accident_history", "service_history",
        "city", "state",
        "km_per_year", "age_mileage_interaction", "premium_brand_flag",
        "brand_segment", "engine_category", "mileage_category", "usage_intensity",
    ]
