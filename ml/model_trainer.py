"""
AutoWorth AI — Model Trainer
Trains multiple regression models, evaluates them, selects the best,
and saves the winner + metadata to disk for the prediction service.
"""
from __future__ import annotations

import json
import logging
import os
import pickle
import time
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Dict, List, Optional, Tuple

import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor, RandomForestRegressor
from sklearn.linear_model import Ridge
from sklearn.model_selection import KFold, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

logger = logging.getLogger(__name__)

# ── Optional heavy deps ────────────────────────────────────────────────────────
try:
    from xgboost import XGBRegressor

    _HAS_XGB = True
except ImportError:
    _HAS_XGB = False
    logger.warning("xgboost not installed — skipping XGBRegressor")

try:
    from catboost import CatBoostRegressor

    _HAS_CAT = True
except ImportError:
    _HAS_CAT = False
    logger.warning("catboost not installed — skipping CatBoostRegressor")

try:
    from lightgbm import LGBMRegressor

    _HAS_LGB = True
except ImportError:
    _HAS_LGB = False
    logger.warning("lightgbm not installed — skipping LGBMRegressor")


# ── Evaluation metrics ─────────────────────────────────────────────────────────
@dataclass
class ModelMetrics:
    name: str
    mae: float
    rmse: float
    r2: float
    mape: float
    train_time_sec: float

    @property
    def score(self) -> float:
        """Composite score — lower is better (normalised MAE + MAPE)."""
        return self.mae * 0.5 + self.mape * 0.5


def compute_metrics(y_true: np.ndarray, y_pred: np.ndarray, name: str = "", train_time: float = 0.0) -> ModelMetrics:
    mae = float(np.mean(np.abs(y_true - y_pred)))
    rmse = float(np.sqrt(np.mean((y_true - y_pred) ** 2)))
    ss_res = np.sum((y_true - y_pred) ** 2)
    ss_tot = np.sum((y_true - np.mean(y_true)) ** 2)
    r2 = float(1 - ss_res / ss_tot) if ss_tot > 0 else 0.0
    # Avoid division by zero in MAPE
    mask = y_true != 0
    mape = float(np.mean(np.abs((y_true[mask] - y_pred[mask]) / y_true[mask])) * 100) if mask.any() else 0.0
    return ModelMetrics(name=name, mae=mae, rmse=rmse, r2=r2, mape=mape, train_time_sec=train_time)


# ── Candidate models ───────────────────────────────────────────────────────────
def _build_candidates() -> Dict[str, object]:
    candidates: Dict[str, object] = {}

    candidates["ridge"] = Pipeline([
        ("scaler", StandardScaler()),
        ("model", Ridge(alpha=10.0)),
    ])

    candidates["random_forest"] = RandomForestRegressor(
        n_estimators=200,
        max_depth=20,
        min_samples_leaf=3,
        n_jobs=-1,
        random_state=42,
    )

    candidates["gradient_boosting"] = GradientBoostingRegressor(
        n_estimators=300,
        learning_rate=0.05,
        max_depth=5,
        subsample=0.8,
        random_state=42,
    )

    if _HAS_XGB:
        candidates["xgboost"] = XGBRegressor(
            n_estimators=500,
            learning_rate=0.05,
            max_depth=6,
            subsample=0.8,
            colsample_bytree=0.8,
            reg_alpha=0.1,
            reg_lambda=1.0,
            n_jobs=-1,
            random_state=42,
            verbosity=0,
        )

    if _HAS_CAT:
        candidates["catboost"] = CatBoostRegressor(
            iterations=500,
            learning_rate=0.05,
            depth=6,
            l2_leaf_reg=3,
            random_seed=42,
            verbose=0,
        )

    if _HAS_LGB:
        candidates["lightgbm"] = LGBMRegressor(
            n_estimators=500,
            learning_rate=0.05,
            max_depth=6,
            num_leaves=63,
            subsample=0.8,
            colsample_bytree=0.8,
            reg_alpha=0.1,
            reg_lambda=1.0,
            n_jobs=-1,
            random_state=42,
            verbosity=-1,
        )

    return candidates


# ── Main trainer ───────────────────────────────────────────────────────────────
class ModelTrainer:
    """Train, compare, and persist the best vehicle price prediction model."""

    def __init__(self, output_dir: str = "models"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.results: List[ModelMetrics] = []
        self.best_model = None
        self.best_metrics: Optional[ModelMetrics] = None

    def train_and_select(
        self,
        X_train: pd.DataFrame,
        y_train: pd.Series,
        X_val: pd.DataFrame,
        y_val: pd.Series,
        cv_folds: int = 3,
    ) -> ModelMetrics:
        """Train all candidates, evaluate on val set, return best metrics."""
        candidates = _build_candidates()
        logger.info(f"Training {len(candidates)} model candidates …")

        for name, estimator in candidates.items():
            logger.info(f"  ▶ {name} …")
            t0 = time.time()
            try:
                estimator.fit(X_train, y_train)
                elapsed = time.time() - t0
                y_pred = estimator.predict(X_val)
                metrics = compute_metrics(y_val.to_numpy(), y_pred, name=name, train_time=elapsed)
                self.results.append(metrics)
                logger.info(
                    f"    MAE={metrics.mae:,.0f}  RMSE={metrics.rmse:,.0f}  "
                    f"R²={metrics.r2:.4f}  MAPE={metrics.mape:.2f}%  ({elapsed:.1f}s)"
                )
            except Exception as exc:
                logger.warning(f"    ✗ {name} failed: {exc}")

        # Select winner
        self.results.sort(key=lambda m: m.score)
        self.best_metrics = self.results[0]
        self.best_model = candidates[self.best_metrics.name]
        logger.info(f"🏆 Best model: {self.best_metrics.name} (score={self.best_metrics.score:,.2f})")
        return self.best_metrics

    def save(
        self,
        feature_columns: List[str],
        version: str = "1.0.0",
        label_encoders: Optional[dict] = None,
        scaler: Optional[object] = None,
    ) -> Path:
        """Persist the best model + artefacts + metadata."""
        if self.best_model is None:
            raise RuntimeError("No model trained yet. Call train_and_select() first.")

        bundle = {
            "model": self.best_model,
            "feature_columns": feature_columns,
            "label_encoders": label_encoders or {},
            "scaler": scaler,
        }
        model_path = self.output_dir / "model.pkl"
        with open(model_path, "wb") as f:
            pickle.dump(bundle, f)

        # Save all results for inspection
        results_path = self.output_dir / "training_results.json"
        results_payload = [asdict(m) for m in self.results]
        with open(results_path, "w") as f:
            json.dump(results_payload, f, indent=2)

        # Save metadata
        meta = {
            "version": version,
            "model_name": self.best_metrics.name,
            "mae": self.best_metrics.mae,
            "rmse": self.best_metrics.rmse,
            "r2": self.best_metrics.r2,
            "mape": self.best_metrics.mape,
            "feature_count": len(feature_columns),
            "feature_columns": feature_columns,
            "trained_at": pd.Timestamp.now().isoformat(),
        }
        meta_path = self.output_dir / "model_metadata.json"
        with open(meta_path, "w") as f:
            json.dump(meta, f, indent=2)

        logger.info(f"✅ Model saved → {model_path}")
        return model_path

    def print_leaderboard(self) -> None:
        """Pretty-print model comparison table."""
        print("\n" + "=" * 70)
        print(f"{'Model':<20} {'MAE':>10} {'RMSE':>10} {'R²':>8} {'MAPE':>8} {'Time':>8}")
        print("-" * 70)
        for m in self.results:
            flag = " 🏆" if m.name == self.best_metrics.name else ""
            print(
                f"{m.name:<20} {m.mae:>10,.0f} {m.rmse:>10,.0f} "
                f"{m.r2:>8.4f} {m.mape:>7.2f}% {m.train_time_sec:>7.1f}s{flag}"
            )
        print("=" * 70 + "\n")
