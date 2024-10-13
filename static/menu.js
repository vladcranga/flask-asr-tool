document.addEventListener('DOMContentLoaded', function () {

    const inputDeviceSelect = document.getElementById('inputDevice');
    const outputDeviceSelect = document.getElementById('outputDevice')
    const recordButton = document.getElementById('recordButton');
    const pauseButton = document.getElementById('pauseButton');
    const stopButton = document.getElementById('stopButton');
    const durationDisplay = document.getElementById('durationDisplay');
    
    let recording = false;
    let paused = false;
    let audioDuration = 0;
    let audioInterval;

    recordButton.addEventListener('click', () => {
        if (!recording) {
            // reset the audioDuration and timer when starting a new recording
            audioDuration = 0;
            durationDisplay.textContent = audioDuration + ' seconds';

            recording = true;
            startRecording();
        }
    });

    pauseButton.addEventListener('click', () => {
        if (recording) {
            if (!paused) {
                paused = true;
                pauseRecording();
            } else {
                paused = false;
                resumeRecording();
            }
        }
    });

    stopButton.addEventListener('click', () => {
        if (recording) {
            recording = false;
            clearInterval(audioInterval);
            stopRecording();
        }
    });

    function startRecording() {
        if (!paused) {
            fetch('/record-audio', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ action: 'start' }),
            })
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'recording') {
                        audioInterval = setInterval(() => {
                            audioDuration++;
                            durationDisplay.textContent = audioDuration + ' seconds';
                        }, 1000);
                    }
                })
                .catch(error => {
                    console.error('Error starting recording:', error);
                });
        } else {
            // resume the recording
            resumeRecording();
        }
    }

    function pauseRecording() {
        fetch('/pause-recording', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action: 'pause' }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'paused') {
                    clearInterval(audioInterval);
                }
            })
            .catch(error => {
                console.error('Error pausing recording:', error);
            });
    }

    function resumeRecording() {
        // send a request to resume the recording on the server
        fetch('/resume-recording', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action: 'resume' }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'recording') {
                audioInterval = setInterval(() => {
                    audioDuration++;
                    durationDisplay.textContent = audioDuration + ' seconds';
                }, 1000);
            }
        })
        .catch(error => {
            console.error('Error resuming recording:', error);
        });
    }
    
    function stopRecording() {
        let baseFilename = prompt("Please enter a name for your recording:", "recording");
        if (baseFilename) {
            let filename = baseFilename.endsWith('.wav') ? baseFilename : `${baseFilename}.wav`;
    
            fetch('/stop-recording', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ action: 'stop', filename: filename })
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'stopped') {
                    alert('Recording saved as ' + filename);
                    durationDisplay.textContent = '0 seconds';
                } else {
                    alert('Failed to stop and save recording.');
                }
            })
            .catch(error => {
                console.error('Error stopping recording:', error);
                alert('Error stopping recording: ' + error);
            });
        } else {
            alert('Recording was not saved. Please provide a filename.');
        }
    }  

});
