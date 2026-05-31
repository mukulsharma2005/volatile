import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// Create the transport layer using Gmail's server configurations
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.FROM_EMAIL,      // Your actual Gmail (e.g., example@gmail.com)
        pass: process.env.EMAIL_PASSWORD,  // The 16-character App Password
    },
});

const sendEmail = async (to, subject, html) => {
    const mailOptions = {
        from: `"Volatile Chat" <${process.env.FROM_EMAIL}>`,
        to: to, // Can now accept ANY recipient email address
        subject,
        html,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email dispatched successfully:', info.messageId);
        return info;
    } catch (error) {
        console.error('Nodemailer SMTP Error:', error.message);
        throw error;
    }
};

export const sendOtpEmail = async (otp, otpExpiryMinutes, email) => {
    const subject = "One Time Password for creating an account on Volatile."
    try {
        const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; border: 1px solid #e0e0e0; padding: 30px; text-align: center;">
                <h1 style="color: #6a0dad; margin-bottom: 20px;">Volatile Chat</h1>
                <p style="font-size: 16px;">Please use the following One-Time Password (OTP) to complete your request:</p>
                <div style="background-color: #eeeeee; color: #6a0dad; font-size: 32px; font-weight: bold; letter-spacing: 5px; padding: 15px 30px; margin: 30px auto; display: inline-block; border-radius: 6px; border: 1px dashed #cccccc;">
                    ${otp}
                </div>
                <p style="font-size: 14px; color: #666666;">This OTP is valid for the next <strong>${otpExpiryMinutes} minutes</strong>.</p>
            </div>
        `;

        await sendEmail(email, subject, htmlContent);
        return true;
    } catch (error) {
        console.error('Failed to route OTP email:', error);
        return false;
    }
};
