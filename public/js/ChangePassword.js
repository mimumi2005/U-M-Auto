document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('changePasswordForm');

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const passwordInput = document.getElementById('newPassword');
        const confirmPasswordInput = document.getElementById('confirmPassword');
        const passwordValue = passwordInput.value.trim();
        const confirmPasswordValue = confirmPasswordInput.value.trim();

        document.getElementById('InvalidPassword').classList.add('nodisplay');
        document.getElementById('EmptyPassword').classList.add('nodisplay');
        document.getElementById('PasswordMismatch').classList.add('nodisplay');

        if (passwordValue === '') {
            document.getElementById('EmptyPassword').classList.remove('nodisplay');
            return;
        }
        if (passwordValue.length < 8) {
            document.getElementById('InvalidPassword').classList.remove('nodisplay');
            return;
        }
        if (passwordValue !== confirmPasswordValue) {
            document.getElementById('PasswordMismatch').classList.remove('nodisplay');
            return;
        }
        document.getElementById('customChangeAlert').classList.remove('nodisplay');
        // Simulating an API request
        setTimeout(function () {
            form.reset();
        }, 2000);
    });
});
