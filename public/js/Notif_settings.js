document.addEventListener('DOMContentLoaded', function() {
    // Fetch current settings
    const fetchSettings = async () => {
        try {
            const response = await fetch('/auth/notification-settings');
            const data = await response.json();
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
                showSuccessAlert("Notification settings updated", 2000);
            }
        } catch (error) {
            showErrorAlert("Failed to update notification settings", 2000);
        }
    };

    // Initialize
    fetchSettings();
    document.querySelector('button[type="submit"]').addEventListener('click', handleSubmit);
});