document.addEventListener('DOMContentLoaded', function () {

    document.getElementById('name').focus();

    document.querySelector('form').addEventListener('submit', function (e) {
        // Prevent the default form submission
        e.preventDefault();

        // Resets the error message styles
        document.getElementById('name-red').style.color="#fff";
        document.getElementById('username-red').style.color="#fff";
        document.getElementById('email-red').style.color="#fff";
        document.getElementById('password-red').style.color="#fff";

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
        if(NameValue==''){
            document.getElementById('name-red').style.color="rgb(255, 0, 0)";
            document.getElementById('name').classList.add('form-control-incorrect')
            document.getElementById('EmptyName').classList.remove('nodisplay');
            return
        }
        

        // Email validation
        const EmailInput = document.getElementById('email');
        const EmailPattern = /^[^\s@]+@[^\s@]+.[^\s@]+$/;
        const EmailValue = EmailInput.value.trim();
        if ((!EmailPattern.test(EmailValue))){
            document.getElementById('email').classList.add('form-control-incorrect');
            document.getElementById('BadEmail').classList.remove('nodisplay');
            document.getElementById('email-red').style.color="rgb(255, 0, 0)";
            return;
        }
        if(EmailValue==''){
            document.getElementById('email').classList.add('form-control-incorrect');
            document.getElementById('EmptyEmail').classList.remove('nodisplay');
            document.getElementById('email-red').style.color="rgb(255, 0, 0)";
            return;
        }     

        // Username validation
        const UsernameValue = document.getElementById("username").value.trim();
        if (UsernameValue==''){
            document.getElementById('username').classList.add('form-control-incorrect');
            document.getElementById('EmptyUsername').classList.remove('nodisplay');
            document.getElementById('username-red').style.color="rgb(255, 0, 0)";
            return;
        }
        
        //password validation
        const passwordInput = document.getElementById('password');
        const passwordValue = passwordInput.value.trim();
        const passwordRegex = /^(?=.*[0-9A-Z!@#$%^&*])(.{5,})$/;
        
        if (!passwordRegex.test(passwordValue)) {
            document.getElementById('password').classList.add('form-control-incorrect');
            document.getElementById('BadPassword').classList.remove('nodisplay');
            document.getElementById('password-red').style.color="rgb(255, 0, 0)";
            return;
        }

        if(passwordValue==''){
            document.getElementById('password').classList.add('form-control-incorrect');
            document.getElementById('EmptyPassword').classList.remove('nodisplay');
            document.getElementById('password-red').style.color="rgb(255, 0, 0)";
            return;
        }     

        // Collect form data
        const formData = {
            name: document.getElementById('name').value,
            email: EmailValue,
            username: document.getElementById('username').value,
            password: document.getElementById('password').value,
        // Add other form fields as needed
        };
        document.getElementById('password').value = '';
        // Make a POST request to the backend
        console.log('Form Data:', formData);
        console.log('Sending Data:', JSON.stringify(formData));


        fetch(window.location.origin + '/auth/sign-up', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        })
        .then(response => response.json())
        .then(data => handleResponse(data))
        .catch(error => {
            console.error('Error:', error);
        });
    
    
    
    });
    function handleResponse(response) {
        // On success announces it 
        if (response.status === 'success') {
            console.log('Server response:', response);
            showCustomSignUpAlert();
            loginUser(response.data);
            document.querySelector('form').reset();
        } else {
            console.error('Error:', response);

        // Divides errors
        if(response.message=='Email is already taken'){
                document.getElementById('TakenEmail').classList.remove('nodisplay');
                document.getElementById('email-red').style.color="rgb(255, 0, 0)";
                document.getElementById('email').classList.add('form-control-incorrect');

                
        
            }
        if(response.message=='Username is already taken'){
            document.getElementById('TakenUsername').classList.remove('nodisplay');
            document.getElementById('username-red').style.color="rgb(255, 0, 0)";
            document.getElementById('username').classList.add('form-control-incorrect');
            
        }
    }
}

// Removes red border of form input when user clicks that part of form
    document.getElementById('email').addEventListener('focus', function() {
            document.getElementById('email').classList.remove('form-control-incorrect');
    });
    document.getElementById('username').addEventListener('focus', function() {
        document.getElementById('username').classList.remove('form-control-incorrect');
    });
    document.getElementById('name').addEventListener('focus', function() {
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