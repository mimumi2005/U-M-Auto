document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();

    if (!name || !email || !message) {
      showErrorAlert('Fill all contact form fields');
      return;
    }

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
        showSuccessAlert('Contact form success', () => form.reset());
      } else {
        showErrorAlert('Contact form error');
      }
    } catch (err) {
      console.error('Error:', err);
      showErrorAlert('Conctact form error');
    }
  });
});
