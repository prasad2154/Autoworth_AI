"""
AutoWorth AI — SQLAlchemy ORM Models
All database tables defined here.
"""
from __future__ import annotations
from datetime import datetime
from typing import Optional, List
from sqlalchemy import (
    Boolean, Column, DateTime, Float, ForeignKey,
    Integer, String, Text, Enum as SAEnum, func
)
from sqlalchemy.orm import relationship, Mapped, mapped_column
import enum

from .database import Base


# ─── Enums ────────────────────────────────────────────────────────────────────

class UserRole(str, enum.Enum):
    USER = "USER"
    ADMIN = "ADMIN"


class FuelType(str, enum.Enum):
    PETROL = "Petrol"
    DIESEL = "Diesel"
    CNG = "CNG"
    ELECTRIC = "Electric"
    HYBRID = "Hybrid"
    LPG = "LPG"


class TransmissionType(str, enum.Enum):
    MANUAL = "Manual"
    AUTOMATIC = "Automatic"
    AMT = "AMT"
    CVT = "CVT"
    DCT = "DCT"


class AlertType(str, enum.Enum):
    PRICE_DROP = "price_drop"
    PRICE_RISE = "price_rise"
    PERCENTAGE_CHANGE = "percentage_change"


class MarketStatus(str, enum.Enum):
    GOOD_DEAL = "Good Deal"
    FAIR_PRICE = "Fair Price"
    OVERPRICED = "Overpriced"


# ─── Users ────────────────────────────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    full_name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    profile_image: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    role: Mapped[str] = mapped_column(SAEnum(UserRole), default=UserRole.USER, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    reset_token: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    reset_token_expires: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    valuations: Mapped[List["Valuation"]] = relationship("Valuation", back_populates="user", cascade="all, delete-orphan")
    saved_cars: Mapped[List["SavedCar"]] = relationship("SavedCar", back_populates="user", cascade="all, delete-orphan")
    price_alerts: Mapped[List["PriceAlert"]] = relationship("PriceAlert", back_populates="user", cascade="all, delete-orphan")


# ─── Vehicles ─────────────────────────────────────────────────────────────────

class Vehicle(Base):
    __tablename__ = "vehicles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    brand: Mapped[str] = mapped_column(String(80), nullable=False, index=True)
    model: Mapped[str] = mapped_column(String(120), nullable=False, index=True)
    variant: Mapped[Optional[str]] = mapped_column(String(120), nullable=True)
    year: Mapped[int] = mapped_column(Integer, nullable=False)
    fuel_type: Mapped[str] = mapped_column(SAEnum(FuelType), nullable=False)
    transmission: Mapped[str] = mapped_column(SAEnum(TransmissionType), nullable=False)
    engine_cc: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    mileage: Mapped[Optional[float]] = mapped_column(Float, nullable=True)  # km/l
    seating_capacity: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)

    # Relationships
    valuations: Mapped[List["Valuation"]] = relationship("Valuation", back_populates="vehicle")
    saved_cars: Mapped[List["SavedCar"]] = relationship("SavedCar", back_populates="vehicle")
    price_alerts: Mapped[List["PriceAlert"]] = relationship("PriceAlert", back_populates="vehicle")
    market_data: Mapped[List["MarketData"]] = relationship("MarketData", back_populates="vehicle")


# ─── Valuations ───────────────────────────────────────────────────────────────

class Valuation(Base):
    __tablename__ = "valuations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    vehicle_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("vehicles.id", ondelete="SET NULL"), nullable=True)

    # Input parameters
    km_driven: Mapped[int] = mapped_column(Integer, nullable=False)
    owner_count: Mapped[int] = mapped_column(Integer, default=1)
    condition_score: Mapped[float] = mapped_column(Float, nullable=False)
    accident_history: Mapped[bool] = mapped_column(Boolean, default=False)
    service_history: Mapped[bool] = mapped_column(Boolean, default=True)
    city: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    state: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    # Prediction output
    predicted_price: Mapped[float] = mapped_column(Float, nullable=False)
    lower_price: Mapped[float] = mapped_column(Float, nullable=False)
    upper_price: Mapped[float] = mapped_column(Float, nullable=False)
    confidence: Mapped[float] = mapped_column(Float, nullable=False)
    market_average: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    recommended_listing_price: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    deal_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    market_status: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    # Metadata
    model_version: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    shap_values: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # JSON
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="valuations")
    vehicle: Mapped[Optional["Vehicle"]] = relationship("Vehicle", back_populates="valuations")


# ─── Saved Cars ───────────────────────────────────────────────────────────────

class SavedCar(Base):
    __tablename__ = "saved_cars"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    vehicle_id: Mapped[int] = mapped_column(Integer, ForeignKey("vehicles.id", ondelete="CASCADE"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="saved_cars")
    vehicle: Mapped["Vehicle"] = relationship("Vehicle", back_populates="saved_cars")


# ─── Price Alerts ─────────────────────────────────────────────────────────────

class PriceAlert(Base):
    __tablename__ = "price_alerts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    vehicle_id: Mapped[int] = mapped_column(Integer, ForeignKey("vehicles.id", ondelete="CASCADE"), nullable=False)
    target_price: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    percentage_change: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    alert_type: Mapped[str] = mapped_column(SAEnum(AlertType), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="price_alerts")
    vehicle: Mapped["Vehicle"] = relationship("Vehicle", back_populates="price_alerts")


# ─── Market Data ──────────────────────────────────────────────────────────────

class MarketData(Base):
    __tablename__ = "market_data"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    vehicle_id: Mapped[int] = mapped_column(Integer, ForeignKey("vehicles.id", ondelete="CASCADE"), nullable=False)
    city: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    state: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    listing_price: Mapped[float] = mapped_column(Float, nullable=False)
    selling_price: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    km_driven: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    listing_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    source: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)

    vehicle: Mapped["Vehicle"] = relationship("Vehicle", back_populates="market_data")


# ─── Model Versions ───────────────────────────────────────────────────────────

class ModelVersion(Base):
    __tablename__ = "model_versions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    model_name: Mapped[str] = mapped_column(String(100), nullable=False)
    version: Mapped[str] = mapped_column(String(20), nullable=False)
    algorithm: Mapped[str] = mapped_column(String(80), nullable=False)
    mae: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    rmse: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    r2_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    mape: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    training_records: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    feature_count: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    model_path: Mapped[Optional[str]] = mapped_column(String(300), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    trained_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)
