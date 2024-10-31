import pytest
import warnings
from app import app
import os

@pytest.fixture
def client():
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client

@pytest.fixture(autouse=True)
def suppress_warnings():
    warnings.filterwarnings("ignore", message="FP16 is not supported on CPU; using FP32 instead")

def test_home_route(client):
    response = client.get("/")
    assert response.status_code == 200
    assert b"Automatic Speech Recogniser" in response.data

def test_start_recording(client):
    response = client.post("/record-audio", json={"action": "start"})
    assert response.status_code == 200
    assert response.get_json()["status"] == "recording"

def test_pause_recording(client):
    response = client.post("/pause-recording", json={"action": "pause"})
    assert response.status_code == 200
    assert response.get_json()["status"] == "paused"

def test_resume_recording(client):
    response = client.post("/resume-recording", json={"action": "resume"})
    assert response.status_code == 200
    assert response.get_json()["status"] == "recording"

def test_stop_recording(client):
    filename = "static/test.wav"
    response = client.post("/stop-recording", json={"action": "stop", "filename": "test.wav"})
    assert response.status_code == 200
    assert response.get_json()["status"] == "stopped"

    if os.path.exists(filename):
        os.remove(filename)

def test_generate_spectrogram_invalid_file(client):
    response = client.post("/generate-spectrogram", json={"audioFileURL": "non_existent_file.wav"})
    assert response.status_code == 500
    assert "error" in response.get_json()

def test_get_transcript_whisper_invalid_file(client):
    response = client.post("/get-transcript-whisper", json={"fileName": "non_existent_file.wav"})
    assert response.status_code == 500
    assert "error" in response.get_json()
