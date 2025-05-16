document.addEventListener('DOMContentLoaded', function () {
    const submitButton = document.querySelector('button[type="submit"]');
    const dealNotificationsEl = document.getElementById('Notifications');
    const appointmentRemindersEl = document.getElementById('repairType');

    let originalDeal = '';
    let originalReminder = '';

    // Enable button only if values changed
    const checkForChanges = () => {
        const currentDeal = dealNotificationsEl.value;
        const currentReminder = appointmentRemindersEl.value;

        const changed = currentDeal !== originalDeal || currentReminder !== originalReminder;
        submitButton.disabled = !changed;
        submitButton.classList.toggle('disabled', !changed);
    };

    // Fetch current settings
    const fetchSettings = async () => {
        try {
            const response = await fetch('/auth/notification-settings');
            const data = await response.json();
            if (data.status === 'success') {
                originalDeal = data.settings.deal_notifications;
                originalReminder = data.settings.appointment_reminders;

                dealNotificationsEl.value = originalDeal;
                appointmentRemindersEl.value = originalReminder;

                checkForChanges(); // Ensure button is initially disabled
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        }
    };

    // Handle form submission
    const handleSubmit = async (event) => {
        event.preventDefault();

        const dealNotifications = dealNotificationsEl.value;
        const appointmentReminders = appointmentRemindersEl.value;

        submitButton.disabled = true;
        submitButton.classList.add('disabled');

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
                // Update original values
                originalDeal = dealNotifications;
                originalReminder = appointmentReminders;
                checkForChanges();
            }
        } catch (error) {
            showErrorAlert("Failed to update notification settings", 2000);
        }
    };

    // Listen for changes to re-check
    dealNotificationsEl.addEventListener('change', checkForChanges);
    appointmentRemindersEl.addEventListener('change', checkForChanges);

    // Initialize
    fetchSettings();
    submitButton.addEventListener('click', handleSubmit);
});
