document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('changePasswordForm');

    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        const passwordInput = document.getElementById('newPassword');
        const confirmPasswordInput = document.getElementById('confirmPassword');
        const passwordValue = passwordInput.value.trim();
        const confirmPasswordValue = confirmPasswordInput.value.trim();

        const passwordTitle = document.getElementById('password-red');
        const confirmPasswordTitle = document.getElementById('confirm-password-red');
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

        passwordTitle.classList.remove('text-danger');
        confirmPasswordTitle.classList.remove('text-danger');
        document.getElementById('InvalidPassword').classList.add('nodisplay');
        document.getElementById('EmptyPassword').classList.add('nodisplay');
        document.getElementById('PasswordMismatch').classList.add('nodisplay');

        if (passwordValue === '') {
            document.getElementById('EmptyPassword').classList.remove('nodisplay');
            passwordTitle.classList.add('text-danger');
            return;
        }
        if (!passwordRegex.test(passwordValue)) {
            document.getElementById('InvalidPassword').classList.remove('nodisplay');
            passwordTitle.classList.add('text-danger');
            return;
        }
        if (passwordValue !== confirmPasswordValue) {
            document.getElementById('PasswordMismatch').classList.remove('nodisplay');
            confirmPasswordTitle.classList.add('text-danger');
            return;
        }
        try {
            // Grab the resetToken from the URL
            const urlParts = window.location.pathname.split('/');
            const resetToken = urlParts[urlParts.length - 1];

            const response = await fetch(`/user/reset-password-with-tokem/${resetToken}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'CSRF-Token': csrfToken // if you’re using CSRF tokens
                },
                body: JSON.stringify({
                    token: resetToken,
                    newPassword: passwordValue
                }),
            });

            const data = await response.json();
            if (response.ok) {
                showSuccessAlert('Password changed successfully!', function () {
                    form.reset();
                    // optionally, redirect to login or homepage
                    window.location.href = '/Login';
                });
            } else {
                console.error('Error:', data.message);
                 showErrorAlert('Error occured while changing password!')
            }
        } catch (error) {
            console.error('Error sending password reset request:', error);
        }
    });
});
