"""
AutoWorth AI — Model Evaluator
Computes regression metrics and generates evaluation reports.
"""
from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Any, Dict, List, Optional

import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)


# ── Core metric functions ──────────────────────────────────────────────────────

def mae(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    """Mean Absolute Error."""
    return float(np.mean(np.abs(y_true - y_pred)))


def rmse(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    """Root Mean Squared Error."""
    return float(np.sqrt(np.mean((y_true - y_pred) ** 2)))


def r2_score(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    """Coefficient of Determination (R²)."""
    ss_res = np.sum((y_true - y_pred) ** 2)
    ss_tot = np.sum((y_true - np.mean(y_true)) ** 2)
    return float(1 - ss_res / ss_tot) if ss_tot > 0 else 0.0


def mape(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    """Mean Absolute Percentage Error (excludes zeros in y_true)."""
    mask = y_true != 0
    if not mask.any():
        return 0.0
    return float(np.mean(np.abs((y_true[mask] - y_pred[mask]) / y_true[mask])) * 100)


def median_ae(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    """Median Absolute Error — robust to outliers."""
    return float(np.median(np.abs(y_true - y_pred)))


def within_pct(y_true: np.ndarray, y_pred: np.ndarray, pct: float = 10.0) -> float:
    """Fraction of predictions within ±pct% of true value."""
    mask = y_true != 0
    if not mask.any():
        return 0.0
    diff_pct = np.abs((y_true[mask] - y_pred[mask]) / y_true[mask]) * 100
    return float(np.mean(diff_pct <= pct))


# ── Full evaluation report ─────────────────────────────────────────────────────

def evaluate(
    y_true: np.ndarray | pd.Series,
    y_pred: np.ndarray | pd.Series,
    model_name: str = "model",
    verbose: bool = True,
) -> Dict[str, float]:
    """
    Compute a comprehensive set of regression metrics.

    Returns a dict with keys:
        mae, rmse, r2, mape, median_ae, within_10pct, within_20pct
    """
    y_true = np.asarray(y_true, dtype=float)
    y_pred = np.asarray(y_pred, dtype=float)

    metrics = {
        "mae": mae(y_true, y_pred),
        "rmse": rmse(y_true, y_pred),
        "r2": r2_score(y_true, y_pred),
        "mape": mape(y_true, y_pred),
        "median_ae": median_ae(y_true, y_pred),
        "within_10pct": within_pct(y_true, y_pred, pct=10.0),
        "within_20pct": within_pct(y_true, y_pred, pct=20.0),
    }

    if verbose:
        _print_report(model_name, metrics)

    return metrics


def _print_report(model_name: str, metrics: Dict[str, float]) -> None:
    print(f"\n{'─' * 50}")
    print(f"  Evaluation Report — {model_name}")
    print(f"{'─' * 50}")
    print(f"  MAE           : ₹{metrics['mae']:>12,.0f}")
    print(f"  RMSE          : ₹{metrics['rmse']:>12,.0f}")
    print(f"  Median AE     : ₹{metrics['median_ae']:>12,.0f}")
    print(f"  R²            :  {metrics['r2']:>12.4f}")
    print(f"  MAPE          :  {metrics['mape']:>11.2f}%")
    print(f"  Within ±10%   :  {metrics['within_10pct'] * 100:>10.1f}%")
    print(f"  Within ±20%   :  {metrics['within_20pct'] * 100:>10.1f}%")
    print(f"{'─' * 50}\n")


# ── Segmented evaluation ───────────────────────────────────────────────────────

def evaluate_by_segment(
    y_true: np.ndarray | pd.Series,
    y_pred: np.ndarray | pd.Series,
    segment: pd.Series,
    verbose: bool = True,
) -> Dict[str, Dict[str, float]]:
    """
    Evaluate metrics broken down by a categorical segment (e.g., brand, fuel type).
    Returns {segment_value: metrics_dict}.
    """
    y_true = np.asarray(y_true, dtype=float)
    y_pred = np.asarray(y_pred, dtype=float)
    segment = np.asarray(segment)

    results: Dict[str, Dict[str, float]] = {}
    for seg_val in sorted(set(segment)):
        mask = segment == seg_val
        if mask.sum() < 5:
            continue
        results[str(seg_val)] = evaluate(y_true[mask], y_pred[mask], model_name=str(seg_val), verbose=False)

    if verbose:
        print(f"\nSegmented Evaluation ({len(results)} groups)")
        print(f"{'Segment':<20} {'MAE':>12} {'MAPE':>8} {'R²':>8} {'N':>6}")
        print("-" * 56)
        for seg_val, m in results.items():
            n = int((segment == seg_val).sum())
            print(f"{seg_val:<20} {m['mae']:>12,.0f} {m['mape']:>7.1f}% {m['r2']:>8.4f} {n:>6}")
        print()

    return results


# ── Residual analysis ──────────────────────────────────────────────────────────

def residual_stats(y_true: np.ndarray, y_pred: np.ndarray) -> Dict[str, float]:
    """Basic statistics on the residuals (errors)."""
    residuals = y_true - y_pred
    return {
        "mean_residual": float(np.mean(residuals)),
        "std_residual": float(np.std(residuals)),
        "p5_residual": float(np.percentile(residuals, 5)),
        "p25_residual": float(np.percentile(residuals, 25)),
        "p50_residual": float(np.percentile(residuals, 50)),
        "p75_residual": float(np.percentile(residuals, 75)),
        "p95_residual": float(np.percentile(residuals, 95)),
        "skewness": float(
            np.mean(((residuals - np.mean(residuals)) / (np.std(residuals) + 1e-9)) ** 3)
        ),
    }


# ── Save / load evaluation reports ────────────────────────────────────────────

def save_evaluation_report(
    metrics: Dict[str, Any],
    output_path: str | Path,
) -> None:
    """Save evaluation metrics dict to a JSON file."""
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w") as f:
        json.dump(metrics, f, indent=2, default=str)
    logger.info(f"Evaluation report saved → {output_path}")


def load_evaluation_report(path: str | Path) -> Dict[str, Any]:
    """Load a previously saved evaluation report."""
    with open(path) as f:
        return json.load(f)
