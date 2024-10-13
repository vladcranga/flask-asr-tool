document.addEventListener('DOMContentLoaded', function () {
    // constants for the html elements
    const folderInput = document.getElementById('folderInput');
    const clearFolderButton = document.getElementById('clearFolderButton');
    const folderFileList = document.getElementById('folderFileList');

    const contentContainer = document.getElementById('content-container');

    const controlsContainer = document.getElementById('controls')
    const playButton = document.getElementById('play-btn');
    const pauseButton = document.getElementById('pause-btn');
    const stopButton = document.getElementById('stop-btn');
    const volumeControl = document.getElementById('volume-control');    

    // initialise WaveSurfer
    const wavesurfer = WaveSurfer.create({
        container: '#waveform', 
        waveColor: '#5DADE2',  
        progressColor: '#21618C',
    });
    foundAudioFiles = false;

    function displaySpectrogram(audioFileURL) {
        // remove the previous spectrogram image if it exists
        const previousSpectrogram = document.getElementById('spectrogram');
            if (previousSpectrogram) {
                previousSpectrogram.remove();
            }
            
            // create an image element for the spectrogram
            const spectrogramImage = document.createElement('img');    
            spectrogramImage.id = 'spectrogram';

        // make a request to flask to generate the spectrogram
        fetch('/generate-spectrogram', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ audioFileURL: audioFileURL }),
        })
        .then(response => response.blob())
        .then(blob => {
            const reader = new FileReader();
            reader.onloadend = function () {
                spectrogramImage.src = reader.result;
                spectrogramImage.alt = 'A spectrogram of the audio file';

                contentContainer.appendChild(spectrogramImage);
            };
            reader.readAsDataURL(blob);
        })
        .catch(error => console.error('Error:', error));
    }    

    // the file explorer
    folderInput.addEventListener('change', function (event) {
        const files = event.target.files;
        // clear the file list when selecting a new folder
        folderFileList.innerHTML = '';

        // populate the explorer
        if (files && files.length > 0) {
            for (const file of files) {
                if (file.name.endsWith('.wav') || (file.name.endsWith('.mp3'))) {
                    const listItem = document.createElement('li');
                    listItem.className = 'file-item';
                    listItem.role = 'option';
                    listItem.tabIndex = '0';

                    // extract the file name and extension
                    const fileName = file.name;
                    listItem.textContent = fileName;

                    folderFileList.appendChild(listItem);

                    foundAudioFiles = true;
                }
            }

            clearFolderButton.disabled = false;
        }

        if (!foundAudioFiles) {
            const noFileMessage = document.createElement('li')
            noFileMessage.className = 'file-item'
            noFileMessage.textContent = 'No audio files found.'

            folderFileList.appendChild(noFileMessage)
        }

    });

    clearFolderButton.addEventListener('click', function () {
        folderInput.value = '';
        folderFileList.innerHTML = '';
        clearFolderButton.disabled = true;
    });

    function displayAudioDetails(audioFileURL) {
        // start the visualisation
        wavesurfer.load(audioFileURL);
        wavesurfer.on('ready', function () {
            controlsContainer.style.display = 'flex';
            playButton.addEventListener('click', () => wavesurfer.play());
            pauseButton.addEventListener('click', () => wavesurfer.pause());
            stopButton.addEventListener('click', () => wavesurfer.stop());
            volumeControl.addEventListener('input', () => wavesurfer.setVolume(volumeControl.value));
        });
    }

    function displayAudioTranscription(fileName) {
        // show the transcription container
        const transcriptionContainer = document.querySelector('.transcription-container');
        transcriptionContainer.style.display = 'flex';
    
        // remove the previous transcription if it exists
        const transcriptionTextarea = document.getElementById('transcription');
        if (transcriptionTextarea) {
            transcriptionTextarea.value = 'Processing...';
        }
    
        fetch('/get-transcript-whisper', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ fileName }),
        })
            .then(response => response.json())
            .then(data => {
                transcriptionTextarea.value = data.transcript;
            })
            .catch(error => {
                console.error('Error retrieving transcription:', error);
                transcriptionTextarea.value = 'Error: Failed to retrieve transcription.';
            });
    
        // save the edited transcription
        const saveTranscriptionButton = document.getElementById('save-transcription');
        saveTranscriptionButton.addEventListener('click', () => {
            const editedTranscription = transcriptionTextarea.value;
        });
    }

    folderFileList.addEventListener('click', function (event) {
        const target = event.target;
        if (target && target.tagName === 'LI') {
            const fileName = target.textContent;
            const audioFileURL = '/static/'+fileName;

            // display the selected audio file
            displayAudioDetails(audioFileURL);
            // display the specrtogram 
            displaySpectrogram(fileName)
            // display the transcription
            displayAudioTranscription(fileName)
        }
    });    

    document.getElementById('save-transcription').addEventListener('click', function() {
        const transcriptionTextarea = document.getElementById('transcription');
        const transcriptionText = transcriptionTextarea.value;
        if (transcriptionText.trim() === '' || transcriptionText.trim() === 'Processing...') {
            alert("No transcription available to save or it's still processing!");
            return;
        }
    
        const blob = new Blob([transcriptionText], { type: 'text/plain' });
    
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = 'transcription.txt';
        
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    });
    
    
});