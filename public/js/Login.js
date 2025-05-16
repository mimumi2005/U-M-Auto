document.addEventListener('DOMContentLoaded', function () {
    // Instantly focuses user on username field
    document.getElementById('username').focus();

    const form = document.getElementById('loginForm');
    const inputs = form.querySelectorAll('input');

    // Add event listener to each input field
    inputs.forEach(function (input, index) {
        input.addEventListener('keydown', function (event) {
            if (event.key === 'Enter') {
                if (index != 1) { // If the current input field is the third one (index 2)S
                    event.preventDefault();
                    const nextIndex = (index + 1) % inputs.length;
                    inputs[nextIndex].focus();
                }
            }
        });
    });

    document.querySelector('form').addEventListener('submit', function (e) {
        var submitButton = form.querySelector('button[type="submit"]');
        // Resets visuals for all error messages/styles
        document.getElementById('WrongUsername').classList.add('nodisplay');
        document.getElementById('WrongPassword').classList.add('nodisplay');
        document.getElementById('EmptyPassword').classList.add('nodisplay');
        document.getElementById('EmptyUsername').classList.add('nodisplay');
        document.getElementById('username').classList.remove('form-control-incorrect');
        document.getElementById('password').classList.remove('form-control-incorrect');
        document.getElementById('username-red').style.color = "rgb(255, 255, 255)";
        document.getElementById('password-red').style.color = "rgb(255, 255, 255)";

        // Prevent the default form submission
        e.preventDefault();

        //Empty check
        const UsernameValue = document.getElementById('username').value.trim();
        const PasswordValue = document.getElementById('password').value.trim();

        if (UsernameValue == '') {
            document.getElementById('username-red').style.color = "rgb(255, 0, 0)";
            document.getElementById('username').classList.add('form-control-incorrect')
            document.getElementById('EmptyUsername').classlist.remove('nodisplay');
            document.getElementById('username').focus();
            return
        }
        if (PasswordValue == '') {
            document.getElementById('password-red').style.color = "rgb(255, 0, 0)";
            document.getElementById('password').classList.add('form-control-incorrect')
            document.getElementById('EmptyPassword').classList.remove('nodisplay');
            return
        }

        // Saves info in formData
        const formData = {
            username: document.getElementById('username').value,
            password: document.getElementById('password').value
        };
        document.getElementById('password').value = '';
        submitButton.disabled = true;
        submitButton.classList.add('disabled');
        // Communicates with API to login to account
        fetch('/auth/login', {
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
                showErrorAlert(`Cannot connect to server  ${error}`);
                submitButton.disabled = false;
                submitButton.classList.remove('disabled');
            })
    });

    function handleResponse(response) {
        // If succesful announces it and resets form
        if (response.status === 'success') {
            showSuccessAlert("Successfully logged in");
            setTimeout(function () {
                loginUser(response.data);
                document.querySelector('form').reset();
            }, 200);

        } else {
            //Else divides errors to wrong username or wrong password
            console.error('Error:', response);

            if (response.status == '1') {
                document.getElementById('WrongUsername').classList.remove('nodisplay');
                document.getElementById('username-red').style.color = "rgb(255, 0, 0)";
                document.getElementById('username').classList.add('form-control-incorrect');

                document.getElementById('WrongPassword').classList.add('nodisplay');
                document.getElementById('password-red').style.color = "white";
                document.getElementById('password').classList.remove('form-control-incorrect');
                document.getElementById('username').focus();

            }
            if (response.status == '2') {
                document.getElementById('WrongPassword').classList.remove('nodisplay');
                document.getElementById('password-red').style.color = "rgb(255, 0, 0)";
                document.getElementById('password').classList.add('form-control-incorrect');

            }
        }
    }

    // When user focuses username removes red border
    document.getElementById('username').addEventListener('focus', function () {
        document.getElementById('username').classList.remove('form-control-incorrect');
    });

    document.getElementById('password').addEventListener('focus', function () {
        document.getElementById('password').classList.remove('form-control-incorrect');
    });
});
