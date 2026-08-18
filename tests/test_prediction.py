"""
AutoWorth AI — Prediction API Tests
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from main import app
from database import Base, get_db

TEST_DATABASE_URL = "sqlite:///./test_pred.db"
engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


client = TestClient(app)

VALID_VEHICLE = {
    "brand": "Hyundai",
    "model": "Creta",
    "year": 2021,
    "fuel_type": "Petrol",
    "transmission": "Automatic",
    "engine_cc": 1497,
    "mileage_kmpl": 16.0,
    "seating_capacity": 5,
    "km_driven": 35000,
    "owner_count": 1,
    "condition_score": 82.0,
    "accident_history": False,
    "service_history": True,
    "city": "Mumbai",
    "state": "Maharashtra",
}


def _get_auth_token():
    client.post("/api/v1/auth/register", json={
        "full_name": "Pred Tester",
        "email": "pred@example.com",
        "password": "TestPass1",
        "confirm_password": "TestPass1",
    })
    resp = client.post("/api/v1/auth/login", json={
        "email": "pred@example.com",
        "password": "TestPass1",
    })
    return resp.json().get("access_token")


def test_predict_requires_auth():
    response = client.post("/api/v1/predict", json=VALID_VEHICLE)
    assert response.status_code == 403


def test_predict_invalid_year():
    token = _get_auth_token()
    bad = {**VALID_VEHICLE, "year": 1800}
    response = client.post(
        "/api/v1/predict", json=bad,
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 422


def test_predict_negative_km():
    token = _get_auth_token()
    bad = {**VALID_VEHICLE, "km_driven": -1000}
    response = client.post(
        "/api/v1/predict", json=bad,
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 422


def test_valuation_history_empty():
    token = _get_auth_token()
    response = client.get(
        "/api/v1/valuations",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 0


def test_negotiation_above_fair():
    token = _get_auth_token()
    response = client.post(
        "/api/v1/negotiation",
        json={
            "predicted_price": 600000,
            "asking_price": 750000,
            "vehicle_details": VALID_VEHICLE,
        },
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "assessment" in data
    assert data["suggested_offer"] < 750000


def test_admin_stats_requires_admin():
    token = _get_auth_token()
    response = client.get(
        "/api/v1/admin/stats",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 403
