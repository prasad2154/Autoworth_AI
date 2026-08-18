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
MODEL_DIR = BASE_DIR / "models"


class ModelLoader:
    """Singleton model loader — loads once at startup."""

    _instance: Optional["ModelLoader"] = None

    def __new__(cls) -> "ModelLoader":
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._loaded = False
        return cls._instance

    def load(self) -> None:
        if self._loaded:
            return

        model_path = MODEL_DIR / "autoworth_model.pkl"
        preprocessor_path = MODEL_DIR / "preprocessor.pkl"
        metadata_path = MODEL_DIR / "metadata.json"

        if not model_path.exists():
            print(f"⚠️  Model not found at {model_path}. Run scripts/train_model.py first.")
            self._loaded = False
            self.model = None
            self.preprocessor = None
            self.metadata = {}
            self.feature_names = []
            self.residuals = []
            return

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
