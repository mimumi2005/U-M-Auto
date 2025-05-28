const loggedUser = getCookie("userData");
const form = document.getElementById('change-password-form');
const inputs = form.querySelectorAll('input');

document.addEventListener('DOMContentLoaded', function () {
    const changeNameButton = document.getElementById('change-name-button');
    const changeUsernameButton = document.getElementById('change-username-button');

    // Function to replace text with input field
    function replaceWithInput(fieldId, defaultValue, maxLength) {
        const field = document.getElementById(fieldId);
        const inputField = document.createElement('input');

        inputField.type = 'text';
        inputField.value = defaultValue;
        inputField.maxLength = maxLength;
        inputField.className = 'form-control ';

        inputField.setAttribute('data-original', defaultValue);

        field.parentNode.replaceChild(inputField, field);

        inputField.focus();

        const saveNewValue = () => {
            changeUsernameButton.classList.remove('d-none');
            changeNameButton.classList.remove('d-none');

            const newValue = inputField.value.trim();
            const originalValue = inputField.getAttribute('data-original');

            // If no changes, just replace input with old static element
            if (newValue == originalValue) {
                const revertText = document.createElement('a');
                revertText.className = 'profile-value';
                revertText.id = fieldId;
                revertText.textContent = originalValue;
                inputField.parentNode.replaceChild(revertText, inputField);
                return;
            }

            const newText = document.createElement('a');
            newText.className = 'profile-value';
            newText.id = fieldId;
            newText.textContent = newValue;
            inputField.parentNode.replaceChild(newText, inputField);

            fetch(`/auth/update-${fieldId}`, {
                method: 'POST',
                headers: {
                    'CSRF-Token': csrfToken,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ [fieldId]: newValue })
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    console.log(data);
                    if (data.success === true) {
                        showSuccessAlert('Information updated successfully');
                    }
                })
                .catch(error => {
                    console.error('There was a problem with the fetch operation:', error);
                });
        };

        inputField.addEventListener('blur', saveNewValue);

        inputField.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                inputField.blur();
            }
        });
    }

    changeNameButton.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('name').focus();
        replaceWithInput('name', document.getElementById('name').textContent, 25);
        changeNameButton.classList.add('d-none');
    });

    changeUsernameButton.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('username').focus();
        replaceWithInput('username', document.getElementById('username').textContent, 35);
        changeUsernameButton.classList.add('d-none');
    });

    fetchUserInfo();
    const cancelchangePasswordButton = document.getElementById("cancel-password-reset-button");
    const changePasswordButton = document.getElementById("change-password-button");
    cancelchangePasswordButton.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            HidePasswordReset();
        }
    });
    changePasswordButton.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            ShowPasswordReset();
        }
    });
    changePasswordButton.addEventListener("click", ShowPasswordReset);
    cancelchangePasswordButton.addEventListener("click", HidePasswordReset);


    // Add event listener to each input field
    inputs.forEach(function (input, index) {
        input.addEventListener('keydown', function (event) {
            if (event.key === 'Enter') {
                if (index != 2) { // If the current input field is the third one (index 2)S
                    event.preventDefault();
                    const nextIndex = (index + 1) % inputs.length;
                    inputs[nextIndex].focus();
                }
                else {
                    document.getElementById('submitbutton').focus();
                }
            }
        });
    });
    document.querySelector('form').addEventListener('submit', function (e) {
        e.preventDefault();
        var submitButton = form.querySelector('button[type="submit"]');

        // Reset visuals for current password
        document.getElementById('current-password-label').style.color = 'rgb(255,255,255)';
        document.getElementById('current-password').classList.remove('form-control-incorrect');
        document.getElementById('EmptyOldPassword').classList.add('nodisplay');
        document.getElementById('WrongPassword').classList.add('nodisplay');

        // Resets visuals for new password
        document.getElementById('new-password-label').style.color = 'rgb(255,255,255)';
        document.getElementById('new-password').classList.remove('form-control-incorrect');
        document.getElementById('EmptyNewPassword').classList.add('nodisplay');
        document.getElementById('UnsafeNewPassword').classList.add('nodisplay');


        // Resets visuals for confirm new password
        document.getElementById('confirm-new-password-label').style.color = 'rgb(255,255,255)';
        document.getElementById('confirm-new-password').classList.remove('form-control-incorrect');
        document.getElementById('EmptyConfirmPassword').classList.add('nodisplay');
        document.getElementById('NoMatchPassword').classList.add('nodisplay');

        // gets base values
        const currentPassword = document.getElementById('current-password').value.trim();
        const newPassword = document.getElementById('new-password').value.trim();
        const confirmNewPassword = document.getElementById('confirm-new-password').value.trim();


        // Checks for empty fields, if empty change forum accordingly and exit the function
        if (currentPassword == '') {
            document.getElementById('current-password-label').style.color = 'rgb(255,0,0)';
            document.getElementById('current-password').classList.add('form-control-incorrect');
            document.getElementById('EmptyOldPassword').classList.remove('nodisplay');
            return
        }

        if (newPassword == '') {
            document.getElementById('new-password-label').style.color = 'rgb(255,0,0)';
            document.getElementById('new-password').classList.add('form-control-incorrect');
            document.getElementById('EmptyNewPassword').classList.remove('nodisplay');
            return
        }
        if (confirmNewPassword == '') {
            document.getElementById('confirm-new-password-label').style.color = 'rgb(255,0,0)';
            document.getElementById('confirm-new-password').classList.add('form-control-incorrect');
            document.getElementById('EmptyConfirmPassword').classList.remove('nodisplay');
            return
        }

        // Checks if enterred password is safe
        const passwordRegex = /^(?=.*[0-9A-Z!@#$%^&*])(.{5,})$/;

        if (!passwordRegex.test(newPassword)) {
            document.getElementById('new-password-label').style.color = 'rgb(255,0,0)';
            document.getElementById('new-password').classList.add('form-control-incorrect');
            document.getElementById('UnsafeNewPassword').classList.remove('nodisplay');
            return
        }

        // Checks if confirm password matches newpasword
        if (newPassword != confirmNewPassword) {
            document.getElementById('confirm-new-password-label').style.color = 'rgb(255,0,0)';
            document.getElementById('confirm-new-password').classList.add('form-control-incorrect');
            document.getElementById('NoMatchPassword').classList.remove('nodisplay');
            return
        }
        submitButton.disabled = true;
        submitButton.classList.add('disabled');
        // Communication with API to change password
        fetch('/auth/change-password', {
            method: 'POST',
            headers: {
                'CSRF-Token': csrfToken, // The token from the cookie or as passed in your view
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                currentPassword: currentPassword,
                newPassword: newPassword
            }),
        })
            .then(response => response.json())

            .then(data => {
                // Handle the response from the server
                if (data.status === 'success') {
                    showSuccessAlert('Password changed successfully', 2000);
                    document.querySelector('form').reset();
                    HidePasswordReset();
                }
                else {
                    document.getElementById('current-password-label').style.color = 'rgb(255,0,0)';
                    document.getElementById('current-password').classList.add('form-control-incorrect');
                    document.getElementById('WrongPassword').classList.remove('nodisplay');
                }

            })
            .catch(error => {
                console.error('Error:', error);
            });
    });


    // Functions for showing password reset form
    function ShowPasswordReset() {

        document.getElementById('change-password-form').classList.remove('nodisplay');
        document.getElementById('profile-info').classList.add('nodisplay');

    }
    function HidePasswordReset() {
        document.querySelector('form').reset();
        document.getElementById('change-password-form').classList.add('nodisplay');
        document.getElementById('profile-info').classList.remove('nodisplay');
        // Reset visuals for current password
        document.getElementById('current-password-label').style.color = 'rgb(255,255,255)';
        document.getElementById('current-password').classList.remove('form-control-incorrect');
        document.getElementById('EmptyOldPassword').classList.add('nodisplay');
        document.getElementById('WrongPassword').classList.add('nodisplay');

        // Resets visuals for new password
        document.getElementById('new-password-label').style.color = 'rgb(255,255,255)';
        document.getElementById('new-password').classList.remove('form-control-incorrect');
        document.getElementById('EmptyNewPassword').classList.add('nodisplay');
        document.getElementById('UnsafeNewPassword').classList.add('nodisplay');


        // Resets visuals for confirm new password
        document.getElementById('confirm-new-password-label').style.color = 'rgb(255,255,255)';
        document.getElementById('confirm-new-password').classList.remove('form-control-incorrect');
        document.getElementById('EmptyConfirmPassword').classList.add('nodisplay');
        document.getElementById('NoMatchPassword').classList.add('nodisplay');
    }

    // Removes form red border when user clicks on set parts of form
    document.getElementById('current-password').addEventListener('focus', function () {
        document.getElementById('current-password').classList.remove('form-control-incorrect');
    });

    document.getElementById('new-password').addEventListener('focus', function () {
        document.getElementById('new-password').classList.remove('form-control-incorrect');
    });

    document.getElementById('confirm-new-password').addEventListener('focus', function () {
        document.getElementById('confirm-new-password').classList.remove('form-control-incorrect');
    });

});

// Communication with API for getting information and showing it
function fetchUserInfo() {
    // Fetch user information from the server
    fetch(`/auth/ProfileInfo`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                // Update the profile information on the page
                document.getElementById("name").innerText = data.user.Name;
                document.getElementById("username").innerText = data.user.Username;
                document.getElementById("email").innerText = data.user.Email;
            } else {
                console.error('Error fetching user information:', data.message);
            }
        })
        .catch(error => {
            console.error('Error fetching user information:', error);
        });
}

document.getElementById('deleteAccountBtn').addEventListener('click', async function () {
    const popupInnerHtml = `<p>${translate("This will permanently delete")} <b>${translate("your account")}</b>!</p>`;
    showConfirmationPopup(popupInnerHtml, () => {
        DeleteAccount();
    });
});
async function DeleteAccount(){
    try {
        const response = await fetch(`/auth/user-delete`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'csrf-token': csrfToken
            }
        });
        if (response.ok) {
            window.location.href = '/Goodbye';
        }
        else{
            showErrorAlert(translate("Failed to delete account. Please try again later."), 3000);
        }
    } catch (err) {
        console.error('Error deleting account:', err);
    }
}