/**
 * Email HTML Templates
 */

/**
 * Email Verification Template
 */
const getVerificationEmailTemplate = (name, verificationUrl) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          margin: 0;
          padding: 0;
          background-color: #f4f4f4;
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          padding: 20px; 
          background-color: #ffffff;
        }
        .header {
          background-color: #2563eb;
          color: white;
          padding: 20px;
          text-align: center;
          border-radius: 5px 5px 0 0;
        }
        .content {
          padding: 30px 20px;
        }
        .button { 
          display: inline-block; 
          padding: 12px 24px; 
          background-color: #2563eb; 
          color: white; 
          text-decoration: none; 
          border-radius: 5px; 
          margin: 20px 0;
          font-weight: bold;
        }
        .button:hover {
          background-color: #1d4ed8;
        }
        .footer { 
          margin-top: 30px; 
          font-size: 12px; 
          color: #666;
          text-align: center;
          padding-top: 20px;
          border-top: 1px solid #eee;
        }
        .link-text {
          word-break: break-all;
          color: #2563eb;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Welcome to Stock Management System!</h2>
        </div>
        <div class="content">
          <p>Hi ${name},</p>
          <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
          <div style="text-align: center;">
            <a href="${verificationUrl}" class="button">Verify Email</a>
          </div>
          <p>Or copy and paste this link into your browser:</p>
          <p class="link-text">${verificationUrl}</p>
          <p><strong>Note:</strong> This link will expire in 24 hours.</p>
        </div>
        <div class="footer">
          <p>If you didn't create an account, please ignore this email.</p>
          <p>&copy; ${new Date().getFullYear()} Stock Management System. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Password Reset Template
 */
const getPasswordResetEmailTemplate = (name, resetUrl) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          margin: 0;
          padding: 0;
          background-color: #f4f4f4;
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          padding: 20px; 
          background-color: #ffffff;
        }
        .header {
          background-color: #dc2626;
          color: white;
          padding: 20px;
          text-align: center;
          border-radius: 5px 5px 0 0;
        }
        .content {
          padding: 30px 20px;
        }
        .button { 
          display: inline-block; 
          padding: 12px 24px; 
          background-color: #dc2626; 
          color: white; 
          text-decoration: none; 
          border-radius: 5px; 
          margin: 20px 0;
          font-weight: bold;
        }
        .button:hover {
          background-color: #b91c1c;
        }
        .footer { 
          margin-top: 30px; 
          font-size: 12px; 
          color: #666;
          text-align: center;
          padding-top: 20px;
          border-top: 1px solid #eee;
        }
        .warning { 
          background-color: #fef3c7; 
          padding: 15px; 
          border-left: 4px solid #f59e0b; 
          margin: 20px 0;
          border-radius: 4px;
        }
        .link-text {
          word-break: break-all;
          color: #dc2626;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Password Reset Request</h2>
        </div>
        <div class="content">
          <p>Hi ${name},</p>
          <p>We received a request to reset your password. Click the button below to reset it:</p>
          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset Password</a>
          </div>
          <p>Or copy and paste this link into your browser:</p>
          <p class="link-text">${resetUrl}</p>
          <div class="warning">
            <p><strong>Important:</strong> This link will expire in 1 hour. If you didn't request a password reset, please ignore this email and your password will remain unchanged.</p>
          </div>
        </div>
        <div class="footer">
          <p>For security reasons, never share this link with anyone.</p>
          <p>&copy; ${new Date().getFullYear()} Stock Management System. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Welcome Email Template
 */
const getWelcomeEmailTemplate = (name) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome!</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          margin: 0;
          padding: 0;
          background-color: #f4f4f4;
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          padding: 20px; 
          background-color: #ffffff;
        }
        .header {
          background-color: #10b981;
          color: white;
          padding: 20px;
          text-align: center;
          border-radius: 5px 5px 0 0;
        }
        .content {
          padding: 30px 20px;
          text-align: center;
        }
        .footer { 
          margin-top: 30px; 
          font-size: 12px; 
          color: #666;
          text-align: center;
          padding-top: 20px;
          border-top: 1px solid #eee;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Email Verified Successfully!</h2>
        </div>
        <div class="content">
          <p>Hi ${name},</p>
          <p>Your email has been verified successfully. You can now access all features of the Stock Management System.</p>
          <p>Thank you for joining us!</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Stock Management System. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export {
  getVerificationEmailTemplate,
  getPasswordResetEmailTemplate,
  getWelcomeEmailTemplate,
};

