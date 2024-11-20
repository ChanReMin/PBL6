$(document).ready(function() {
    $('#update-user-avatar').on('change', function(event) {
        const input = event.target;
        if (input.files && input.files[0]) {
            const file = input.files[0];
            const validImageTypes = ['image/jpeg', 'image/png'];
            if ($.inArray(file.type, validImageTypes) < 0) {
                alert('Please select a valid image file (JPEG, PNG).');
                return;
            }
            const reader = new FileReader();
            reader.onload = function(e) {
                $('#user-avatar').attr('src', e.target.result);
            };
            reader.readAsDataURL(file);
        }
    });
});
function updateProfile(event){
    event.preventDefault();
    const userId = $('#update-user-id').val();
    const name = $('#update-user-name').val();
    const username = $('#update-user-username').val();
    const email = $('#update-user-email').val();
    const dob = $('#update-user-dob').val();
    const bio = $('#update-user-bio').val();
    const avatar = $('#update-user-avatar')[0];
    const data = new FormData();
    if(avatar.files && avatar.files[0]) {
        const file = avatar.files[0];
        data.append('image', file, `${username}-avatar.jpg`);
    }
    data.append('id', userId);
    data.append('name', name);
    data.append('username', username);
    data.append('email', email);
    data.append('date_of_birth', dob);
    data.append('bio', bio);
    axios.put('/api/user/profile/', data)
        .then(function (response) {
            location.reload();
            alert('Profile updated successfully!');
        })
        .catch(function (error) {
            console.error('Error updating profile:', error);
            alert('Error updating profile. Please try again.');
        });
}




