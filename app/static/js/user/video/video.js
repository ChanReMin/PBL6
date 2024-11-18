let videos = []; // To store the list of videos
let currentIndex = 0; // To keep track of the current video index

// // Function to load a video by index
// function loadVideo(index) {
//     if (index >= 0 && index < videos.length) {
//         const video = videos[index];
//         const videoPlayer = document.getElementById('video-player');
//         videoPlayer.src = video.video_url;
//
//         // Cập nhật số lượt thích và bình luận
//         document.getElementById('like-count').innerText = video.like_count;
//         document.getElementById('comment-count').innerText = video.comments.length;
//         // Hiển thị bình luận
//         renderComments(video);
//     }
// }
function loadVideo(index) {
    if (index >= 0 && index < videos.length) {
        const video = videos[index];
        const videoPlayer = document.getElementById('video-player');
        videoPlayer.src = video.video_url;

        // Cập nhật số lượt thích và bình luận
        document.getElementById('like-count').innerText = video.like_count;
        document.getElementById('comment-count').innerText = video.comments.length;

        // Hiển thị bình luận
        renderComments(video);

        // Cập nhật trạng thái liked và thay đổi màu nút like
        liked = video.liked_by_user;
        const likeButton = document.getElementById('like-button');
        if (liked) {
            likeButton.style.backgroundColor = 'black';
            likeButton.style.color = 'white';
        } else {
            likeButton.style.backgroundColor = 'white';
            likeButton.style.color = 'black';
        }
    }
}



// Fetch the list of videos from the API using Axios
function fetchVideos() {
    axios.get('/api/video/get')
        .then(response => {
            videos = response.data;
            if (videos.length > 0) {
                loadVideo(0);  // Load the first video initially
            }
        })
        .catch(error => {
            console.error('Error fetching videos:', error);
        });
}

// Gọi hàm fetchVideos khi trang được load
document.addEventListener('DOMContentLoaded', function () {
    // Gọi dữ liệu video
    fetchVideos();

    // Gắn sự kiện click cho nút "Thông tin mô tả"
    document.getElementById('info-button').addEventListener('click', function () {
        toggleDescription();
    });

    // Gắn sự kiện click cho nút "X" để đóng phần mô tả
    document.getElementById('close-description').addEventListener('click', function () {
        const descriptionSection = document.getElementById('description-section');
        descriptionSection.classList.remove('d-block');
        descriptionSection.classList.add('d-none');
    });
});


// Event listeners for navigation buttons
document.getElementById('prev-button').addEventListener('click', function () {
    if (currentIndex > 0) {
        currentIndex -= 1;
        loadVideo(currentIndex);
    }
});

document.getElementById('next-button').addEventListener('click', function () {
    if (currentIndex < videos.length - 1) {
        currentIndex += 1;
        loadVideo(currentIndex);
    }
});

// Event listener for mouse wheel scroll
window.addEventListener('wheel', function (event) {
    if (event.deltaY < 0) {
        // Scroll up
        if (currentIndex > 0) {
            currentIndex -= 1;
            loadVideo(currentIndex);
        }
    } else if (event.deltaY > 0) {
        // Scroll down
        if (currentIndex < videos.length - 1) {
            currentIndex += 1;
            loadVideo(currentIndex);
        }
    }
});
let liked = false; // Biến trạng thái like của người dùng

function video_like(userId) {
    const videoId = videos[currentIndex].id;

    if (liked) {
        // Người dùng muốn bỏ thích
        axios.post('/api/video/unlike', {videoId: videoId, userId: userId})
            .then(response => {
                if (response.data.success) {
                    // Giảm số lượt thích
                    videos[currentIndex].like_count--;
                    document.getElementById('like-count').innerText = videos[currentIndex].like_count;

                    // Đổi lại màu về trạng thái chưa thích (trắng)
                    const likeButton = document.getElementById('like-button');
                    likeButton.style.backgroundColor = 'white';
                    likeButton.style.color = 'black';

                    // Đặt lại trạng thái liked
                    liked = false;
                }
            })
            .catch(error => console.error('Error unliking the video:', error));
    } else {
        // Người dùng muốn thích
        axios.post('/api/video/like', {videoId: videoId, userId: userId})
            .then(response => {
                if (response.data.success) {
                    // Tăng số lượt thích
                    videos[currentIndex].like_count++;
                    document.getElementById('like-count').innerText = videos[currentIndex].like_count;

                    // Đổi màu khi thích (đen)
                    const likeButton = document.getElementById('like-button');
                    likeButton.style.backgroundColor = 'black';
                    likeButton.style.color = 'white';

                    // Đặt lại trạng thái liked
                    liked = true;
                }
            })
            .catch(error => console.error('Error liking the video:', error));
    }
}




function toggleComment() {
    const commentSection = document.getElementById('comment-section');
    const videoSection = document.getElementById('video-player').parentElement;

    // Toggle hiển thị của phần comment
    if (commentSection.classList.contains('d-none')) {
        // Hiển thị comment section
        commentSection.classList.remove('d-none');
        commentSection.classList.add('d-block');
    } else {
        // Ẩn comment section
        commentSection.classList.remove('d-block');
        commentSection.classList.add('d-none');
    }

    // Đặt lại video chính giữa
    videoSection.scrollIntoView({behavior: 'smooth', block: 'center'});
}



// Placeholder functionality for other buttons
document.getElementById('dislike-button').addEventListener('click', function () {
    alert('Dislike functionality not implemented yet');
});


$(document).ready(function() {
    fetchVideos();  // Call your function here
});

function toggleDescription() {
    const descriptionSection = document.getElementById('description-section');
    const videoSection = document.getElementById('video-player').parentElement;

    // Toggle hiển thị của phần mô tả
    if (descriptionSection.classList.contains('d-none')) {
        // Hiển thị mô tả
        descriptionSection.classList.remove('d-none');
        descriptionSection.classList.add('d-block');

        // Cập nhật dữ liệu vào phần mô tả
        const video = videos[currentIndex];
        document.getElementById('video-title').innerText = video.music.title; // Hoặc video.title nếu bạn có trường này
        document.getElementById('like-count-description').innerText = video.like_count;
        document.getElementById('comment-count-description').innerText = video.comment_count;
        document.getElementById('uploader').innerText = video.user.name;
        document.getElementById('score-description').innerText = video.score;  // Cập nhật điểm số
    } else {
        // Ẩn mô tả
        descriptionSection.classList.remove('d-block');
        descriptionSection.classList.add('d-none');
    }

    // Đặt lại video chính giữa
    videoSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function togglePrivacy(button) {
    const icon = button.querySelector('i');
    if (icon.classList.contains('bi-globe')) {
        icon.classList.remove('bi-globe');
        icon.classList.add('bi-lock-fill'); // Thay đổi thành icon ổ khóa
    } else {
        icon.classList.remove('bi-lock-fill');
        icon.classList.add('bi-globe'); // Thay đổi thành icon trái đất
    }
}

// Add event listeners for the privacy buttons
document.getElementById('watchLaterPrivacy').addEventListener('click', function() {
    togglePrivacy(this);
});
document.getElementById('playlist1Privacy').addEventListener('click', function() {
    togglePrivacy(this);
});
document.getElementById('playlist2Privacy').addEventListener('click', function() {
    togglePrivacy(this);
});
document.getElementById('playlist3Privacy').addEventListener('click', function() {
    togglePrivacy(this);
});
document.getElementById('addNewPlaylist').addEventListener('click', function() {
    // Show the "Create New Playlist" modal when the "+ Danh sách phát mới" button is clicked
    var createPlaylistModal = new bootstrap.Modal(document.getElementById('createPlaylistModal'));
    createPlaylistModal.show();
});

document.getElementById('createPlaylistButton').addEventListener('click', function() {
    // Handle the logic to create the playlist when the "Tạo" button is clicked
    const playlistTitle = document.getElementById('playlistTitle').value;
    const privacySetting = document.getElementById('privacySelect').value;

    if (playlistTitle.trim() === "") {
        alert("Vui lòng nhập tiêu đề cho danh sách phát");
        return;
    }

    // Gửi thông tin playlist tới server để lưu
    axios.post('/api/playlist/create', {
        title: playlistTitle,
        privacy: privacySetting
    })
        .then(response => {
            console.log("Playlist created successfully:", response.data);
            // Đóng modal sau khi tạo thành công
            var createPlaylistModal = new bootstrap.Modal(document.getElementById('createPlaylistModal'));
            createPlaylistModal.hide();
        })
        .catch(error => {
            console.error('Error creating playlist:', error);
        });
});
// Event listener for "Không đề xuất kênh này"
document.getElementById('no-suggest-channel').addEventListener('click', function() {
    // Xử lý khi click vào "Không đề xuất kênh này"
    if (currentIndex < videos.length - 1) {
        currentIndex += 1;
        loadVideo(currentIndex);  // Gọi hàm để load video kế tiếp
        // Cuộn tới video kế tiếp
        const videoSection = document.getElementById('video-player').parentElement;
        videoSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
        alert('Không có video tiếp theo.');
    }
});
//button chia sẻ
document.getElementById('share-button').addEventListener('click', function () {
    var shareModal = new bootstrap.Modal(document.getElementById('shareModal'));
    shareModal.show();

    // Cập nhật link hiện tại vào ô link chia sẻ
    const currentUrl = window.location.href;
    document.getElementById('share-link').value = currentUrl;
});
document.getElementById('copy-button').addEventListener('click', function () {
    const shareLinkInput = document.getElementById('share-link');
    shareLinkInput.select();
    shareLinkInput.setSelectionRange(0, 99999); // Đối với các thiết bị di động
    document.execCommand('copy');

    alert('Đường link đã được sao chép: ' + shareLinkInput.value);
});
document.getElementById('prev-icon').addEventListener('click', function () {
    const container = document.getElementById('social-icons');
    container.scrollBy({
        left: -100,  // Trượt sang trái 100px
        behavior: 'smooth'
    });
});

document.getElementById('next-icon').addEventListener('click', function () {
    const container = document.getElementById('social-icons');
    container.scrollBy({
        left: 100,  // Trượt sang phải 100px
        behavior: 'smooth'
    });
});



function renderComments(video) {
    const commentList = document.getElementById('comment-list');
    commentList.innerHTML = ''; // Xóa các bình luận cũ

    video.comments.forEach(comment => {
        const li = document.createElement('li');
        li.classList.add('mb-2');

        // Thêm tên người dùng
        const userName = document.createElement('strong');
        userName.innerText = `${comment.user.name}: `;
        li.appendChild(userName);

        // Thêm nội dung bình luận
        const commentContent = document.createElement('span');
        commentContent.innerText = comment.content;
        li.appendChild(commentContent);

        // Container cho các nút like, dislike, và phản hồi
        const actionContainer = document.createElement('div');
        actionContainer.classList.add('d-flex', 'align-items-center');

        // Button Like
        const likeButton = document.createElement('button');
        likeButton.classList.add('icon-button', 'me-2');
        likeButton.onclick = () => likeComment(comment.id);
        likeButton.innerHTML = `<i class="bi bi-hand-thumbs-up"></i> ${comment.like_count || 0}`;
        actionContainer.appendChild(likeButton);

        // Button Dislike
        const dislikeButton = document.createElement('button');
        dislikeButton.classList.add('icon-button', 'me-2');
        dislikeButton.onclick = () => dislikeComment(comment.id);
        dislikeButton.innerHTML = `<i class="bi bi-hand-thumbs-down"></i> ${comment.dislike_count || 0}`;
        actionContainer.appendChild(dislikeButton);

        // Button Phản hồi
        const replyButton = document.createElement('button');
        replyButton.classList.add('icon-button');
        replyButton.onclick = () => toggleReplySection(comment.id);
        replyButton.innerHTML = `<i class="bi bi-reply"></i> Phản hồi`;
        actionContainer.appendChild(replyButton);

        li.appendChild(actionContainer);

        // Khu vực nhập phản hồi (ẩn ban đầu)
        const replySection = document.createElement('div');
        replySection.id = `reply-section-${comment.id}`;
        replySection.classList.add('d-none', 'mt-2');

        const replyInput = document.createElement('input');
        replyInput.type = 'text';
        replyInput.classList.add('form-control');
        replyInput.placeholder = 'Nhập phản hồi...';
        replySection.appendChild(replyInput);

        const replySubmitButton = document.createElement('button');
        replySubmitButton.classList.add('btn', 'btn-primary', 'btn-sm', 'mt-1');
        replySubmitButton.innerText = 'Gửi';
        replySubmitButton.onclick = () => submitReply(comment.id);
        replySection.appendChild(replySubmitButton);

        li.appendChild(replySection);

        // Danh sách phản hồi cho bình luận
        const replyList = document.createElement('ul');
        replyList.classList.add('mt-2');
        if (comment.replies) {
            comment.replies.forEach(reply => {
                const replyItem = document.createElement('li');
                replyItem.classList.add('mb-1');
                replyItem.innerHTML = `<strong>${reply.user.name}:</strong> ${reply.content}`;
                replyList.appendChild(replyItem);
            });
        }
        li.appendChild(replyList);

        commentList.appendChild(li);
    });
}


document.getElementById('send-comment').addEventListener('click', function () {
    if (!sessionUser) {
        alert('Vui lòng đăng nhập để bình luận.');
        return;
    }

    const videoId = videos[currentIndex].id;
    const commentContent = document.getElementById('comment-input').value.trim();

    if (commentContent) {
        axios.post(`/api/video/comment`, { videoID: videoId, comment: commentContent })
            .then(response => {
                console.log('Response from server:', response.data);

                // Cập nhật video data và render lại các comment
                videos[currentIndex].comments.push({
                    id: response.data.comment_id,
                    user: { name: sessionUser.name },
                    content: commentContent,
                    like_count: 0,
                    dislike_count: 0
                });

                renderComments(videos[currentIndex]);

                // Xóa nội dung trong ô nhập sau khi thêm bình luận
                document.getElementById('comment-input').value = '';
            })
            .catch(error => {
                console.error('Error commenting on the video:', error);
                alert('Đã xảy ra lỗi khi gửi bình luận.');
            });
    } else {
        alert('Vui lòng nhập nội dung bình luận.');
    }
});

function likeComment(commentId) {
    axios.post('/api/comment/like', { commentId: commentId })
        .then(response => {
            if (response.data.success) {
                // Tìm và cập nhật số lượt like
                const likeButton = document.querySelector(`[onclick="likeComment('${commentId}')"]`);
                let likeCount = parseInt(likeButton.textContent.trim());
                likeButton.innerHTML = `<i class="bi bi-hand-thumbs-up-fill"></i> ${likeCount + 1}`;
            }
        })
        .catch(error => console.error('Error liking the comment:', error));
}

function dislikeComment(commentId) {
    axios.post('/api/comment/dislike', { commentId: commentId })
        .then(response => {
            if (response.data.success) {
                // Tìm và cập nhật số lượt dislike
                const dislikeButton = document.querySelector(`[onclick="dislikeComment('${commentId}')"]`);
                let dislikeCount = parseInt(dislikeButton.textContent.trim());
                dislikeButton.innerHTML = `<i class="bi bi-hand-thumbs-down-fill"></i> ${dislikeCount + 1}`;
            }
        })
        .catch(error => console.error('Error disliking the comment:', error));
}

function toggleReplySection(commentId) {
    const replySection = document.getElementById(`reply-section-${commentId}`);
    replySection.classList.toggle('d-none');
}


function submitReply(commentId) {
    const replyInput = document.getElementById(`reply-section-${commentId}`).querySelector('input');
    const replyContent = replyInput.value.trim();

    if (replyContent) {
        console.log("Sending reply content:", replyContent); // kiểm tra nội dung phản hồi
        axios.post('/api/video/comment/reply', { commentId: commentId, content: replyContent })
            .then(response => {
                console.log("Reply response from server:", response.data); // kiểm tra phản hồi từ server
                if (response.data.success) {
                    // Thêm phản hồi vào danh sách phản hồi trên giao diện
                    const commentItem = replyInput.closest('li');
                    let replyList = commentItem.querySelector('ul');

                    if (!replyList) {
                        replyList = document.createElement('ul');
                        replyList.classList.add('mt-2');
                        commentItem.appendChild(replyList);
                    }

                    // Tạo phần tử phản hồi mới
                    const newReply = document.createElement('li');
                    newReply.classList.add('mb-1');
                    newReply.innerHTML = `<strong>${sessionUser.name}:</strong> ${replyContent}`;
                    replyList.appendChild(newReply);

                    // Xóa nội dung trong ô nhập
                    replyInput.value = '';
                }
            })
            .catch(error => console.error('Error submitting reply:', error));
    } else {
        alert('Vui lòng nhập nội dung phản hồi');
    }
}




