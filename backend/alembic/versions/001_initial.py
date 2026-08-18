"""
AutoWorth AI — Initial Database Migration

Creates all core tables:
  users, vehicles, valuations, saved_cars, price_alerts,
  market_data, model_versions

Revision ID: 001_initial
Revises: —
Create Date: 2026-08-18
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "001_initial"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── users ──────────────────────────────────────────────────────────────────
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("full_name", sa.String(length=120), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("profile_image", sa.String(length=500), nullable=True),
        sa.Column(
            "role",
            sa.Enum("USER", "ADMIN", name="userrole"),
            nullable=False,
            server_default="USER",
        ),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("reset_token", sa.String(length=255), nullable=True),
        sa.Column("reset_token_expires", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)
    op.create_index("ix_users_id", "users", ["id"])

    # ── vehicles ───────────────────────────────────────────────────────────────
    op.create_table(
        "vehicles",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("brand", sa.String(length=100), nullable=False),
        sa.Column("model", sa.String(length=100), nullable=False),
        sa.Column("variant", sa.String(length=100), nullable=True),
        sa.Column("year", sa.Integer(), nullable=False),
        sa.Column(
            "fuel_type",
            sa.Enum("Petrol", "Diesel", "CNG", "Electric", "Hybrid", "LPG", name="fueltype"),
            nullable=False,
        ),
        sa.Column(
            "transmission",
            sa.Enum("Manual", "Automatic", "AMT", "CVT", "DCT", name="transmissiontype"),
            nullable=False,
        ),
        sa.Column("kilometers_driven", sa.Integer(), nullable=False),
        sa.Column("city", sa.String(length=100), nullable=False),
        sa.Column("mileage_kmpl", sa.Float(), nullable=True),
        sa.Column("engine_cc", sa.Integer(), nullable=True),
        sa.Column("max_power_bhp", sa.Float(), nullable=True),
        sa.Column("seats", sa.Integer(), nullable=True),
        sa.Column("color", sa.String(length=50), nullable=True),
        sa.Column("owner_number", sa.Integer(), nullable=True),
        sa.Column("insurance_valid", sa.Boolean(), nullable=True),
        sa.Column("registration_state", sa.String(length=10), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_vehicles_brand", "vehicles", ["brand"])
    op.create_index("ix_vehicles_id", "vehicles", ["id"])

    # ── valuations ─────────────────────────────────────────────────────────────
    op.create_table(
        "valuations",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("vehicle_id", sa.Integer(), nullable=True),
        sa.Column("predicted_price", sa.Float(), nullable=False),
        sa.Column("price_lower", sa.Float(), nullable=True),
        sa.Column("price_upper", sa.Float(), nullable=True),
        sa.Column("confidence_score", sa.Float(), nullable=True),
        sa.Column(
            "market_status",
            sa.Enum("Good Deal", "Fair Price", "Overpriced", name="marketstatus"),
            nullable=True,
        ),
        sa.Column("depreciation_rate", sa.Float(), nullable=True),
        sa.Column("shap_values", sa.Text(), nullable=True),
        sa.Column("input_features", sa.Text(), nullable=True),
        sa.Column("model_version", sa.String(length=50), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["vehicle_id"], ["vehicles.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_valuations_id", "valuations", ["id"])
    op.create_index("ix_valuations_user_id", "valuations", ["user_id"])

    # ── saved_cars ─────────────────────────────────────────────────────────────
    op.create_table(
        "saved_cars",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("vehicle_id", sa.Integer(), nullable=False),
        sa.Column("saved_price", sa.Float(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["vehicle_id"], ["vehicles.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "vehicle_id", name="uq_saved_cars_user_vehicle"),
    )
    op.create_index("ix_saved_cars_id", "saved_cars", ["id"])

    # ── price_alerts ───────────────────────────────────────────────────────────
    op.create_table(
        "price_alerts",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("vehicle_id", sa.Integer(), nullable=True),
        sa.Column("brand", sa.String(length=100), nullable=False),
        sa.Column("model", sa.String(length=100), nullable=False),
        sa.Column("year", sa.Integer(), nullable=False),
        sa.Column(
            "fuel_type",
            sa.Enum("Petrol", "Diesel", "CNG", "Electric", "Hybrid", "LPG", name="fueltype"),
            nullable=False,
        ),
        sa.Column("target_price", sa.Float(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("is_triggered", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("triggered_at", sa.DateTime(), nullable=True),
        sa.Column("triggered_price", sa.Float(), nullable=True),
        sa.Column("notify_email", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("notify_in_app", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["vehicle_id"], ["vehicles.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_price_alerts_id", "price_alerts", ["id"])

    # ── market_data ────────────────────────────────────────────────────────────
    op.create_table(
        "market_data",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("brand", sa.String(length=100), nullable=False),
        sa.Column("model", sa.String(length=100), nullable=False),
        sa.Column("year", sa.Integer(), nullable=False),
        sa.Column("fuel_type", sa.String(length=50), nullable=False),
        sa.Column("city", sa.String(length=100), nullable=True),
        sa.Column("avg_price", sa.Float(), nullable=False),
        sa.Column("min_price", sa.Float(), nullable=True),
        sa.Column("max_price", sa.Float(), nullable=True),
        sa.Column("listing_count", sa.Integer(), nullable=True),
        sa.Column("recorded_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_market_data_id", "market_data", ["id"])

    # ── model_versions ─────────────────────────────────────────────────────────
    op.create_table(
        "model_versions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("version", sa.String(length=50), nullable=False),
        sa.Column("algorithm", sa.String(length=100), nullable=False),
        sa.Column("mae", sa.Float(), nullable=True),
        sa.Column("rmse", sa.Float(), nullable=True),
        sa.Column("r2", sa.Float(), nullable=True),
        sa.Column("mape", sa.Float(), nullable=True),
        sa.Column("training_samples", sa.Integer(), nullable=True),
        sa.Column("feature_count", sa.Integer(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("trained_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_model_versions_id", "model_versions", ["id"])


def downgrade() -> None:
    op.drop_table("model_versions")
    op.drop_table("market_data")
    op.drop_table("price_alerts")
    op.drop_table("saved_cars")
    op.drop_table("valuations")
    op.drop_table("vehicles")
    op.drop_table("users")
