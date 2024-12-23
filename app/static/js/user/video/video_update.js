$(document).ready(function () {
    $('#update-video-thumbnail').on('change', function(event) {
        const input = event.target;

        // Ensure a file is selected
        if (input.files && input.files[0]) {
            const file = input.files[0];

            // Validate file type (optional)
            const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
            if ($.inArray(file.type, validImageTypes) < 0) {
                alert('Vui lòng chọn định dạng ảnh phù hợp (JPEG, PNG, GIF).');
                return;
            }

            // Create a FileReader to read the file
            const reader = new FileReader();

            // Define the onload callback
            reader.onload = function(e) {
                // Set the src of the avatar image to the file's data URL
                $('#video-thumbnail').attr('src', e.target.result);
            };

            // Read the file as a Data URL (base64 encoded string)
            reader.readAsDataURL(file);
        }
    });
})

// Save video title
function updateVideo(event) {
    event.preventDefault();
    const video_id = document.getElementById('video-id').value;
    const title = document.getElementById('video-title').value;
    const thumbnailInput = document.getElementById('update-video-thumbnail');
    const thumbnailFile = thumbnailInput.files[0];
    const data = new FormData();

    if(thumbnailFile) {
        // Convert the file to a Blob object
        data.append('thumbnail', thumbnailFile);
    }
    data.append('video_id', video_id);
    data.append('title', title);
    alert('Đang cập nhật video...');
    // Example: Send data to the server
    axios.put('/api/user/video/update', data, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }
    ).then(response => {
        deactivateModal('video-edit-popup');
        alert('Cập nhật video thành công');
    })
        .catch((error) => {
            const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
            alert('Có lỗi xảy ra: ' + errorMessage);
        });
}