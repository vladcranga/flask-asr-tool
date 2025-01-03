from pathlib import Path

import whisper

MODEL = whisper.load_model("small")
AUDIO_DIR = Path(__file__).parent / "static"


def get_transcription(audio_file: str):
    result = MODEL.transcribe(str(AUDIO_DIR) + "/" + audio_file)
    result = result["text"]
    return result
