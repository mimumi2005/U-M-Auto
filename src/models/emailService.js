import nodemailer from 'nodemailer';
import dotenv from "dotenv";

dotenv.config();
// Create a transporter object
console.log(process.env.MAIL_USER);
const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: false, // Use true if using port 465
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
    },
});
  
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