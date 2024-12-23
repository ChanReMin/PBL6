const video_search_bar = document.getElementById('video_search_bar');
const resultsContainer = document.getElementById('music_search_results');
const query = video_search_bar.value;

function displayResults(results) {
    resultsContainer.innerHTML = "";
    results.forEach((result) => {
        const div = document.createElement("div");
        div.className = "result-item";
        div.textContent = result.name;
        let is_requesting = false;
        div.onclick = async () => {
            if (is_requesting) return;

            is_requesting = true;
            await axios.post('/api/music/detail', {
                music_id: result.id,
            }).then (async response => {
                is_requesting = false;
                music = response.data;
                document.cookie = `music_id=${result.id}; path=/`;
                sessionStorage.setItem('music_id', result.id);
                await updateMusicDetails(music)
            })
        };
        resultsContainer.appendChild(div);
    });
}
function searchMusics(query) {
    socket.emit("music_search", query);
    socket.on("music_search_results", (results) => {
        var music_results = results["musics"];
        displayResults(music_results);
    });
}
async function updateMusicDetails(music){
    music_result.innerHTML = `<p>${music.name}</p>`;
    music_artists.innerHTML = "";
    music.artists.forEach((artist) => {
        music_artists.appendChild(document.createTextNode(`${artist.nickname}`));
    })
    const blob_url = await getBlobUrl(music.karaoke_url);
    getAudioDuration(blob_url)
        .then((duration) => {
            let music_duration = convertDuration(duration)
            end_minute_select.value = music_duration.minutes;
            end_second_select.value = music_duration.seconds;
            updateEndTime()
        })
        .catch((error) => {
            alert(error)
        });
    show_lyrics_tab_button.style.display = "block";
    lyrics_sentences = processLyricsSentence(music.lyrics)
    lyrics_words = processLyricsWords(music.lyrics)
    seedLyricTab()
    start_recording_button.disabled = false;
    revokeBlobUrl(blob_url)
}
video_search_bar.addEventListener("input", function(event) {
    const query = video_search_bar.value;
    searchMusics(query)
});