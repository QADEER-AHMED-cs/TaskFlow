import nodemailer from 'nodemailer';

// Gmail SMTP transporter
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error('❌ EMAIL_USER and EMAIL_PASS environment variables are required for email functionality');
  console.error('Please set them using:');
  console.error('$env:EMAIL_USER = "your-gmail@gmail.com"');
  console.error('$env:EMAIL_PASS = "your-gmail-app-password"');
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail address
    pass: process.env.EMAIL_PASS, // Gmail App Password (not regular password)
  },
});

export async function sendOTP(email: string, otp: string) {
  try {
    const mailOptions = {
      from: `"TaskFlow" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your OTP for TaskFlow - Email Verification',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h1 style="color: #333; text-align: center; margin-bottom: 30px;">Welcome to TaskFlow!</h1>
            <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              Thank you for signing up for TaskFlow. To complete your registration, please use the following One-Time Password (OTP):
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <div style="display: inline-block; background-color: #6366f1; color: white; padding: 15px 30px; border-radius: 8px; font-size: 24px; font-weight: bold; letter-spacing: 3px;">
                ${otp}
              </div>
            </div>
            <p style="color: #666; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
              This OTP will expire in 10 minutes. Please do not share this code with anyone.
            </p>
            <p style="color: #666; font-size: 14px; line-height: 1.6;">
              If you didn't request this OTP, please ignore this email.
            </p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #999; font-size: 12px; text-align: center;">
              TaskFlow - Smart Task Productivity Manager
            </p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ OTP Email sent successfully to:', email);
    console.log('📧 Message ID:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Failed to send OTP email:', error);
    throw new Error('Failed to send OTP email. Please check your email configuration.');
  }
}