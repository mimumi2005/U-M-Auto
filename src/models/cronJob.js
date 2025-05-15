// cronJob.js
import cron from 'node-cron';
import { sendEmail } from './emailService.js';
import { getAppointmentsForTomorrow, getAppointmentsForHour } from './appointmentModels.js';
import { updateTenureForAllWorkers } from './updateTenure.js';
import { getNotificationSettings } from './notificationModels.js';

// Schedule a job to run every day at midnight
cron.schedule('0 0 * * *', async () => {
    console.log('Updating tenure...');
    updateTenureForAllWorkers();
    console.log('Checking for appointments for tomorrow...');
    try {
        const appointments = await getAppointmentsForTomorrow();

        for (const appointment of appointments) {
            // Check user's notification preferences
            const notifSettings = await getNotificationSettings(appointment.idUser);
            
            // Only send if they want daily notifications (Day or Both)
            if (notifSettings && (notifSettings.appointment_reminders === 'Day' || 
                notifSettings.appointment_reminders === 'Both')) {
                
                const StartDate = appointment.StartDate;
                const date = new Date(StartDate);
                const readableDate = date.toLocaleString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                });

                const emailText = `Dear ${appointment.Username},\n\n` +
                    `You have an appointment scheduled for tomorrow at ${readableDate}. ` +
                    `Please be sure to arrive at least 5 minutes before your scheduled time to ensure everything runs smoothly.\n\n` +
                    `Appointment:\n${appointment.ProjectInfo}\n\n` +
                    `Thank you for choosing our service! We look forward to seeing you soon.\n\n` +
                    `Best regards,\nAuto Repair Service`;

                await sendEmail(appointment.Email, 'Appointment Reminder', emailText);
            }
        }
    } catch (error) {
        console.error('Error checking appointments:', error);
    }
});

// Schedule a job to run every hour
cron.schedule('* * * * *', async () => {
    console.log('\nChecking for appointments for next hour...');
    try {
        const appointments = await getAppointmentsForHour();
        for (const appointment of appointments) {
            // Check user's notification preferences
            const notifSettings = await getNotificationSettings(appointment.idUser);
            // Only send if they want hourly notifications (Hour or Both)
            if (notifSettings && (notifSettings.appointment_reminders === 'Hour' || 
                notifSettings.appointment_reminders === 'Both')) {

                const StartDate = appointment.StartDate;
                const date = new Date(StartDate);
                const readableDate = date.toLocaleString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                });

                const emailText = `Dear ${appointment.Username},\n\n` +
                    `You have an appointment scheduled in one hour at ${readableDate}. ` +
                    `Please be sure to arrive at least 5 minutes before your scheduled time to ensure everything runs smoothly.\n\n` +
                    `Appointment:\n${appointment.ProjectInfo}\n\n` +
                    `Thank you for choosing our service! We look forward to seeing you soon.\n\n` +
                    `Best regards,\nAuto Repair Service`;

                await sendEmail(appointment.Email, 'Appointment Reminder', emailText);
            }
        }
    } catch (error) {
        console.error('Error checking appointments:', error);
    }
});