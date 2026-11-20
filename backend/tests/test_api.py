"""
Integration and Unit Tests for Medinexa AI FastAPI Backend
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.security import hash_password, verify_password

client = TestClient(app)

def test_password_hashing():
    pwd = "SecretPassword123!"
    hashed = hash_password(pwd)
    assert verify_password(pwd, hashed) is True
    assert verify_password("WrongPassword", hashed) is False

def test_health_endpoint():
    response = client.get("/api/v1/health/")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"
    assert response.json()["demo_mode"] is True

def test_auth_login_demo_user():
    response = client.post("/api/v1/auth/login", json={
        "email": "user@medinexa.ai",
        "password": "User123!"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "user@medinexa.ai"
    assert data["user"]["role"] == "user"

def test_auth_login_invalid_password():
    response = client.post("/api/v1/auth/login", json={
        "email": "user@medinexa.ai",
        "password": "WrongPassword999!"
    })
    assert response.status_code == 401

def test_hospitals_search():
    response = client.get("/api/v1/hospitals/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    assert "name" in data[0]

def test_doctors_list():
    response = client.get("/api/v1/doctors/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    assert "full_name" in data[0]

def test_telehealth_emergency_red_flag():
    # Login first
    login_res = client.post("/api/v1/auth/login", json={
        "email": "user@medinexa.ai",
        "password": "User123!"
    })
    token = login_res.json()["access_token"]

    response = client.post(
        "/api/v1/telehealth/chat",
        headers={"Authorization": f"Bearer {token}"},
        json={"message": "I am experiencing severe chest pain and left arm numbness"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["is_emergency"] is True
    assert "999" in data["reply"]
