"""
AutoWorth AI — Conformal Prediction Intervals
Implements Split Conformal Prediction for distribution-free,
statistically valid prediction intervals around ML point estimates.

Reference:
  Angelopoulos & Bates, "A Gentle Introduction to Conformal Prediction
  and Distribution-Free Uncertainty Quantification", 2022.
"""
from __future__ import annotations

import json
import logging
import pickle
from pathlib import Path
from typing import Dict, Optional, Tuple

import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)


class SplitConformalPredictor:
    """
    Split conformal prediction interval estimator.

    Usage
    -----
    1. Calibrate on a held-out calibration set:
       >>> cp = SplitConformalPredictor(alpha=0.10)   # 90% coverage
       >>> cp.calibrate(model, X_cal, y_cal)

    2. Predict intervals at inference time:
       >>> lo, hi = cp.predict_interval(point_estimate)

    3. Save / load:
       >>> cp.save("models/conformal.pkl")
       >>> cp = SplitConformalPredictor.load("models/conformal.pkl")
    """

    def __init__(self, alpha: float = 0.10):
        """
        Parameters
        ----------
        alpha : float
            Miscoverage level.  Coverage ≥ 1 - alpha.
            alpha=0.10  → 90% coverage intervals.
            alpha=0.05  → 95% coverage intervals.
        """
        if not 0 < alpha < 1:
            raise ValueError(f"alpha must be in (0, 1), got {alpha}")
        self.alpha = alpha
        self._q_hat: Optional[float] = None
        self._n_cal: int = 0
        self._coverage_target: float = 1 - alpha

    # ── Calibration ────────────────────────────────────────────────────────────

    def calibrate(
        self,
        model: object,
        X_cal: pd.DataFrame | np.ndarray,
        y_cal: pd.Series | np.ndarray,
    ) -> "SplitConformalPredictor":
        """
        Compute the conformal quantile from calibration residuals.

        Stores self._q_hat which is added/subtracted from point estimates
        at prediction time.
        """
        y_cal = np.asarray(y_cal, dtype=float)
        y_pred = np.asarray(model.predict(X_cal), dtype=float)

        # Non-conformity score: absolute residual
        scores = np.abs(y_cal - y_pred)

        self._n_cal = len(scores)
        # Finite-sample corrected quantile level
        level = np.ceil((self._n_cal + 1) * (1 - self.alpha)) / self._n_cal
        level = min(level, 1.0)
        self._q_hat = float(np.quantile(scores, level))

        empirical_coverage = float(np.mean(np.abs(y_cal - y_pred) <= self._q_hat))
        logger.info(
            f"Conformal calibration: n_cal={self._n_cal}, "
            f"α={self.alpha}, q̂={self._q_hat:,.0f}, "
            f"empirical_coverage={empirical_coverage:.3f}"
        )
        return self

    # ── Calibrate from raw residuals ──────────────────────────────────────────

    def calibrate_from_residuals(self, residuals: np.ndarray) -> "SplitConformalPredictor":
        """
        Alternative: calibrate directly from pre-computed absolute residuals.
        Useful when the model is too large to keep in memory during calibration.
        """
        scores = np.abs(residuals)
        self._n_cal = len(scores)
        level = np.ceil((self._n_cal + 1) * (1 - self.alpha)) / self._n_cal
        level = min(level, 1.0)
        self._q_hat = float(np.quantile(scores, level))
        return self

    # ── Prediction ────────────────────────────────────────────────────────────

    def predict_interval(
        self,
        point_estimate: float,
        symmetric: bool = True,
    ) -> Tuple[float, float]:
        """
        Return (lower, upper) prediction interval for a point estimate.

        Parameters
        ----------
        point_estimate : float
            The model's point prediction.
        symmetric : bool
            If True, interval is symmetric around the estimate.
            (Non-symmetric variants require conditional residual models.)

        Returns
        -------
        (lower, upper) : Tuple[float, float]
            Both values are clipped to be ≥ 0 (prices can't be negative).
        """
        if self._q_hat is None:
            raise RuntimeError("Conformal predictor not calibrated. Call calibrate() first.")
        lower = max(0.0, point_estimate - self._q_hat)
        upper = point_estimate + self._q_hat
        return lower, upper

    def predict_intervals_batch(
        self,
        point_estimates: np.ndarray,
    ) -> Tuple[np.ndarray, np.ndarray]:
        """Vectorised version of predict_interval for arrays of estimates."""
        if self._q_hat is None:
            raise RuntimeError("Conformal predictor not calibrated.")
        lower = np.maximum(0.0, point_estimates - self._q_hat)
        upper = point_estimates + self._q_hat
        return lower, upper

    # ── Coverage check ────────────────────────────────────────────────────────

    def empirical_coverage(
        self,
        y_true: np.ndarray,
        point_estimates: np.ndarray,
    ) -> float:
        """Compute empirical coverage on a test set (for validation)."""
        lower, upper = self.predict_intervals_batch(point_estimates)
        return float(np.mean((y_true >= lower) & (y_true <= upper)))

    # ── Serialisation ─────────────────────────────────────────────────────────

    def save(self, path: str | Path) -> Path:
        path = Path(path)
        path.parent.mkdir(parents=True, exist_ok=True)
        data = {
            "alpha": self.alpha,
            "q_hat": self._q_hat,
            "n_cal": self._n_cal,
        }
        with open(path, "wb") as f:
            pickle.dump(data, f)
        logger.info(f"Conformal predictor saved → {path}")
        return path

    @classmethod
    def load(cls, path: str | Path) -> "SplitConformalPredictor":
        with open(path, "rb") as f:
            data = pickle.load(f)
        obj = cls(alpha=data["alpha"])
        obj._q_hat = data["q_hat"]
        obj._n_cal = data["n_cal"]
        logger.info(f"Conformal predictor loaded from {path} (q̂={obj._q_hat:,.0f})")
        return obj

    def save_json(self, path: str | Path) -> None:
        """Save metadata as human-readable JSON (not for re-loading the object)."""
        data = {
            "alpha": self.alpha,
            "coverage_target": self._coverage_target,
            "q_hat": self._q_hat,
            "n_calibration_samples": self._n_cal,
        }
        with open(path, "w") as f:
            json.dump(data, f, indent=2)

    @property
    def is_calibrated(self) -> bool:
        return self._q_hat is not None

    @property
    def q_hat(self) -> Optional[float]:
        """The conformal quantile threshold."""
        return self._q_hat

    def __repr__(self) -> str:
        state = f"q̂={self._q_hat:,.0f}" if self._q_hat else "not calibrated"
        return f"SplitConformalPredictor(alpha={self.alpha}, {state})"


# ── Adaptive conformal (RAPS-lite) ─────────────────────────────────────────────

class AdaptiveConformalPredictor(SplitConformalPredictor):
    """
    An adaptive variant that scales the interval by the model's
    absolute prediction magnitude (larger estimates → wider intervals).

    This is a simplified version of the idea behind RAPS / size-adaptive conformal.
    """

    def calibrate(
        self,
        model: object,
        X_cal: pd.DataFrame | np.ndarray,
        y_cal: pd.Series | np.ndarray,
    ) -> "AdaptiveConformalPredictor":
        y_cal = np.asarray(y_cal, dtype=float)
        y_pred = np.asarray(model.predict(X_cal), dtype=float)

        # Normalised non-conformity score: relative error
        denom = np.maximum(y_pred, 1.0)  # avoid divide-by-zero
        scores = np.abs(y_cal - y_pred) / denom

        self._n_cal = len(scores)
        level = np.ceil((self._n_cal + 1) * (1 - self.alpha)) / self._n_cal
        level = min(level, 1.0)
        self._q_hat = float(np.quantile(scores, level))

        logger.info(
            f"Adaptive conformal calibration: n_cal={self._n_cal}, "
            f"α={self.alpha}, relative_q̂={self._q_hat:.4f} "
            f"({self._q_hat * 100:.1f}%)"
        )
        return self

    def predict_interval(
        self,
        point_estimate: float,
        symmetric: bool = True,
    ) -> Tuple[float, float]:
        if self._q_hat is None:
            raise RuntimeError("Adaptive predictor not calibrated.")
        margin = self._q_hat * point_estimate
        lower = max(0.0, point_estimate - margin)
        upper = point_estimate + margin
        return lower, upper

    def predict_intervals_batch(
        self,
        point_estimates: np.ndarray,
    ) -> Tuple[np.ndarray, np.ndarray]:
        if self._q_hat is None:
            raise RuntimeError("Adaptive predictor not calibrated.")
        margin = self._q_hat * point_estimates
        lower = np.maximum(0.0, point_estimates - margin)
        upper = point_estimates + margin
        return lower, upper
