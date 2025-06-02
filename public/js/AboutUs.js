document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form');

  // Event listener for the email sending form
  form.addEventListener('submit', async (e) => {
    const submitButton = form.querySelector('button[type="submit"]');
    // Disables the submit button to prevent multiple submissions
    submitButton.classList.add('disabled');
    submitButton.disabled = true;
    e.preventDefault();

    // Gets the values from the form fields
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();

    // Validates the form fields
    if (!name || !email || !message) {
      showErrorAlert('Fill all contact form fields');
      return;
    }
    // Since the sending of email takes a while, show an attempt alert
    showSuccessAlert('Attempting to send email...');
    try {
      // Sends the api request to the server to send the email
      const response = await fetch('/api/sendEmail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, message })
      });

      const result = await response.json();

      if (response.ok) {
        // Shows a success alert and resets the form
        showSuccessAlert('Message sent succesfully', () => form.reset());
      } else {
        // Show error alert with the message from the server
        showErrorAlert('Contact form error');
      }
    } catch (err) {
      console.error('Error:', err);
      showErrorAlert('Conctact form error');
    } finally{
      // Re-enables the submit button after the request is complete
      submitButton.disabled = false;
      submitButton.classList.remove('disabled');
    }
  });
});

// Initialize the map
function initMap() {
  var myLatLng = { lat: 57.234165, lng: 22.707727 };

  var map = new google.maps.Map(document.getElementById('map'), {
    center: myLatLng,
    zoom: 11
  });

  var marker = new google.maps.Marker({
    map: map,
    position: myLatLng,
    title: 'U&M Auto'
  });

  const infowindow = new google.maps.InfoWindow({
    ariaLabel: "U&M Auto",
    content: `
      <h6 class=text-dark>${translate("Find us at this location")}!</h6>
      <a 
        href="https://www.google.com/maps/dir/?api=1&destination=${myLatLng.lat},${myLatLng.lng}" 
        target="_blank" , class="text-center"
      >
        <b>${translate("Help me get there")}!</b>
      </a>
  `
  });

  infowindow.addListener('domready', function () {
    const headerContainer = document.querySelector('.gm-style-iw-ch');
    if (headerContainer) {
      headerContainer.innerHTML = '<h4 class="text-dark">U&M Auto</h4>';
    }
  });

  marker.addListener('click', function () {
    infowindow.open(map, marker);
  });
}