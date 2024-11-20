var shared_data = {
    following_data: null,
    follower_data: null,
    user:null
};
document.addEventListener('DOMContentLoaded', function () {
    fetchFollowData()
        .then((data) => {
            shared_data['follower_data'] = data.follower_data;
            shared_data['following_data'] = data.following_data;
            shared_data['user'] = user;
        })
        .catch((error) => {
            console.error('Error fetching follow data:', error);
        });
    const editButtons = document.querySelectorAll('.edit-btn');
    editButtons.forEach(function (button){
        button.addEventListener('click', function (event) {
            // Get the genre values from the button's data attributes
            const userId = this.getAttribute('data-id');
            const userName = this.getAttribute('data-name');
            const userUsername = this.getAttribute('data-username')
            const userDateOfBirth = this.getAttribute('data-dob');
            const userEmail = this.getAttribute('data-email');
            const userAvatar = this.getAttribute('data-avt');
            // Now populate the modal's form fields
            const editProfileModal = document.querySelector('#user-edit-popup');
            editProfileModal.querySelector('#update-user-id').value = userId;
            editProfileModal.querySelector('#update-user-name').value = userName;
            editProfileModal.querySelector('#update-user-username').value = userUsername;
            editProfileModal.querySelector('#update-user-dob').value = userDateOfBirth;
            editProfileModal.querySelector('#update-user-email').value = userEmail;
            editProfileModal.querySelector('#update-user-avatar').value = userAvatar;
        });
    })
    const tabLinks = document.querySelectorAll('.tab-link');
    const underline = document.querySelector('.underline');

    function moveUnderline(activeTab) {
        underline.style.width = `${activeTab.offsetWidth}px`;
        underline.style.left = `${activeTab.offsetLeft}px`;
    }

    tabLinks.forEach(link => {
        if (link.href === window.location.href) {
            link.classList.add('active');
            underline.classList.add('active');
            moveUnderline(link);
        }
    });

    function fetchFollowData() {
        return Promise.all([
            axios.post('/api/user/follow/follower', {
                user_id: user.id,
            }),
            axios.post('/api/user/follow/following', {
                user_id: user.id,
            }),
        ])
            .then(([followerResponse, followingResponse]) => {
                return {
                    follower_data: followerResponse.data,
                    following_data: followingResponse.data,
                };
            });
    }
});
function createFollow(event){
    event.preventDefault();
    const followingId = $('#following-id').val();
    axios.post('/api/user/follow/create', {
        follower_id: user.id,
        following_id: followingId,
    })
        .then(function (response) {
            let button = event.target;
            button.onclick = deleteFollow;
            button.innerText = 'Hủy theo dõi';
            alert('Follow success');
        })
        .catch(function (error) {
            console.error('Follow Error', error);
            alert('Follow Error');
        });
}
function deleteFollow(event)
{
    event.preventDefault(event);
    const followingId = $('#following-id').val();
    axios.delete('/api/user/follow/delete', {
        headers: {
            'Content-Type': 'application/json'
        },
        data: {
            follower_id: user.id,
            following_id: followingId,
        }
    })
        .then(function (response) {
            let button = event.target;
            button.onclick = createFollow;
            button.innerText = 'Theo dõi';
            alert('Unfollow success');
        })
        .catch(function (error) {
            console.error('Follow Error', error);
            alert('Follow Error');
        });
}