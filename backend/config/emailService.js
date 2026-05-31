import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();
import { Resend } from "resend";

// Initialize Resend with your API Key
const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (to, subject, html) => {
  const msg = {
    // Resend expects 'to' to be an array of strings, or a single string
    to: [to], 
    // If you don't have a custom domain verified yet, use 'onboarding@resend.dev'
    from: process.env.FROM_EMAIL || 'onboarding@resend.dev', 
    subject,
    html,
  };

  try {
    // Resend's API returns an object containing { data, error } instead of throwing 
    // an error directly for API-level failures.
    const { data, error } = await resend.emails.send(msg);

    if (error) {
      console.error('Resend API Error details:', error);
      throw new Error(error.message);
    }

    return data; // Returns the delivery success metadata (like message ID)
  } catch (error) {
    console.error('Error sending email via Resend:', error.message);
    throw error;
  }
};

export const sendOtpEmail = async (otp,otpExpiryMinutes,email) => {
    const subject = "One Time Password for creating an account on Volatile."
    try {
        const htmlContent = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${subject}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; color: #333333; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
                    .email-container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05); overflow: hidden; border: 1px solid #e0e0e0; }
                    .header { background-color: #6a0dad; color: #ffffff; padding: 20px; text-align: center; }
                    .header h1 { margin: 0; font-size: 24px; }
                    .content { padding: 30px; text-align: center; }
                    .content p { margin-bottom: 20px; font-size: 16px; line-height: 1.6; }
                    .otp-box { background-color: #eeeeee; color: #6a0dad; font-size: 32px; font-weight: bold; letter-spacing: 5px; padding: 15px 30px; margin: 30px auto; border-radius: 6px; display: inline-block; border: 1px dashed #cccccc; }
                    .expiry-message { font-size: 14px; color: #666666; margin-top: 25px; margin-bottom: 30px; }
                    .footer { background-color: #f0f0f0; padding: 20px; text-align: center; font-size: 12px; color: #888888; border-top: 1px solid #e0e0e0; }
                    .footer p { margin: 5px 0; }
                    .footer a { color: #6a0dad; text-decoration: none; }
                </style>
            </head>
            <body>
                <div class="email-container">
                    <div class="header">
                        <h1>Volatile - A Chat App</h1> 
                    </div>
                    <div class="content">
                        <p>Hello there,</p>
                        <p>You have requested a One-Time Password (OTP) to proceed with your action. Please use the following OTP to complete your request:</p>

                        <div class="otp-box">
                            ${otp} </div>

                        <p class="expiry-message">This OTP is valid for the next **${otpExpiryMinutes} minutes**.</p>
                        <p>Please do not share this OTP with anyone. If you did not request this, please ignore this email.</p>
                    </div>
                    <div class="footer">
                        <p>&copy; ${new Date().getFullYear()}Volatile. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;
        // --- End of HTML Template String ---

        await sendEmail(email, subject, htmlContent);
        return true;
    } catch (error) {
        console.error('Failed to send OTP email:', error);
        return false;
    }
};
