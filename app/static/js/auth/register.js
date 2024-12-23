function register() {
    const name = $('#register-name').val();
    const username = $('#register-username').val();
    const email = $('#register-email').val();
    const DateOfBirth = $('#register-dob').val();
    if (!dobValidate(DateOfBirth))
    {
        return;
    };
    const password = $('#register-password').val();

    const data = {
        name: name,
        username: username,
        email: email,
        password: password,
        date_of_birth: DateOfBirth,
    };
    if (!emailValidation(email)) {
        alert('Email không hợp lệ');
        return;
    };
    // Make the API call using Axios
    axios.post('/api/auth/register/create', data)
        .then((response) => {
            const rep = response.data;
            if (rep.success === true) {
                $('#login-popup').modal('toggle');
                $('#register-popup').modal('toggle');
                $('#login-username').val(username);
                $('#login-password').val(password);
            } else {
                if (rep.error === 'email exists') {
                    alert('Email đã tồn tại');
                } else if (rep.error === 'username exists') {
                    alert('Tên người dùng đã tồn tại');
                }
            }
        })
        .catch(function (error) {
            console.error('Error register user:', error);
            alert('Lỗi đăng ký. Vui lòng thử lại.');
        });
}
function emailValidation(email){
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
function dobValidate(dob){
    if (!dob) {
        alert('Ngày sinh không được để trống');
        return False
    }
    const dobDate = new Date(dob);
    const year = dobDate.getFullYear();
    const month = dobDate.getMonth() + 1; // Months are zero-based
    const day = dobDate.getDate();
    const formattedDate = `${month}/${day}/${year}`;
    if (new Date(formattedDate) > new Date()) {
        alert('Ngày sinh không hợp lệ');
        return False
    }
    return True;
}