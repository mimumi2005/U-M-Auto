document.addEventListener('DOMContentLoaded', function() {
    // Fetch current settings
    const fetchSettings = async () => {
        try {
            const response = await fetch('/auth/notification-settings');
            const data = await response.json();
            console.log(data);
            if (data.status === 'success') {
                document.getElementById('Notifications').value = data.settings.deal_notifications;
                document.getElementById('repairType').value = data.settings.appointment_reminders;
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        }
    };

    // Handle form submission
    const handleSubmit = async (event) => {
        event.preventDefault();
        const dealNotifications = document.getElementById('Notifications').value;
        const appointmentReminders = document.getElementById('repairType').value;

        try {
            const response = await fetch('/auth/update-notification-settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'CSRF-Token': csrfToken
                },
                body: JSON.stringify({
                    dealNotifications,
                    appointmentReminders
                })
            });

            const data = await response.json();
            if (data.status === 'success') {
                const alertBox = document.getElementById('customNotificationAlert');
                alertBox.classList.remove('nodisplay');
                setTimeout(() => {
                    alertBox.classList.add('nodisplay');
                }, 2000);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    // Initialize
    fetchSettings();
    document.querySelector('button[type="submit"]').addEventListener('click', handleSubmit);
});