"""
AutoWorth AI — ML Model Loader
Loads trained model, preprocessor, and metadata from disk at startup.
"""
from __future__ import annotations
import json
import os
from pathlib import Path
from typing import Optional, Any
import joblib

# Project-relative model directory
BASE_DIR = Path(__file__).parent.parent.parent
POSSIBLE_MODEL_DIRS = [
    Path(os.getenv("MODEL_DIR")) if os.getenv("MODEL_DIR") else None,
    BASE_DIR / "models",
    BASE_DIR / "backend" / "models",
    Path("/app/models"),
]


class ModelLoader:
    """Singleton model loader — loads once at startup."""

    _instance: Optional["ModelLoader"] = None

    def __new__(cls) -> "ModelLoader":
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._loaded = False
        return cls._instance

    def _find_model_dir(self) -> Optional[Path]:
        for d in POSSIBLE_MODEL_DIRS:
            if d and d.exists() and (d / "autoworth_model.pkl").exists():
                return d
        return None

    def load(self) -> None:
        if self._loaded:
            return

        model_dir = self._find_model_dir()
        if not model_dir:
            print("⚠️  Model not found in expected paths. Falling back to rule-based estimations.")
            self._loaded = False
            self.model = None
            self.preprocessor = None
            self.metadata = {}
            self.feature_names = []
            self.residuals = []
            return

        model_path = model_dir / "autoworth_model.pkl"
        preprocessor_path = model_dir / "preprocessor.pkl"
        metadata_path = model_dir / "metadata.json"

        self.model = joblib.load(model_path)
        self.preprocessor = joblib.load(preprocessor_path) if preprocessor_path.exists() else None

        with open(metadata_path, "r") as f:
            self.metadata = json.load(f)

        self.feature_names = self.metadata.get("feature_names", [])
        self.residuals = self.metadata.get("residuals", [])
        self._loaded = True
        print(f"✅ Model loaded: {self.metadata.get('algorithm')} v{self.metadata.get('version')}")

    @property
    def is_ready(self) -> bool:
        return self._loaded and self.model is not None

    def get_model(self) -> Any:
        if not self.is_ready:
            raise RuntimeError("Model not loaded. Run scripts/train_model.py first.")
        return self.model

    def get_preprocessor(self) -> Any:
        if not self.is_ready:
            raise RuntimeError("Preprocessor not loaded.")
        return self.preprocessor


# Global singleton
model_loader = ModelLoader()
