document.addEventListener('DOMContentLoaded', function () {
    // constants for the html elements
    const folderInput = document.getElementById('folderInput');
    const clearFolderButton = document.getElementById('clearFolderButton');
    const folderFileList = document.getElementById('folderFileList');
    const spectrogramContainer = document.getElementById('spectrogram-container');

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

        const spectrogramContainer = document.getElementById('spectrogram-container');
        spectrogramContainer.classList.remove('hidden');
        
        // Get the canvas container for the spectrogram
        const canvasContainer = spectrogramContainer.querySelector('.spectrogram-canvas-container');        
            
        // create an image element for the spectrogram
        const spectrogramImage = document.createElement('img');    
        spectrogramImage.id = 'spectrogram';
        spectrogramImage.className = 'w-full max-h-96';

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
                canvasContainer.appendChild(spectrogramImage);
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
                    listItem.className = 'px-3 py-2 text-gray-300 hover:bg-gray-600 rounded transition-colors duration-150 cursor-pointer flex items-center';
                    
                    const icon = document.createElement('i');
                    icon.className = 'fas fa-file-audio mr-2 text-blue-400';
                    
                    const text = document.createElement('span');
                    text.textContent = file.name;
                    text.className = 'truncate';
                    
                    listItem.appendChild(icon);
                    listItem.appendChild(text);
                    folderFileList.appendChild(listItem);
                    foundAudioFiles = true;
                }
            }

            clearFolderButton.disabled = false;
        }

        if (!foundAudioFiles) {
            const noFileMessage = document.createElement('li');
            noFileMessage.className = 'text-gray-400 text-sm text-center py-4';
            const icon = document.createElement('i');
            icon.className = 'fas fa-music mb-2 text-2xl block';
            const text = document.createElement('p');
            text.textContent = 'No audio files found';
            noFileMessage.appendChild(icon);
            noFileMessage.appendChild(text);
            folderFileList.appendChild(noFileMessage);
        }
    });

    clearFolderButton.addEventListener('click', function () {
        folderInput.value = '';
        folderFileList.innerHTML = '';
        clearFolderButton.disabled = true;
        // Add back the empty state
        const emptyState = document.createElement('li');
        emptyState.className = 'text-gray-400 text-sm text-center py-4';
        emptyState.id = 'empty-state';
        const icon = document.createElement('i');
        icon.className = 'fas fa-music mb-2 text-2xl block';
        const text = document.createElement('p');
        text.textContent = 'No audio files selected';
        emptyState.appendChild(icon);
        emptyState.appendChild(text);
        folderFileList.appendChild(emptyState);
    });

    function displayAudioDetails(audioFileURL) {
        // Show waveform container
        document.getElementById('waveform').classList.remove('hidden');
        
        // start the visualisation
        wavesurfer.load(audioFileURL);
        wavesurfer.on('ready', function () {
            controlsContainer.classList.remove('hidden');  
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
        const target = event.target.closest('li');
        if (target && !target.classList.contains('text-gray-400')) {
            const fileName = target.querySelector('span').textContent;
            const audioFileURL = '/static/'+fileName;
            
            // Hide empty state
            document.getElementById('empty-state').classList.add('hidden');
            
            // Update selected state
            folderFileList.querySelectorAll('li').forEach(li => {
                li.classList.remove('bg-gray-600');
            });
            target.classList.add('bg-gray-600');
            
            displayAudioDetails(audioFileURL);
            displaySpectrogram(fileName);
            displayAudioTranscription(fileName);
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