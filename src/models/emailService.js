import nodemailer from 'nodemailer';
import dotenv from "dotenv";

dotenv.config();
// Create a transporter object
const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: 465,
    secure: true, // Use true if using port 465
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
    },
});

export const sendAppointmentReminder = async (appointment, readableDate) => {

    const emailText = `Dear ${appointment.Username},\n\n` +
        `You have an appointment scheduled in one hour at ${readableDate}. ` +
        `Please be sure to arrive at least 5 minutes before your scheduled time to ensure everything runs smoothly.\n\n` +
        `Appointment:\n${appointment.ProjectInfo}\n\n` +
        `Thank you for choosing our services! We look forward to seeing you soon.\n\n` +
        `Best regards,\nU&M Auto`;
    sendEmail(appointment.Email, 'Appointment Reminder', emailText);
}

export const sendAppointmentStatusUpdateAlert = async (appointment, newStatus) => {

    const emailText = `Dear ${appointment.Username},\n\n` +
        `Your appointments status has been updated to: ${newStatus}. ` +
        `For appointment of\n\n` +
        `\n${appointment.ProjectInfo}\n\n` +
        `Thank you for choosing our services! We hope you keep using our services.\n\n` +
        `Best regards,\nU&M Auto`;
    sendEmail(appointment.Email, 'Appointment Alert', emailText);
}

export const sendAppointmentDateUpdateAlert = async (appointment, newEndDate) => {

    const emailText = `Dear ${appointment.Username},\n\n` +
        `Your appointments has been delayed to: ${newEndDate}. ` +
        `For appointment of\n\n` +
        `\n${appointment.ProjectInfo}\n\n` +
        `Sorry for the inconveniance.\n\n` +
        `Best regards,\nU&M Auto`;
    sendEmail(appointment.Email, 'Appointment Delay Alert', emailText);
}

// Function to send an email
export const sendEmail = async (to, subject, text) => {
    const mailOptions = {
        from: process.env.MAIL_USER,
        to,
        subject,
        text,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent to: ${to}`);
    } catch (error) {
        console.error('Error sending email:', error);
    }
}; 