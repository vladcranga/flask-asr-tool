# Automatic Speech Recogniser

This project is an **Automatic Speech Recognition (ASR) Tool** that provides a user-friendly interface for recording, transcribing, editing, and saving speech data. Built using **Flask**, it includes features for recording audio, generating transcriptions using OpenAI Whisper, and visualising audio spectrograms.

## Features
- **Record Audio:** Users can record audio directly in the web interface with simple start, pause, and stop controls.
- **Audio File Management:** Users can load existing audio files from their system for transcription and analysis.
- **Interactive UI:** The tool features a waveform viewer for uploaded or recorded audio files.
- **ASR with Whisper Model:** The recorded audio can be transcribed using OpenAI's Whisper model to generate transcriptions. The result can then be edited and saved.
- **Spectrogram Generation:** The tool can generate a spectrogram visualisation of recorded or uploaded audio files.

## Requirements
- Python 3.x
- **Flask** for the web framework
- **Sounddevice** for capturing audio input
- **Whisper** for automatic speech recognition (ASR)
- **Matplotlib** for generating spectrograms
- **Pydub** and **Soundfile** for audio processing

## Setup Instructions
Follow these steps to set up the ASR Annotation Tool:

1. **Clone the Repository**
   ```
   git clone <repository-url>
   cd asr-annotation-tool
   ```
2. **Create a Virtual Environment**
    ```
    python3 -m venv venv
    # On Windows use `venv\\Scripts\\activate`
    source venv/bin/activate
    ```
3. **Install the dependencies**
    ```
    pip install -r requirements.txt
    ```
4. **Run the application**
    ```
    python -m flask run
    ```
The application will run at http://127.0.0.1:5000/ by default.

## License

This project uses publicly available libraries and datasets. However, always check individual licenses for compliance when extending or deploying this tool.

- LibriSpeech Data: LibriSpeech recordings used with this tool are public domain (courtesy of LibriVox).
- OpenAI Whisper: OpenAI's Whisper model is used under its respective usage policy.

![example picture](/static/example.png)