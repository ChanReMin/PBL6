let mediaRecorder;
let lyricsInterval;
let lyricsData = [];  // Global variable to store lyrics
let recordedBlobs = [];
const videoElement = document.getElementById('video');
const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');
const musicPlayer = document.getElementById('musicPlayer');
window.addEventListener('load', () => {
    const lyricsContainer = document.getElementById('lyricsContainer');
    lyricsContainer.style.display = 'none';  // Hide lyrics when the page loads
});
startButton.addEventListener('click', async () => {
    const musicId = document.getElementById('selectedMusicId').value;

    // Ensure the user has selected music before starting the recording
    if (!musicId) {
        alert("Please select a music track before starting the recording.");
        return;
    }

    try {
        // Get the user's media stream (video and audio)
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        videoElement.srcObject = stream;

        mediaRecorder = new MediaRecorder(stream);
        recordedBlobs = [];

        // Collect video data as it becomes available
        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                recordedBlobs.push(event.data);
            }
        };

        mediaRecorder.start();
        startButton.disabled = true;  // Disable the start button after recording begins
        stopButton.disabled = false;  // Enable the stop button

        musicPlayer.load();  // Load the selected music track
        // Show the lyrics container and start syncing lyrics with video time


        // Play the selected music track
        musicPlayer.play().then(() => {
            console.log("Music started playing");
        }).catch(error => {
            console.error("Music playback failed:", error);
            alert("Failed to start music playback. Please ensure autoplay is allowed.");
        });
        startLyricsSync();
    } catch (err) {
        console.error('Error accessing media devices:', err);
        alert('Error accessing camera and microphone. Please check your permissions.');
    }
});


stopButton.addEventListener('click', () => {
    mediaRecorder.stop();
    startButton.disabled = false;
    stopButton.disabled = true;

    let stream = videoElement.srcObject;
    let tracks = stream.getTracks();
    tracks.forEach(track => track.stop());

    videoElement.srcObject = null;

    // Stop syncing lyrics
    clearInterval(lyricsInterval);

    // Hide the lyrics container after the recording stops
    const lyricsContainer = document.getElementById('lyricsContainer');
    lyricsContainer.style.display = 'none';  // Hide the lyrics after stopping the recording

    // Stop the music playback when recording stops
    musicPlayer.pause();
    musicPlayer.currentTime = 0;
});

function startLyricsSync() {
    const lyricsContainer = document.getElementById('lyricsContainer');  // Lyrics display container

    // Show the lyrics container when the recording starts
    lyricsContainer.style.display = 'block';

    // Start the interval to sync lyrics with video time
    lyricsInterval = setInterval(() => {
        const currentTime = videoElement.currentTime;  // Get current video time in seconds

        // Find the current lyric based on the video's time
        const currentLyric = lyricsData.find(lyric => {
            const startTime = parseTime(lyric.start_time);
            const endTime = parseTime(lyric.end_time);
            return currentTime >= startTime && currentTime <= endTime;
        });

        // Display the current lyric if found, or clear the container if no lyric is active
        if (currentLyric) {
            lyricsContainer.textContent = currentLyric.text;
        } else {
            lyricsContainer.textContent = '';  // Clear lyrics if no match
        }
    }, 100);  // Check every 100ms
}


// Utility function to parse "hh:mm:ss" format into seconds
function parseTime(timeString) {
    const parts = timeString.split(':');
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    const seconds = parseFloat(parts[2]);
    return hours * 3600 + minutes * 60 + seconds;
}

function uploadVideo() {
    // Get title, music ID, and lyrics data
    const title = document.getElementById('title').value;
    const musicId = document.getElementById('selectedMusicId').value;

    if (!title || !musicId) {
        alert("Please enter a title and select a music track.");
        return;
    }

    if (recordedBlobs.length === 0) {
        alert('No video recorded to upload.');
        return;
    }

    const blob = new Blob(recordedBlobs, { type: 'video/webm' });
    const formData = new FormData();

    // Add video blob, title, music ID, and lyrics data to the form
    formData.append('video', blob, 'recorded-video.webm');
    formData.append('title', title);
    formData.append('music_id', musicId);
    formData.append('lyrics', JSON.stringify(lyricsData));  // Send lyrics as JSON

    // Upload the video with lyrics
    // fetch('/api/user/video/record', {
    //     method: 'POST',
    //     body: formData
    // })
    axios.post(`/api/user/video/record`, formData)
        .then(response => {
            if (!response.ok) {
                return response.text().then(errorText => {
                    console.error('Error:', response.status, errorText);
                    throw new Error('Network response was not ok: ' + response.status + ' - ' + errorText);
                });
            }
            return response.json();
        })
        .then(data => {
            alert('Video uploaded and processed successfully: ' + data.url);
        })
        .catch(error => {
            console.error('Error during video upload:', error);
            alert('An error occurred while uploading the video: ' + error.message);
        });
}

function searchMusic() {
    const query = document.getElementById('musicSearch').value.trim();
    const resultsContainer = document.getElementById('musicResults');
    resultsContainer.innerHTML = ''; // Clear previous results

    if (query.length === 0) {
        alert("Please enter a song name to search.");
        return;
    }

    // Fetch matching music from the backend, including lyrics
    fetch(`/api/user/video/music_search?q=${encodeURIComponent(query)}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.music_options && data.music_options.length > 0) {
                data.music_options.forEach(function(music) {
                    const listItem = document.createElement('li');

                    // Create a string with all artist names
                    let artistNames = music.artists.map(artist => artist.name).join(', ');

                    // Set the content to include the song name and all artist names
                    listItem.textContent = `${music.name} - ${artistNames}`;

                    listItem.dataset.musicId = music.id;
                    listItem.onclick = function() {
                        selectMusic(music.id, music.name, artistNames, music.lyrics, music.music_url);
                    };
                    resultsContainer.appendChild(listItem);
                });
            } else {
                const noResults = document.createElement('li');
                noResults.textContent = 'No music found';
                resultsContainer.appendChild(noResults);
            }
        })
        .catch(error => {
            console.error('Error fetching music options:', error);
        });
}

// Function to select music
function selectMusic(musicId, musicName, musicArtist, lyrics, musicUrl) {
    const musicSearch = document.getElementById('musicSearch');
    const selectedMusicId = document.getElementById('selectedMusicId');
    const startButton = document.getElementById('startButton');
    const uploadButton = document.getElementById('uploadButton');

    // Set the input field with the selected music name
    musicSearch.value = `${musicName} - ${musicArtist}`;
    selectedMusicId.value = musicId;

    // Store lyrics data globally for later use (lyrics sync with video)
    lyricsData = lyrics;

    // Enable the Start Recording button
    startButton.disabled = false;

    // Enable the Upload button for when recording is done
    uploadButton.disabled = false;

    // Clear the search results after selection
    document.getElementById('musicResults').innerHTML = '';

    // Load the music URL in the audio player
    musicPlayer.src = musicUrl;
    // Optional: You can log the lyrics to verify they are being stored correctly
    console.log('Selected lyrics:', lyricsData);
}

