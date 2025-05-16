document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form');

  form.addEventListener('submit', async (e) => {
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.classList.add('disabled');
    submitButton.disabled = true;
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();

    if (!name || !email || !message) {
      showErrorAlert('Fill all contact form fields');
      return;
    }
    showSuccessAlert('Attempting to send email...');
    try {
      const response = await fetch('/api/sendEmail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, message })
      });

      const result = await response.json();

      if (response.ok) {
        showSuccessAlert('Message sent succesfully', () => form.reset());
      } else {
        showErrorAlert('Contact form error');
      }
    } catch (err) {
      console.error('Error:', err);
      showErrorAlert('Conctact form error');
    } finally{
      submitButton.disabled = false;
      submitButton.classList.remove('disabled');
    }
  });
});
