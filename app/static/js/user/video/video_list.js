document.getElementById('is-public')
function setPublic(checkbox) {
    // Get the video ID from the data attribute
    const video_id = checkbox.getAttribute('data-video-id');

    // Get the current state of the checkbox
    const public_state = checkbox.checked;
    var is_requested = true
    if (is_requested){
        axios.post(`/api/user/video/public`, {
            video_id: video_id,
            public_state: public_state
        }).then(data => {
            is_requested = false;
            console.log('Success:', data);
        }).catch((error) => {
                console.error('Error:', error);
        });
    }
}
// Populate modal with video data
function populateModal(button) {
    const video_id = button.getAttribute('data-id');
    const video_title = button.getAttribute('data-title');
    const video_thumbnail_url = button.getAttribute('data-thumbnail-url');

    // Set the modal input fields
    document.getElementById('video-title').value = video_title;
    document.getElementById('video-id').value = video_id;
    document.getElementById('video-thumbnail').src = video_thumbnail_url;
}

