# 🎙️ Automatic Speech Recogniser

A user-friendly interface for recording, transcribing, and analysing speech data. Built with Flask and OpenAI Whisper for accurate speech recognition.

![ASR Tool Overview](/static/asr-tool.png)

## Features

### Audio Recording & Management
- **Recording Controls:** Start, pause, and stop functionality
- **File Management:** Upload and manage existing audio files
- **Waveform Visualisation:** Interactive audio waveform display

![Recording Controls](/static/asr-buttons.png)

### Analysis & Transcription
- **Spectrogram Generation:** Visual representation of audio frequencies
- **OpenAI Whisper Integration:** State-of-the-art speech recognition
- **Editable Transcriptions:** Review and modify generated transcripts

### File Organization
- **Clean Interface:** Organised file listing
- **Quick Access:** Easy navigation between audio files
- **Visual Feedback:** Clear status indicators

![File Management](/static/asr-files.png)

## Getting Started

### Prerequisites
- Python 3.x
- Virtual environment (recommended)

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/vladcranga/flask-asr-tool.git
   cd flask-asr-tool
   ```

2. **Set Up Virtual Environment**
   ```bash
   python -m venv venv
   
   # Windows
   venv\Scripts\activate
   
   # Unix/MacOS
   source venv/bin/activate
   ```

3. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Launch the Application**
   ```bash
   python -m flask run
   ```
   Access the tool at http://127.0.0.1:5000/

## Tech Stack
- **Backend:** Flask (Python)
- **Audio Processing:** 
  - Sounddevice
  - Soundfile
  - Pydub
- **ML Model:** OpenAI Whisper
- **Visualisation:** 
  - WaveSurfer.js
  - Matplotlib

## 📝 License

This project incorporates several open-source components:

- **LibriSpeech Data:** Public domain (courtesy of LibriVox)
- **OpenAI Whisper:** Used under OpenAI's usage policy
- **Other Components:** See individual licenses for details