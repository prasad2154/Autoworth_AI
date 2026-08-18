"""
AutoWorth AI — Auth Tests
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

# Use SQLite for tests
TEST_DATABASE_URL = "sqlite:///./test.db"
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


def test_register_success():
    response = client.post("/api/v1/auth/register", json={
        "full_name": "Test User",
        "email": "test@example.com",
        "password": "TestPass1",
        "confirm_password": "TestPass1",
    })
    assert response.status_code == 201
    assert "created successfully" in response.json()["message"]


def test_register_duplicate_email():
    payload = {
        "full_name": "Test User",
        "email": "dup@example.com",
        "password": "TestPass1",
        "confirm_password": "TestPass1",
    }
    client.post("/api/v1/auth/register", json=payload)
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 409


def test_register_weak_password():
    response = client.post("/api/v1/auth/register", json={
        "full_name": "Test User",
        "email": "weak@example.com",
        "password": "short",
        "confirm_password": "short",
    })
    assert response.status_code == 422


def test_register_password_mismatch():
    response = client.post("/api/v1/auth/register", json={
        "full_name": "Test User",
        "email": "mismatch@example.com",
        "password": "TestPass1",
        "confirm_password": "Different1",
    })
    assert response.status_code == 422


def test_login_success():
    # Register first
    client.post("/api/v1/auth/register", json={
        "full_name": "Login User",
        "email": "login@example.com",
        "password": "TestPass1",
        "confirm_password": "TestPass1",
    })
    response = client.post("/api/v1/auth/login", json={
        "email": "login@example.com",
        "password": "TestPass1",
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_invalid_credentials():
    response = client.post("/api/v1/auth/login", json={
        "email": "nobody@example.com",
        "password": "WrongPass1",
    })
    assert response.status_code == 401


def test_get_me_requires_auth():
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 403  # No bearer token


def test_get_me_with_valid_token():
    # Register + login
    client.post("/api/v1/auth/register", json={
        "full_name": "Me User",
        "email": "me@example.com",
        "password": "TestPass1",
        "confirm_password": "TestPass1",
    })
    login_resp = client.post("/api/v1/auth/login", json={
        "email": "me@example.com",
        "password": "TestPass1",
    })
    token = login_resp.json()["access_token"]

    response = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert response.json()["email"] == "me@example.com"


def test_forgot_password_always_200():
    # Should return 200 even for non-existent email
    response = client.post("/api/v1/auth/forgot-password", json={"email": "ghost@example.com"})
    assert response.status_code == 200


def test_health_check():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"
