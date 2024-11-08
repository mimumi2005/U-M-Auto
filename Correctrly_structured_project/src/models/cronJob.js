// cronJob.js
import cron from 'node-cron';
import { sendEmail } from './emailService.js'; // Import the email service
import { getAppointmentsForTomorrow } from './appointmentModels.js'; // Adjust import based on your project structure
import {updateTenureForAllWorkers} from './updateTenure.js'
// Schedule a job to run every day at midnight
cron.schedule('0 0 * * *', async () => {
    console.log('Updating tenure...');
    updateTenureForAllWorkers();
    console.log('Checking for appointments for tomorrow...');
    try {
        const appointments = await getAppointmentsForTomorrow();
       

        for (const appointment of appointments) {
            const StartDate = appointment.StartDate;
            const date = new Date(StartDate);
            // Example format: "November 7, 2024, 8:00 AM"
            const readableDate = date.toLocaleString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
    
            console.log(readableDate); // "Wednesday, November 7, 2024, 8:00 AM"
            const emailText = `Dear ${appointment.Username},\n\nYou have an appointment scheduled for tomorrow at ${readableDate}. Please be sure to arrive at least 5 minutes before your scheduled time to ensure everything runs smoothly.\n\nAppointment:\n${appointment.ProjectInfo}\n\nThank you for choosing our service! We look forward to seeing you soon.\n\nBest regards,\nAuto Repair Service`;
            await sendEmail(appointment.Email, 'Appointment Reminder', emailText);
        }
    } catch (error) {
        console.error('Error checking appointments:', error);
    }
});