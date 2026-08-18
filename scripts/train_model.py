"""
AutoWorth AI — Model Training Pipeline
Trains 6 candidate models, selects the best by RMSE, saves artifacts.

Usage:
    python scripts/train_model.py [--data data/generated/vehicles.csv] [--models-dir models/]

Output:
    models/autoworth_model.pkl   — Best trained model
    models/preprocessor.pkl      — Sklearn preprocessing pipeline
    models/metadata.json         — Version, metrics, feature names, residuals
"""
import argparse
import json
import time
import warnings
from pathlib import Path
from datetime import datetime, timezone

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import GradientBoostingRegressor, RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import LabelEncoder, OneHotEncoder, StandardScaler
from sklearn.tree import DecisionTreeRegressor

warnings.filterwarnings("ignore")

CURRENT_YEAR = 2026

FEATURE_COLS = [
    "brand", "model_name", "variant", "year", "vehicle_age",
    "km_driven", "fuel_type", "transmission", "owner_count",
    "engine_cc", "mileage_kmpl", "seating_capacity",
    "condition_score", "accident_history", "service_history",
    "city", "state",
    # Engineered
    "km_per_year", "age_mileage_interaction", "premium_brand_flag",
    "brand_segment", "engine_category", "mileage_category", "usage_intensity",
]

CATEGORICAL_COLS = ["brand", "model_name", "variant", "fuel_type", "transmission", "city", "state"]
NUMERIC_COLS = [c for c in FEATURE_COLS if c not in CATEGORICAL_COLS]

TARGET = "selling_price"


# ─── Feature Engineering ──────────────────────────────────────────────────────

def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()

    # Rename for clarity
    if "model" in df.columns:
        df = df.rename(columns={"model": "model_name"})
    if "mileage" in df.columns:
        df = df.rename(columns={"mileage": "mileage_kmpl"})

    # Vehicle age
    df["vehicle_age"] = CURRENT_YEAR - df["year"].astype(int)
    df["vehicle_age"] = df["vehicle_age"].clip(lower=0)

    # KM per year (safely)
    df["km_per_year"] = df["km_driven"] / df["vehicle_age"].replace(0, 1)

    # Interaction
    df["age_mileage_interaction"] = df["vehicle_age"] * df["km_driven"]

    # Brand features
    premium_brands = {"Mercedes-Benz", "BMW", "Audi", "Volvo", "Jaguar", "Land Rover", "Lexus", "Porsche"}
    mid_brands = {"Toyota", "Honda", "Hyundai", "Kia", "Skoda", "Volkswagen", "MG", "Jeep"}
    df["premium_brand_flag"] = df["brand"].apply(lambda b: 1 if b in premium_brands else 0)
    df["brand_segment"] = df["brand"].apply(
        lambda b: 2 if b in premium_brands else (1 if b in mid_brands else 0)
    )

    # Engine category
    df["engine_category"] = pd.cut(
        df["engine_cc"].fillna(1200),
        bins=[0, 999, 1599, 2499, 99999],
        labels=[0, 1, 2, 3],
    ).astype(int)

    # Mileage category
    df["mileage_category"] = pd.cut(
        df["mileage_kmpl"].fillna(15),
        bins=[0, 11.9, 17.9, 23.9, 9999],
        labels=[0, 1, 2, 3],
    ).astype(int)

    # Usage intensity
    df["usage_intensity"] = df["km_per_year"] / 15000

    # Fill missing categoricals
    for col in CATEGORICAL_COLS:
        if col in df.columns:
            df[col] = df[col].fillna("Unknown").astype(str)

    # Fill missing numerics
    for col in NUMERIC_COLS:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce").fillna(df[col].median() if col in df.columns else 0)

    return df


# ─── Metrics ──────────────────────────────────────────────────────────────────

def compute_metrics(y_true: np.ndarray, y_pred: np.ndarray) -> dict:
    mae = mean_absolute_error(y_true, y_pred)
    rmse = float(np.sqrt(mean_squared_error(y_true, y_pred)))
    r2 = r2_score(y_true, y_pred)
    mape = float(np.mean(np.abs((y_true - y_pred) / np.maximum(y_true, 1e-8))) * 100)
    return {"MAE": mae, "RMSE": rmse, "R2": r2, "MAPE": mape}


# ─── Build Preprocessor ───────────────────────────────────────────────────────

def build_preprocessor() -> ColumnTransformer:
    return ColumnTransformer(
        transformers=[
            ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), CATEGORICAL_COLS),
            ("num", StandardScaler(), NUMERIC_COLS),
        ],
        remainder="drop",
    )


# ─── Model Definitions ────────────────────────────────────────────────────────

def get_candidate_models():
    models = {
        "Linear Regression": LinearRegression(),
        "Decision Tree": DecisionTreeRegressor(max_depth=12, random_state=42),
        "Random Forest": RandomForestRegressor(n_estimators=100, max_depth=16, n_jobs=-1, random_state=42),
        "Gradient Boosting": GradientBoostingRegressor(n_estimators=150, max_depth=5, learning_rate=0.1, random_state=42),
    }

    try:
        from xgboost import XGBRegressor
        models["XGBoost"] = XGBRegressor(
            n_estimators=300, max_depth=6, learning_rate=0.05,
            subsample=0.8, colsample_bytree=0.8,
            n_jobs=-1, random_state=42, verbosity=0,
        )
    except ImportError:
        print("⚠️  XGBoost not available")

    try:
        from catboost import CatBoostRegressor
        models["CatBoost"] = CatBoostRegressor(
            iterations=300, depth=6, learning_rate=0.05,
            verbose=0, random_state=42,
        )
    except ImportError:
        print("⚠️  CatBoost not available")

    return models


# ─── Main Training Pipeline ───────────────────────────────────────────────────

def train(data_path: str, models_dir: str):
    models_path = Path(models_dir)
    models_path.mkdir(parents=True, exist_ok=True)

    # ── Load data ──────────────────────────────────────────────
    print(f"📂 Loading dataset: {data_path}")
    df = pd.read_csv(data_path)
    print(f"   Loaded {len(df):,} records")

    # ── Feature engineering ────────────────────────────────────
    print("🔧 Engineering features...")
    df = engineer_features(df)

    # Ensure all feature columns exist
    for col in FEATURE_COLS:
        if col not in df.columns:
            print(f"   ⚠️  Missing feature '{col}', filling with 0")
            df[col] = 0

    X = df[FEATURE_COLS]
    y = df[TARGET]

    # ── Split ──────────────────────────────────────────────────
    X_train, X_temp, y_train, y_temp = train_test_split(X, y, test_size=0.3, random_state=42)
    X_val, X_test, y_val, y_test = train_test_split(X_temp, y_temp, test_size=0.5, random_state=42)

    print(f"   Train: {len(X_train):,} | Val: {len(X_val):,} | Test: {len(X_test):,}")

    # ── Preprocessing ──────────────────────────────────────────
    print("⚙️  Fitting preprocessor...")
    preprocessor = build_preprocessor()
    X_train_t = preprocessor.fit_transform(X_train)
    X_val_t = preprocessor.transform(X_val)
    X_test_t = preprocessor.transform(X_test)

    # ── Train all models ───────────────────────────────────────
    candidates = get_candidate_models()
    results = {}
    best_rmse = float("inf")
    best_name = None
    best_model = None

    print("\n" + "─" * 72)
    print(f"  {'Model':<22} {'MAE':>12} {'RMSE':>12} {'R²':>8} {'MAPE':>8}")
    print("─" * 72)

    for name, model in candidates.items():
        t0 = time.time()
        model.fit(X_train_t, y_train)
        y_pred_val = model.predict(X_val_t)
        metrics = compute_metrics(y_val.values, y_pred_val)
        elapsed = time.time() - t0

        results[name] = metrics
        rmse_l = metrics["RMSE"] / 100000
        mae_l = metrics["MAE"] / 100000
        print(f"  {name:<22} ₹{mae_l:>8.2f}L  ₹{rmse_l:>8.2f}L  {metrics['R2']:>6.4f}  {metrics['MAPE']:>6.1f}%  ({elapsed:.1f}s)")

        if metrics["RMSE"] < best_rmse:
            best_rmse = metrics["RMSE"]
            best_name = name
            best_model = model

    print("─" * 72)
    print(f"\n🏆 Best model: {best_name} (RMSE: ₹{best_rmse/100000:.2f}L)")

    # ── Final test evaluation ──────────────────────────────────
    y_pred_test = best_model.predict(X_test_t)
    test_metrics = compute_metrics(y_test.values, y_pred_test)
    print(f"\n   Test MAE:  ₹{test_metrics['MAE']/100000:.2f}L")
    print(f"   Test RMSE: ₹{test_metrics['RMSE']/100000:.2f}L")
    print(f"   Test R²:   {test_metrics['R2']:.4f}")
    print(f"   Test MAPE: {test_metrics['MAPE']:.1f}%")

    # ── Conformal prediction residuals ────────────────────────
    residuals = (y_val.values - best_model.predict(X_val_t)).tolist()

    # ── Versioning ────────────────────────────────────────────
    existing_versions = list(models_path.glob("metadata_v*.json"))
    version_num = len(existing_versions) + 1
    version = f"v{version_num}.0"

    # ── Save artifacts ────────────────────────────────────────
    joblib.dump(best_model, models_path / "autoworth_model.pkl")
    joblib.dump(preprocessor, models_path / "preprocessor.pkl")

    # Get feature names from preprocessor
    try:
        cat_features = preprocessor.named_transformers_["cat"].get_feature_names_out(CATEGORICAL_COLS).tolist()
    except Exception:
        cat_features = []
    feature_names = cat_features + NUMERIC_COLS

    metadata = {
        "version": version,
        "algorithm": best_name,
        "model_path": str(models_path / "autoworth_model.pkl"),
        "preprocessor_path": str(models_path / "preprocessor.pkl"),
        "feature_names": feature_names,
        "feature_count": len(feature_names),
        "training_records": len(X_train),
        "test_metrics": test_metrics,
        "all_model_metrics": results,
        "residuals": residuals[:5000],  # store first 5K for conformal prediction
        "trained_at": datetime.now(timezone.utc).isoformat(),
        "target": TARGET,
    }

    with open(models_path / "metadata.json", "w") as f:
        json.dump(metadata, f, indent=2, default=str)

    # Also save version-stamped metadata
    with open(models_path / f"metadata_{version}.json", "w") as f:
        json.dump(metadata, f, indent=2, default=str)

    print(f"\n✅ Model artifacts saved to: {models_path}/")
    print(f"   Version: {version}")
    print(f"   Model:   autoworth_model.pkl")
    print(f"   Prep:    preprocessor.pkl")
    print(f"   Meta:    metadata.json")
    print("\n⚠️  Model trained on SYNTHETIC data. Not for real financial decisions.")

    return metadata


def main():
    parser = argparse.ArgumentParser(description="AutoWorth AI Model Training")
    parser.add_argument("--data", type=str, default="data/generated/vehicles.csv")
    parser.add_argument("--models-dir", type=str, default="models")
    args = parser.parse_args()

    if not Path(args.data).exists():
        print(f"❌ Dataset not found: {args.data}")
        print("   Run: python scripts/generate_dataset.py first")
        raise SystemExit(1)

    train(args.data, args.models_dir)


if __name__ == "__main__":
    main()
