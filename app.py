from flask import Flask, send_file, render_template, request, jsonify
from io import BytesIO
import sounddevice as sd
import soundfile as sf
import numpy as np
import matplotlib.pyplot as plt
import matplotlib
import wavio
import threading
import sys
import os
import openai_whisper
matplotlib.use("Agg")

app = Flask(__name__)


@app.route("/static/menu.js")
def load_menu_js():
    return send_file("static/menu.js", mimetype="application/javascript")


@app.route("/static/file_explorer.js")
def load_file_explorer_js():
    return send_file(
        "static/file_explorer.js", mimetype="application/javascript")


# the main page of the website
@app.route("/")
def home():
    return render_template("default.html")


# handle audio recording
sample_rate = 16000
recording = False
paused = False
audio_data = np.array([])


def callback(indata, frames, time, status):
    global audio_data
    if status:
        print(status, file=sys.stderr)
    if recording and not paused:
        indata = indata.ravel()
        audio_data = np.concatenate((audio_data, indata))


def record_audio():
    global audio_data
    with sd.InputStream(
        callback=callback, samplerate=sample_rate, channels=1, dtype="int16"
    ):
        sd.sleep(1000000)  # record for a long time


def clear_audio_data():
    global audio_data
    audio_data = np.array([])


def start_recording_thread():
    record_audio()


def normalize_audio(audio_data):
    if audio_data.size == 0:
        return audio_data
    max_amplitude = np.max(np.abs(audio_data))
    if max_amplitude > 0:
        audio_data_normalized = audio_data / max_amplitude
    else:
        audio_data_normalized = audio_data
    return audio_data_normalized


@app.route("/record-audio", methods=["POST"])
def start_recording():
    global recording, audio_data, paused
    action = request.get_json().get("action")

    if action == "start" and not recording:
        # start recording
        audio_data = np.array([])
        recording = True
        paused = False
        record_thread = threading.Thread(target=start_recording_thread)
        record_thread.start()
        return jsonify({"status": "recording"})

    return jsonify(
        {
            "status": "recording" if recording
            else "paused" if paused else "stopped"
        }
    )


@app.route("/pause-recording", methods=["POST"])
def pause_recording():
    global recording, paused

    action = request.get_json().get("action")

    if action == "pause" and recording:
        # pause the recording
        paused = True
        recording = False
        return jsonify({"status": "paused"})

    return jsonify({"status": "paused" if paused else "recording"})


@app.route("/resume-recording", methods=["POST"])
def resume_recording():
    global recording, paused

    action = request.get_json().get("action")

    if action == "resume" and not recording and paused:
        # resume recording
        recording = True
        paused = False
        record_thread = threading.Thread(target=start_recording_thread)
        record_thread.start()
        return jsonify({"status": "recording"})

    return jsonify(
        {
            "status": "recording" if recording
            else "paused" if paused else "stopped"
        }
    )


@app.route("/stop-recording", methods=["POST"])
def stop_recording():
    global recording, audio_data

    action = request.get_json().get("action")
    data = request.get_json()
    filename = data.get("filename", "recording.wav")
    directory = "static"

    if action == "stop" and recording:
        # stop recording
        recording = False
        paused = False

        audio_data_normalized = normalize_audio(audio_data)

        save_path = os.path.join(directory, filename)
        wavio.write(save_path, audio_data_normalized, sample_rate, sampwidth=2)

        return jsonify({"status": "stopped"})

        # clear the audio data
        clear_audio_data()

        return jsonify({"status": "stopped"})

    return jsonify(
        {
            "status": "recording" if recording
            else "paused" if paused else "stopped"
        }
    )


@app.route("/generate-spectrogram", methods=["POST"])
def generate_spectrogram():
    try:
        data = request.get_json()
        audio_file_name = data.get("audioFileURL")

        audio_file_path = os.path.join("static", audio_file_name)

        # read the audio file
        audio_data, sample_rate = sf.read(audio_file_path)

        if audio_data.ndim == 2:
            audio_data = np.mean(audio_data, axis=1)

        plt.figure(figsize=(4, 4))
        plt.specgram(
            audio_data, NFFT=256, Fs=sample_rate, cmap="viridis", aspect="auto"
        )
        plt.axis("off")

        # save the spectrogram image
        img_data = BytesIO()
        plt.savefig(img_data, format="png", bbox_inches="tight", pad_inches=0)
        img_data.seek(0)

        plt.close()

        # return the spectrogram image as a response
        return send_file(
            img_data,
            mimetype="image/png",
            as_attachment=True,
            download_name="spectrogram.png",
        )

    except Exception as e:
        print(f"Error generating spectrogram: {str(e)}")
        return jsonify(
            {"error": "Failed to generate spectrogram"}
        ), 500


@app.route("/get-transcript-whisper", methods=["POST"])
def get_transcript_whisper():
    try:
        audio_file_name = request.get_json("fileName")

        transcript = openai_whisper.get_transcription(
            audio_file_name["fileName"])

        # return the transcript
        return jsonify({"transcript": transcript})

    except Exception as e:
        print(f"Error generating transcript: {str(e)}")
        return jsonify({"error": "Failed to generate transcript"}), 500


if __name__ == "__main__":
    app.run()
