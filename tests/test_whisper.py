from unittest.mock import patch
from openai_whisper import get_transcription


@patch("openai_whisper.MODEL.transcribe")
def test_get_transcription(mock_transcribe):
    mock_transcribe.return_value = {"text": "Mocked transcription"}
    transcript = get_transcription("mock_audio_file.wav")
    assert transcript == "Mocked transcription"
