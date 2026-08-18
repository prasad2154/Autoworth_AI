"""
AutoWorth AI — Vehicles API Tests
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
from models import Vehicle, FuelType, TransmissionType

TEST_DATABASE_URL = "sqlite:///./test_vehicles.db"
engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db


def _seed_vehicles(db):
    vehicles = [
        Vehicle(
            brand="Maruti Suzuki", model="Swift", variant="VXI", year=2022,
            fuel_type=FuelType.PETROL, transmission=TransmissionType.MANUAL,
            kilometers_driven=15000, city="Mumbai", mileage_kmpl=23.2,
            engine_cc=1197, max_power_bhp=89.0, seats=5, color="Red",
            owner_number=1, insurance_valid=True, registration_state="MH",
        ),
        Vehicle(
            brand="Hyundai", model="i20", variant="Sportz", year=2021,
            fuel_type=FuelType.DIESEL, transmission=TransmissionType.MANUAL,
            kilometers_driven=30000, city="Delhi", mileage_kmpl=25.0,
            engine_cc=1493, max_power_bhp=99.0, seats=5, color="Blue",
            owner_number=1, insurance_valid=True, registration_state="DL",
        ),
        Vehicle(
            brand="Tata", model="Nexon EV", variant="XZ+", year=2023,
            fuel_type=FuelType.ELECTRIC, transmission=TransmissionType.AUTOMATIC,
            kilometers_driven=5000, city="Bangalore", mileage_kmpl=None,
            engine_cc=None, max_power_bhp=129.0, seats=5, color="White",
            owner_number=1, insurance_valid=True, registration_state="KA",
        ),
    ]
    db.add_all(vehicles)
    db.commit()


@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        _seed_vehicles(db)
    finally:
        db.close()
    yield
    Base.metadata.drop_all(bind=engine)


client = TestClient(app)


def _get_auth_token(email="vehicle@example.com", password="TestPass1"):
    client.post("/api/v1/auth/register", json={
        "full_name": "Vehicle Tester",
        "email": email,
        "password": password,
        "confirm_password": password,
    })
    resp = client.post("/api/v1/auth/login", json={
        "email": email,
        "password": password,
    })
    return resp.json().get("access_token")


def test_get_vehicles_requires_auth():
    response = client.get("/api/v1/vehicles/")
    assert response.status_code in (401, 403)


def test_get_vehicles_returns_seeded_data():
    token = _get_auth_token()
    response = client.get(
        "/api/v1/vehicles/",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    items = data.get("items", data) if isinstance(data, dict) else data
    assert len(items) >= 3


def test_get_vehicles_filter_brand():
    token = _get_auth_token("brand@example.com")
    response = client.get(
        "/api/v1/vehicles/?brand=Hyundai",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    items = data.get("items", data) if isinstance(data, dict) else data
    for item in items:
        assert item["brand"] == "Hyundai"


def test_get_vehicles_filter_fuel():
    token = _get_auth_token("fuel@example.com")
    response = client.get(
        "/api/v1/vehicles/?fuel_type=Electric",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    items = data.get("items", data) if isinstance(data, dict) else data
    for item in items:
        assert item["fuel_type"] == "Electric"


def test_get_vehicle_by_id():
    token = _get_auth_token("byid@example.com")
    list_resp = client.get(
        "/api/v1/vehicles/",
        headers={"Authorization": f"Bearer {token}"}
    )
    data = list_resp.json()
    items = data.get("items", data) if isinstance(data, dict) else data
    vehicle_id = items[0]["id"]

    detail_resp = client.get(
        f"/api/v1/vehicles/{vehicle_id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert detail_resp.status_code == 200
    assert detail_resp.json()["id"] == vehicle_id


def test_get_vehicle_not_found():
    token = _get_auth_token("nf@example.com")
    response = client.get(
        "/api/v1/vehicles/999999",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 404


def test_get_brands():
    token = _get_auth_token("brands@example.com")
    response = client.get(
        "/api/v1/vehicles/brands",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    brands = response.json()
    assert isinstance(brands, list)
    assert len(brands) >= 1


def test_get_models_for_brand():
    token = _get_auth_token("models@example.com")
    response = client.get(
        "/api/v1/vehicles/models?brand=Maruti+Suzuki",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    models = response.json()
    assert isinstance(models, list)
    assert "Swift" in models
