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

export const sendEmail = async (to, subject, text, html) => {
  const mailOptions = {
    from: process.env.MAIL_USER,
    to,
    subject,
    text,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to: ${to}`);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

export const sendAppointmentReminder = async (appointment, readableDate) => {
  const textVersion = `Dear ${appointment.Username},\n\n` +
    `You have an appointment scheduled in one hour at ${readableDate}.\n` +
    `Please be sure to arrive at least 5 minutes early to ensure everything runs smoothly.\n\n` +
    `Appointment:\n${appointment.ProjectInfo}\n\n` +
    `Thank you for choosing our services. We look forward to seeing you soon.\n\n` +
    `Best regards,\nU&M Auto`;

  const htmlVersion = `
    <p>Dear ${appointment.Username},</p>
    <p>You have an appointment scheduled in one hour at <strong>${readableDate}</strong>.</p>
    <p>Please arrive at least 5 minutes early to ensure everything runs smoothly.</p>
    <p>Appointment:</p>
    <div style="background-color:#f4f4f4; border:1px solid #ccc; white-space:pre-wrap;">${appointment.ProjectInfo}</div>
    <p>Thank you for choosing our services. We look forward to seeing you soon.</p>
    <p>Best regards,<br>U&amp;M Auto</p>
  `;

  await sendEmail(appointment.Email, 'Appointment Reminder', textVersion, htmlVersion);
};

export const sendAppointmentStatusUpdateAlert = async (appointment, newStatus) => {
  const textVersion = `Dear ${appointment.Username},\n\n` +
    `Your appointment status has been updated to: ${newStatus}.\n\n` +
    `Appointment:\n${appointment.ProjectInfo}\n\n` +
    `Thank you for choosing our services. We hope you continue with us.\n\n` +
    `Best regards,\nU&M Auto`;

  const htmlVersion = `
    <p>Dear ${appointment.Username},</p>
    <p>Your appointment status has been updated to: <strong>${newStatus}</strong>.</p>
    <p>Appointment:</p>
    <div style="background-color:#f4f4f4; border:1px solid #ccc;white-space:pre-wrap;">${appointment.ProjectInfo}</div>
    <p>Thank you for choosing our services. We hope you continue with us.</p>
    <p>Best regards,<br>U&amp;M Auto</p>
  `;

  await sendEmail(appointment.Email, 'Appointment Alert', textVersion, htmlVersion);
};

export const sendAppointmentDateUpdateAlert = async (appointment, newEndDate) => {
  const textVersion = `Dear ${appointment.Username},\n\n` +
    `Your appointment has been delayed to: ${newEndDate}.\n\n` +
    `Appointment:\n${appointment.ProjectInfo}\n\n` +
    `We apologize for the inconvenience.\n\n` +
    `Best regards,\nU&M Auto`;

  const htmlVersion = `
    <p>Dear ${appointment.Username},</p>
    <p>Your appointment has been <strong>delayed</strong> to: <strong>${newEndDate}</strong>.</p>
    <p>Appointment:</p>
    <div style="background-color:#f4f4f4; border:1px solid #ccc; white-space:pre-wrap;">${appointment.ProjectInfo}</div>
    <p>We apologize for the inconvenience.</p>
    <p>Best regards,<br>U&amp;M Auto</p>
  `;

  await sendEmail(appointment.Email, 'Appointment Delay Alert', textVersion, htmlVersion);
};