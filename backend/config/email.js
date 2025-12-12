import nodemailer from 'nodemailer';

// Create transporter
const createTransporter = () => {
  // Check if email credentials are configured
  if (!process.env.EMAIL_ID || !process.env.EMAIL_PASSWORD) {
    console.warn('Email credentials not configured. Email sending will be disabled.');
    return null;
  }

  try {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_ID,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  } catch (error) {
    console.error('Failed to create email transporter:', error);
    return null;
  }
};

// Send verification email
export const sendVerificationEmail = async (email, name, token) => {
  const transporter = createTransporter();

  if (!transporter) {
    console.warn('Email transporter not available. Skipping email send.');
    return Promise.resolve(); // Don't throw error, just skip
  }

  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${token}`;

  const mailOptions = {
    from: `"Voyar Eyewear" <${process.env.EMAIL_ID}>`,
    to: email,
    subject: 'Verify Your Email - Voyar Eyewear',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Voyar!</h1>
            </div>
            <div class="content">
              <h2>Hi ${name},</h2>
              <p>Thank you for signing up with Voyar Eyewear! We're excited to have you join our community.</p>
              <p>To complete your registration and start shopping for premium eyewear, please verify your email address by clicking the button below:</p>
              <center>
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
              </center>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #6b7280;">${verificationUrl}</p>
              <p><strong>Note:</strong> This verification link will expire in 24 hours.</p>
              <p>If you didn't create an account with Voyar, please ignore this email.</p>
              <p>Best regards,<br>The Voyar Team</p>
            </div>
            <div class="footer">
              <p>&copy; 2025 Voyar Eyewear. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${email}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send verification email');
  }
};

// Send password reset email
export const sendPasswordResetEmail = async (email, name, token) => {
  const transporter = createTransporter();

  if (!transporter) {
    console.warn('Email transporter not available. Skipping email send.');
    return Promise.resolve(); // Don't throw error, just skip
  }

  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;

  const mailOptions = {
    from: `"Voyar Eyewear" <${process.env.EMAIL_ID}>`,
    to: email,
    subject: 'Reset Your Password - Voyar Eyewear',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <h2>Hi ${name},</h2>
              <p>You recently requested to reset your password for your Voyar account. Click the button below to reset it:</p>
              <center>
                <a href="${resetUrl}" class="button">Reset Password</a>
              </center>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #6b7280;">${resetUrl}</p>
              <p><strong>Note:</strong> This password reset link will expire in 1 hour.</p>
              <p>If you didn't request a password reset, please ignore this email or contact us if you have concerns.</p>
              <p>Best regards,<br>The Voyar Team</p>
            </div>
            <div class="footer">
              <p>&copy; 2025 Voyar Eyewear. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${email}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send password reset email');
  }
};

// Send admin password reset email
export const sendAdminPasswordResetEmail = async (email, username, token) => {
  const transporter = createTransporter();

  if (!transporter) {
    console.warn('Email transporter not available. Skipping email send.');
    return Promise.resolve();
  }

  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/reset-password?token=${token}`;

  const mailOptions = {
    from: `"Voyar Admin" <${process.env.EMAIL_ID}>`,
    to: email,
    subject: 'Admin Password Reset Request - Voyar',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #7c3aed; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
            .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 5px; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Admin Password Reset</h1>
            </div>
            <div class="content">
              <h2>Hi ${username},</h2>
              <p>A password reset was requested for your Voyar admin account. Click the button below to reset your password:</p>
              <center>
                <a href="${resetUrl}" class="button">Reset Admin Password</a>
              </center>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #6b7280;">${resetUrl}</p>
              <div class="warning">
                <strong>⚠️ Security Notice:</strong> This link will expire in 1 hour. If you didn't request this password reset, please ignore this email and ensure your account is secure.
              </div>
              <p>Best regards,<br>The Voyar System</p>
            </div>
            <div class="footer">
              <p>&copy; 2025 Voyar Eyewear Admin Panel. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Admin password reset email sent to ${email}`);
  } catch (error) {
    console.error('Error sending admin email:', error);
    throw new Error('Failed to send admin password reset email');
  }
};
