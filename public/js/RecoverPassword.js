document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('resetForm');

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const emailInput = document.getElementById('email');
        const emailValue = emailInput.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        document.getElementById('InvalidEmail').classList.add('nodisplay');
        document.getElementById('EmptyEmail').classList.add('nodisplay');

        if (emailValue === '') {
            document.getElementById('EmptyEmail').classList.remove('nodisplay');
            return;
        }
        if (!emailRegex.test(emailValue)) {
            document.getElementById('InvalidEmail').classList.remove('nodisplay');
            return;
        }
        document.getElementById('customResetAlert').classList.remove('nodisplay');
        // Simulating an API request
        setTimeout(function () {
            form.reset();
            window.location.href = '/Login';
        }, 3000);
    });
});
