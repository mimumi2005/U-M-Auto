document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('name').focus();
    const form = document.getElementById('signupForm');
    const inputs = form.querySelectorAll('input');

    inputs.forEach(function (input, index) {
        input.addEventListener('keydown', function (event) {
            if (event.key === 'Enter') {
                if (index != 3) { // If the current input field is the third one (index 2)S
                    event.preventDefault();
                    const nextIndex = (index + 1) % inputs.length;
                    inputs[nextIndex].focus();
                }
            }
        });
    });

    document.getElementById('acceptPolicy').addEventListener('change', () => {
        if (document.getElementById('acceptPolicy').checked) {
            document.getElementById('recaptchaContainer').classList.remove("nodisplay"); // Show reCAPTCHA
        }
    });

    document.querySelector('form').addEventListener('submit', function (e) {
        var submitButton = form.querySelector('button[type="submit"]');

        // Prevent the default form submission
        e.preventDefault();

        // Resets the error message styles
        document.getElementById('name-red').classList.remove('text-danger');
        document.getElementById('username-red').classList.remove('text-danger');
        document.getElementById('email-red').classList.remove('text-danger');
        document.getElementById('password-red').classList.remove('text-danger');

        document.getElementById('EmptyName').classList.add('nodisplay');
        document.getElementById('EmptyUsername').classList.add('nodisplay');
        document.getElementById('BadEmail').classList.add('nodisplay');
        document.getElementById('BadPassword').classList.add('nodisplay');
        document.getElementById('TakenEmail').classList.add('nodisplay');
        document.getElementById('TakenUsername').classList.add('nodisplay');

        document.getElementById('name').classList.remove('form-control-incorrect')
        document.getElementById('username').classList.remove('form-control-incorrect');
        document.getElementById('email').classList.remove('form-control-incorrect');
        document.getElementById('password').classList.remove('form-control-incorrect')

        // Name validation
        const NameValue = document.getElementById('name').value.trim();
        if (NameValue == '') {
            document.getElementById('name-red').classList.add('text-danger');
            document.getElementById('name').classList.add('form-control-incorrect')
            document.getElementById('EmptyName').classList.remove('nodisplay');
            return
        }


        // Email validation
        const EmailInput = document.getElementById('email');
        const EmailPattern = /^[^\s@]+@[^\s@]+.[^\s@]+$/;
        const EmailValue = EmailInput.value.trim();
        if ((!EmailPattern.test(EmailValue))) {
            document.getElementById('email').classList.add('form-control-incorrect');
            document.getElementById('BadEmail').classList.remove('nodisplay');
            document.getElementById('email-red').classList.add('text-danger');
            return;
        }
        if (EmailValue == '') {
            document.getElementById('email').classList.add('form-control-incorrect');
            document.getElementById('EmptyEmail').classList.remove('nodisplay');
            document.getElementById('email-red').classList.add('text-danger');
            return;
        }

        // Username validation
        const UsernameValue = document.getElementById("username").value.trim();
        if (UsernameValue == '') {
            document.getElementById('username').classList.add('form-control-incorrect ');
            document.getElementById('EmptyUsername').classList.remove('nodisplay');
            document.getElementById('username-red').classList.add('text-danger');
            return;
        }

        //password validation
        const passwordInput = document.getElementById('password');
        const passwordValue = passwordInput.value.trim();
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

        if (!passwordRegex.test(passwordValue)) {
            document.getElementById('password').classList.add('form-control-incorrect');
            document.getElementById('BadPassword').classList.remove('nodisplay');
            document.getElementById('password-red').classList.add('text-danger');
            return;
        }

        if (passwordValue == '') {
            document.getElementById('password').classList.add('form-control-incorrect');
            document.getElementById('EmptyPassword').classList.remove('nodisplay');
            document.getElementById('password-red').classList.add('text-danger');
            return;
        }

        // Collect form data
        const formData = {
            name: document.getElementById('name').value,
            email: EmailValue,
            username: document.getElementById('username').value,
            password: document.getElementById('password').value,
            'g-recaptcha-response': document.querySelector('.g-recaptcha-response').value // Get the reCAPTCHA response
            // Add other form fields as needed
        };
        document.getElementById('password').value = '';

        // Reset captcha
        grecaptcha.reset();
        submitButton.disabled = true;
        submitButton.classList.add('disabled');
        // Make a POST request to the backend
        fetch('/auth/sign-up', {
            method: 'POST',
            headers: {
                'CSRF-Token': csrfToken, // The token from the cookie or as passed in your view
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData),
        })
            .then(response => response.json())
            .then(data => {
                handleResponse(data);
                if (data.status !== 'success') {
                    submitButton.disabled = false;
                    submitButton.classList.remove('disabled');
                }
            })
            .catch(error => {
                console.error('Error:', error);
            })
            .finally(() => {
                submitButton.disabled = false;
                submitButton.classList.remove('disabled');
            });
    });

    function handleResponse(response) {
        // On success announces it 
        if (response.status === 'success') {
            showSuccessAlert("SuccessSignUp");
            setTimeout(function () {
                loginUser(response.data);
                document.querySelector('form').reset();
            }, 200);
        } else {
            console.error('Error:', response);

            // Divides errors
            if (response.message == 'Email is already taken') {
                document.getElementById('TakenEmail').classList.remove('nodisplay');
                document.getElementById('email-red').classList.add('text-danger');
                document.getElementById('email').classList.add('form-control-incorrect');



            }
            if (response.message == 'Username is already taken') {
                document.getElementById('TakenUsername').classList.remove('nodisplay');
                document.getElementById('username-red').classList.add('text-danger');
                document.getElementById('username').classList.add('form-control-incorrect');

            }
        }
    }

    // Removes red border of form input when user clicks that part of form
    document.getElementById('email').addEventListener('focus', function () {
        document.getElementById('email').classList.remove('form-control-incorrect');
    });
    document.getElementById('username').addEventListener('focus', function () {
        document.getElementById('username').classList.remove('form-control-incorrect');
    });
    document.getElementById('name').addEventListener('focus', function () {
        document.getElementById('name').classList.remove('form-control-incorrect')
    });



    document.addEventListener("DOMContentLoaded", function () {
        const acceptPolicyCheckbox = document.getElementById("acceptPolicy");
        const termsConditionsLink = document.getElementById("termsConditionsLink");

        acceptPolicyCheckbox.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                this.checked = !this.checked;
                event.preventDefault(); // Prevent form submission if Enter key is pressed
            }
        });

        termsConditionsLink.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                this.click(); // Simulate a click event on the anchor element
            }
        });
    });
});