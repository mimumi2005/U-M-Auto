document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('resetForm');

    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        const submitButton = form.querySelector('button[type="submit"]');
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

        try {
            showSuccessAlert("Sending reset email...");
            submitButton.disabled = true;
            submitButton.classList.add('disabled');
            const response = await fetch('/user/request-password-reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: emailValue }),
            });

            const data = await response.json();

            if (response.ok) {
                showSuccessAlert(data.message, () => {
                    form.reset();
                    window.location.href = '/Login';
                });
            } else {
                submitButton.disabled = false;
                submitButton.classList.remove('disabled');
                alert(data.message || 'Error sending reset email');
            }
        } catch (err) {
            console.error('Error:', err);
            alert('An unexpected error occurred');
        }
    });
});
