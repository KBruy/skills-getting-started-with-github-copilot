import pytest
from fastapi.testclient import TestClient
from src.app import app

client = TestClient(app)

def test_get_activities():
    response = client.get("/activities")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    assert "Basketball" in data

def test_signup_for_activity():
    email = "testuser@mergington.edu"
    activity = "Basketball"
    # Ensure user is not already signed up
    client.post(f"/activities/{activity}/remove", params={"email": email})
    response = client.post(f"/activities/{activity}/signup", params={"email": email})
    assert response.status_code == 200
    assert f"Signed up {email} for {activity}" in response.json()["message"]
    # Try signing up again (should fail)
    response2 = client.post(f"/activities/{activity}/signup", params={"email": email})
    assert response2.status_code == 400
    assert "already signed up" in response2.json()["detail"]

def test_remove_participant():
    email = "removeuser@mergington.edu"
    activity = "Tennis Club"
    # Add user first
    client.post(f"/activities/{activity}/signup", params={"email": email})
    response = client.post(f"/activities/{activity}/remove", params={"email": email})
    assert response.status_code == 200
    assert f"Removed {email} from {activity}" in response.json()["message"]
    # Try removing again (should fail)
    response2 = client.post(f"/activities/{activity}/remove", params={"email": email})
    assert response2.status_code == 404
    assert "Participant not found" in response2.json()["detail"]

def test_signup_activity_not_found():
    response = client.post("/activities/Nonexistent/signup", params={"email": "x@x.com"})
    assert response.status_code == 404
    assert "Activity not found" in response.json()["detail"]

def test_remove_activity_not_found():
    response = client.post("/activities/Nonexistent/remove", params={"email": "x@x.com"})
    assert response.status_code == 404
    assert "Activity not found" in response.json()["detail"]
