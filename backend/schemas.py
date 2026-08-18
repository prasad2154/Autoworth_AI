"""
AutoWorth AI — Pydantic Schemas
Request/Response models for all API endpoints.
"""
from __future__ import annotations
from datetime import datetime
from typing import Optional, List, Any, Dict
from pydantic import BaseModel, EmailStr, Field, field_validator
import re


# ─── Auth ─────────────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(..., min_length=8)
    confirm_password: str

    @field_validator("full_name")
    @classmethod
    def name_must_not_be_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Full name cannot be blank")
        return v.strip()

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r"[0-9]", v):
            raise ValueError("Password must contain at least one digit")
        return v

    @field_validator("confirm_password")
    @classmethod
    def passwords_match(cls, v: str, info: Any) -> str:
        if "password" in info.data and v != info.data["password"]:
            raise ValueError("Passwords do not match")
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    remember_me: bool = False


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8)
    confirm_password: str

    @field_validator("confirm_password")
    @classmethod
    def passwords_match(cls, v: str, info: Any) -> str:
        if "new_password" in info.data and v != info.data["new_password"]:
            raise ValueError("Passwords do not match")
        return v


# ─── Users ────────────────────────────────────────────────────────────────────

class UserResponse(BaseModel):
    id: int
    full_name: str
    email: str
    profile_image: Optional[str] = None
    role: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class UpdateProfileRequest(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2, max_length=120)
    profile_image: Optional[str] = None


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8)
    confirm_password: str

    @field_validator("confirm_password")
    @classmethod
    def passwords_match(cls, v: str, info: Any) -> str:
        if "new_password" in info.data and v != info.data["new_password"]:
            raise ValueError("Passwords do not match")
        return v


# ─── Vehicles ─────────────────────────────────────────────────────────────────

class VehicleResponse(BaseModel):
    id: int
    brand: str
    model: str
    variant: Optional[str] = None
    year: int
    fuel_type: str
    transmission: str
    engine_cc: Optional[int] = None
    mileage: Optional[float] = None
    seating_capacity: Optional[int] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class VehicleCreate(BaseModel):
    brand: str = Field(..., min_length=1, max_length=80)
    model: str = Field(..., min_length=1, max_length=120)
    variant: Optional[str] = None
    year: int = Field(..., ge=1980, le=2026)
    fuel_type: str
    transmission: str
    engine_cc: Optional[int] = Field(None, ge=50, le=10000)
    mileage: Optional[float] = Field(None, ge=0)
    seating_capacity: Optional[int] = Field(None, ge=2, le=9)


# ─── Prediction ───────────────────────────────────────────────────────────────

class SHAPFeature(BaseModel):
    feature: str
    value: float
    impact: float
    direction: str  # "positive" | "negative"


class PredictionRequest(BaseModel):
    brand: str
    model: str
    variant: Optional[str] = None
    year: int = Field(..., ge=1990, le=2026)
    fuel_type: str
    transmission: str
    engine_cc: Optional[int] = Field(None, ge=50, le=10000)
    mileage_kmpl: Optional[float] = Field(None, ge=0)
    seating_capacity: Optional[int] = Field(None, ge=2, le=9)
    km_driven: int = Field(..., ge=0, le=2000000)
    owner_count: int = Field(1, ge=1, le=5)
    condition_score: float = Field(..., ge=0, le=100)
    accident_history: bool = False
    service_history: bool = True
    city: Optional[str] = None
    state: Optional[str] = None


class PredictionResponse(BaseModel):
    predicted_price: float
    lower_bound: float
    upper_bound: float
    confidence: float
    market_average: Optional[float] = None
    recommended_listing_price: float
    deal_score: float
    market_status: str
    shap_features: List[SHAPFeature]
    depreciation_curve: List[Dict[str, Any]]
    comparable_vehicles: List[Dict[str, Any]]
    ai_recommendation: str
    model_version: str
    valuation_id: Optional[int] = None


class SimulationRequest(BaseModel):
    base_prediction_id: Optional[int] = None
    brand: str
    model: str
    year: int
    fuel_type: str
    transmission: str
    engine_cc: Optional[int] = None
    scenarios: List[Dict[str, Any]]  # [{km_driven, owner_count, condition_score, ...}]


class SimulationResponse(BaseModel):
    scenarios: List[Dict[str, Any]]


class NegotiationRequest(BaseModel):
    valuation_id: Optional[int] = None
    predicted_price: float
    asking_price: float
    vehicle_details: Dict[str, Any]


class NegotiationResponse(BaseModel):
    assessment: str
    suggested_offer: float
    negotiation_tips: List[str]
    walk_away_price: float
    fair_range: Dict[str, float]


# ─── Valuations (History) ─────────────────────────────────────────────────────

class ValuationHistoryItem(BaseModel):
    id: int
    km_driven: int
    owner_count: int
    condition_score: float
    accident_history: bool
    service_history: bool
    city: Optional[str] = None
    state: Optional[str] = None
    predicted_price: float
    lower_price: float
    upper_price: float
    confidence: float
    market_average: Optional[float] = None
    recommended_listing_price: Optional[float] = None
    deal_score: Optional[float] = None
    market_status: Optional[str] = None
    model_version: Optional[str] = None
    created_at: datetime
    vehicle: Optional[VehicleResponse] = None

    model_config = {"from_attributes": True}


# ─── Saved Cars ───────────────────────────────────────────────────────────────

class SavedCarResponse(BaseModel):
    id: int
    vehicle: VehicleResponse
    created_at: datetime

    model_config = {"from_attributes": True}


class SaveCarRequest(BaseModel):
    vehicle_id: int


# ─── Price Alerts ─────────────────────────────────────────────────────────────

class CreateAlertRequest(BaseModel):
    vehicle_id: int
    target_price: Optional[float] = Field(None, ge=0)
    percentage_change: Optional[float] = Field(None, ge=0, le=100)
    alert_type: str  # price_drop | price_rise | percentage_change


class AlertResponse(BaseModel):
    id: int
    vehicle: VehicleResponse
    target_price: Optional[float] = None
    percentage_change: Optional[float] = None
    alert_type: str
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class UpdateAlertRequest(BaseModel):
    is_active: Optional[bool] = None
    target_price: Optional[float] = None
    percentage_change: Optional[float] = None


# ─── Market ───────────────────────────────────────────────────────────────────

class MarketSummaryResponse(BaseModel):
    total_listings: int
    average_price: float
    median_price: float
    price_trend: float  # % change
    most_popular_brand: str
    most_popular_model: str
    avg_km_driven: float
    brand_distribution: List[Dict[str, Any]]
    fuel_distribution: List[Dict[str, Any]]
    price_range_distribution: List[Dict[str, Any]]


# ─── Admin ────────────────────────────────────────────────────────────────────

class AdminStatsResponse(BaseModel):
    total_users: int
    total_valuations: int
    total_vehicles: int
    predictions_today: int
    avg_predicted_value: float
    most_valued_brand: str
    most_popular_vehicle: str
    active_model_version: Optional[str]
    system_health: Dict[str, Any]


class ModelVersionResponse(BaseModel):
    id: int
    model_name: str
    version: str
    algorithm: str
    mae: Optional[float] = None
    rmse: Optional[float] = None
    r2_score: Optional[float] = None
    mape: Optional[float] = None
    training_records: Optional[int] = None
    feature_count: Optional[int] = None
    model_path: Optional[str] = None
    is_active: bool
    trained_at: datetime

    model_config = {"from_attributes": True}


# ─── Generic ──────────────────────────────────────────────────────────────────

class MessageResponse(BaseModel):
    message: str
    success: bool = True


class PaginatedResponse(BaseModel):
    items: List[Any]
    total: int
    page: int
    page_size: int
    pages: int
