document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('resetForm');

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const emailInput = document.getElementById('email');
        const emailValue = emailInput.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        document.getElementById('InvalidEmail').classList.add('nodisplay');

        if (emailValue === '') {
            document.getElementById('email-red').classList.add('text-danger');
            return;
        }
        if (!emailRegex.test(emailValue)) {
            document.getElementById('InvalidEmail').classList.remove('nodisplay');
            document.getElementById('email-red').classList.add('text-danger');
            return;
        }
        document.getElementById('email-red').classList.remove('text-danger');
        showSuccessAlert(
            'Password reset email sent', 
            setTimeout(function () {
            form.reset();
            window.location.href = '/Login';
        }, 1000));
    });
});
