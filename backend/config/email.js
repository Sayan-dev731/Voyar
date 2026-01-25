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

// Send bill/invoice email
export const sendBillEmail = async (customerEmail, customerName, order) => {
  const transporter = createTransporter();

  if (!transporter) {
    console.warn('Email transporter not available. Skipping email send.');
    return Promise.resolve();
  }

  // Calculate totals
  const subtotal = order.totalAmount;
  const tax = subtotal * 0.18; // 18% GST
  const total = subtotal;

  const mailOptions = {
    from: `"Voyar Eyewear" <${process.env.EMAIL_ID}>`,
    to: customerEmail,
    subject: `Invoice for Order #${order._id.toString().slice(-8)} - Voyar Eyewear`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 800px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .invoice-details { background: #f9fafb; padding: 20px; border-radius: 0 0 10px 10px; }
            .bill-to { background: #fff; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb; }
            .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .items-table th { background: #f59e0b; color: white; padding: 12px; text-align: left; }
            .items-table td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
            .total-section { background: #fff; padding: 15px; border-radius: 8px; margin: 20px 0; border: 2px solid #f59e0b; }
            .total-row { display: flex; justify-content: space-between; margin: 8px 0; }
            .grand-total { font-size: 1.5em; font-weight: bold; color: #f59e0b; border-top: 2px solid #f59e0b; padding-top: 10px; margin-top: 10px; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; padding: 20px; border-top: 1px solid #e5e7eb; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>INVOICE</h1>
              <p style="margin: 10px 0;">Voyar Eyewear</p>
            </div>
            <div class="invoice-details">
              <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
                <div>
                  <p><strong>Invoice Number:</strong> INV-${order._id.toString().slice(-8)}</p>
                  <p><strong>Order ID:</strong> ${order._id}</p>
                  <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
                <div style="text-align: right;">
                  <p><strong>Payment Status:</strong> <span style="color: ${order.paymentStatus === 'paid' ? '#10b981' : '#f59e0b'};">${order.paymentStatus.toUpperCase()}</span></p>
                  <p><strong>Order Status:</strong> ${order.status.toUpperCase()}</p>
                </div>
              </div>

              <div class="bill-to">
                <h3 style="margin-top: 0; color: #f59e0b;">Bill To:</h3>
                <p><strong>${customerName}</strong></p>
                <p>${customerEmail}</p>
                ${order.shippingAddress ? `
                  <p>${order.shippingAddress.street}</p>
                  <p>${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.zipCode}</p>
                  <p>${order.shippingAddress.country}</p>
                  ${order.shippingAddress.phone ? `<p>Phone: ${order.shippingAddress.phone}</p>` : ''}
                ` : ''}
              </div>

              <table class="items-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${order.items.map(item => `
                    <tr>
                      <td>
                        <strong>${item.productName}</strong>
                        ${item.selectedColor ? `<br><small>Color: ${item.selectedColor}</small>` : ''}
                      </td>
                      <td>${item.quantity}</td>
                      <td>₹${item.price.toFixed(2)}</td>
                      <td>₹${(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>

              <div class="total-section">
                <div class="total-row">
                  <span>Subtotal:</span>
                  <span>₹${subtotal.toFixed(2)}</span>
                </div>
                <div class="total-row grand-total">
                  <span>GRAND TOTAL:</span>
                  <span>₹${total.toFixed(2)}</span>
                </div>
              </div>

              <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                <p style="margin: 0;"><strong>Payment Method:</strong> ${order.paymentMethod || 'N/A'}</p>
                ${order.paymentId ? `<p style="margin: 5px 0 0 0;"><strong>Transaction ID:</strong> ${order.paymentId}</p>` : ''}
              </div>

              <div style="margin: 20px 0; padding: 15px; background: #f0fdf4; border-radius: 8px; border-left: 4px solid #10b981;">
                <p style="margin: 0;"><strong>Thank you for your purchase!</strong></p>
                <p style="margin: 5px 0 0 0;">If you have any questions about this invoice, please contact us at support@voyar.com</p>
              </div>
            </div>
            <div class="footer">
              <p><strong>Voyar Eyewear</strong></p>
              <p>Premium Eyewear Collection</p>
              <p>&copy; 2025 Voyar Eyewear. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Bill email sent to ${customerEmail}`);
  } catch (error) {
    console.error('Error sending bill email:', error);
    throw new Error('Failed to send bill email');
  }
};

// Email template base
const getEmailTemplate = (title, headerColor, content) => `
  <!DOCTYPE html>
  <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: ${headerColor}; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .order-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb; }
        .status-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: bold; margin: 10px 0; }
        .button { display: inline-block; background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; padding: 20px; border-top: 1px solid #e5e7eb; }
        .item-row { display: flex; align-items: center; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
        .item-image { width: 60px; height: 60px; object-fit: cover; border-radius: 8px; margin-right: 15px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${title}</h1>
          <p style="margin: 10px 0;">Voyar Eyewear</p>
        </div>
        <div class="content">
          ${content}
        </div>
        <div class="footer">
          <p><strong>Voyar Eyewear</strong></p>
          <p>Premium Eyewear Collection</p>
          <p>&copy; ${new Date().getFullYear()} Voyar Eyewear. All rights reserved.</p>
        </div>
      </div>
    </body>
  </html>
`;

// Send order received/confirmation email
export const sendOrderReceivedEmail = async (customerEmail, customerName, order) => {
  const transporter = createTransporter();

  if (!transporter) {
    console.warn('Email transporter not available. Skipping email send.');
    return Promise.resolve();
  }

  const itemsHtml = order.items.map(item => `
    <div style="display: flex; align-items: center; padding: 15px 0; border-bottom: 1px solid #e5e7eb;">
      <div style="flex: 1;">
        <strong>${item.productName}</strong>
        ${item.selectedColor ? `<br><small style="color: #6b7280;">Color: ${item.selectedColor}</small>` : ''}
        <br><small>Qty: ${item.quantity} × ₹${item.price.toFixed(2)}</small>
      </div>
      <div style="font-weight: bold; color: #f59e0b;">₹${(item.price * item.quantity).toFixed(2)}</div>
    </div>
  `).join('');

  const content = `
    <h2>Hi ${customerName},</h2>
    <p>Thank you for your order! We've received your order and it's being processed.</p>
    
    <div style="background: #d1fae5; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
      <span style="color: #059669; font-size: 18px; font-weight: bold;">✓ Order Received</span>
    </div>

    <div class="order-box">
      <p><strong>Order ID:</strong> ${order._id}</p>
      <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      <p><strong>Payment Status:</strong> <span style="color: #10b981; font-weight: bold;">${order.paymentStatus.toUpperCase()}</span></p>
    </div>

    <div class="order-box">
      <h3 style="margin-top: 0; color: #f59e0b;">Order Items</h3>
      ${itemsHtml}
      <div style="margin-top: 15px; padding-top: 15px; border-top: 2px solid #f59e0b;">
        <div style="display: flex; justify-content: space-between; font-size: 1.2em; font-weight: bold;">
          <span>Total:</span>
          <span style="color: #f59e0b;">₹${order.totalAmount.toFixed(2)}</span>
        </div>
      </div>
    </div>

    ${order.shippingAddress ? `
      <div class="order-box">
        <h3 style="margin-top: 0; color: #f59e0b;">Shipping Address</h3>
        <p><strong>${order.shippingAddress.name}</strong></p>
        <p>${order.shippingAddress.street}</p>
        <p>${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.zipCode}</p>
        <p>${order.shippingAddress.country}</p>
        ${order.shippingAddress.phone ? `<p>Phone: ${order.shippingAddress.phone}</p>` : ''}
      </div>
    ` : ''}

    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.FRONTEND_URL}/orders" class="button">View Your Orders</a>
    </div>

    <p style="color: #6b7280; font-size: 14px;">
      We'll send you another email when your order status is updated. If you have any questions, please contact us at support@voyar.com
    </p>
  `;

  const mailOptions = {
    from: `"Voyar Eyewear" <${process.env.EMAIL_ID}>`,
    to: customerEmail,
    subject: `Order Confirmed! Order #${order._id.toString().slice(-8)} - Voyar Eyewear`,
    html: getEmailTemplate('Order Confirmed! 🎉', 'linear-gradient(135deg, #10b981 0%, #059669 100%)', content),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Order confirmation email sent to ${customerEmail}`);
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    throw new Error('Failed to send order confirmation email');
  }
};

// Send order status update email
export const sendOrderStatusEmail = async (customerEmail, customerName, order, newStatus) => {
  const transporter = createTransporter();

  if (!transporter) {
    console.warn('Email transporter not available. Skipping email send.');
    return Promise.resolve();
  }

  const statusConfig = {
    confirmed: {
      title: 'Order Confirmed! ✓',
      color: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      message: 'Your order has been confirmed and is being prepared.',
      icon: '✓'
    },
    processing: {
      title: 'Order is Being Processed 📦',
      color: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      message: 'Great news! Your order is now being processed and prepared for shipping.',
      icon: '📦'
    },
    shipped: {
      title: 'Order Shipped! 🚚',
      color: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      message: 'Your order is on its way! It has been handed over to our delivery partner.',
      icon: '🚚'
    },
    delivered: {
      title: 'Order Delivered! 🎉',
      color: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      message: 'Your order has been delivered successfully. We hope you love your new eyewear!',
      icon: '🎉'
    },
    cancelled: {
      title: 'Order Cancelled ❌',
      color: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      message: 'Your order has been cancelled. If you have any questions, please contact our support team.',
      icon: '❌'
    }
  };

  const config = statusConfig[newStatus] || {
    title: `Order Update: ${newStatus}`,
    color: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    message: `Your order status has been updated to: ${newStatus}`,
    icon: '📋'
  };

  const itemsHtml = order.items.map(item => `
    <div style="display: flex; align-items: center; padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
      <div style="flex: 1;">
        <strong>${item.productName}</strong>
        ${item.selectedColor ? `<br><small style="color: #6b7280;">Color: ${item.selectedColor}</small>` : ''}
      </div>
      <div>Qty: ${item.quantity}</div>
    </div>
  `).join('');

  const content = `
    <h2>Hi ${customerName},</h2>
    <p>${config.message}</p>
    
    <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
      <span style="font-size: 40px;">${config.icon}</span>
      <h3 style="margin: 10px 0; color: #1e40af;">${newStatus.toUpperCase()}</h3>
    </div>

    <div class="order-box">
      <p><strong>Order ID:</strong> ${order._id}</p>
      <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      <p><strong>Total Amount:</strong> <span style="color: #f59e0b; font-weight: bold;">₹${order.totalAmount.toFixed(2)}</span></p>
    </div>

    <div class="order-box">
      <h3 style="margin-top: 0; color: #f59e0b;">Order Items</h3>
      ${itemsHtml}
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.FRONTEND_URL}/orders" class="button">Track Your Order</a>
    </div>

    ${newStatus === 'delivered' ? `
      <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
        <p style="margin: 0;"><strong>We'd love to hear from you!</strong></p>
        <p style="margin: 10px 0 0 0;">Please take a moment to review your purchase. Your feedback helps us serve you better!</p>
      </div>
    ` : ''}

    <p style="color: #6b7280; font-size: 14px;">
      If you have any questions, please contact us at support@voyar.com
    </p>
  `;

  const mailOptions = {
    from: `"Voyar Eyewear" <${process.env.EMAIL_ID}>`,
    to: customerEmail,
    subject: `${config.title} - Order #${order._id.toString().slice(-8)}`,
    html: getEmailTemplate(config.title, config.color, content),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Order status email (${newStatus}) sent to ${customerEmail}`);
  } catch (error) {
    console.error('Error sending order status email:', error);
    throw new Error('Failed to send order status email');
  }
};

// Send payment failure email
export const sendPaymentFailureEmail = async (customerEmail, customerName, order) => {
  const transporter = createTransporter();

  if (!transporter) {
    console.warn('Email transporter not available. Skipping email send.');
    return Promise.resolve();
  }

  const content = `
    <h2>Hi ${customerName},</h2>
    <p>We noticed that your recent payment attempt was unsuccessful. Don't worry, your cart items are still saved!</p>
    
    <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; border-left: 4px solid #ef4444;">
      <span style="font-size: 40px;">❌</span>
      <h3 style="margin: 10px 0; color: #dc2626;">Payment Failed</h3>
    </div>

    <div class="order-box">
      <p><strong>Order ID:</strong> ${order._id}</p>
      <p><strong>Amount:</strong> ₹${order.totalAmount.toFixed(2)}</p>
    </div>

    <p>Possible reasons for payment failure:</p>
    <ul>
      <li>Insufficient funds in your account</li>
      <li>Card details entered incorrectly</li>
      <li>Transaction declined by your bank</li>
      <li>Network connectivity issues</li>
    </ul>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.FRONTEND_URL}/cart" class="button">Try Again</a>
    </div>

    <p style="color: #6b7280; font-size: 14px;">
      If you continue to face issues, please contact your bank or reach out to our support team at support@voyar.com
    </p>
  `;

  const mailOptions = {
    from: `"Voyar Eyewear" <${process.env.EMAIL_ID}>`,
    to: customerEmail,
    subject: `Payment Failed - Voyar Eyewear`,
    html: getEmailTemplate('Payment Failed', 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', content),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Payment failure email sent to ${customerEmail}`);
  } catch (error) {
    console.error('Error sending payment failure email:', error);
    throw new Error('Failed to send payment failure email');
  }
};

// Send 2FA OTP email
export const send2FAOTPEmail = async (email, name, otp) => {
  const transporter = createTransporter();

  if (!transporter) {
    console.warn('Email transporter not available. Skipping email send.');
    throw new Error('Email service not configured');
  }

  const content = `
    <h2>Hi ${name},</h2>
    <p>You are attempting to log in to your Voyar account. To complete the login process, please use the One-Time Password (OTP) below:</p>
    
    <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px; margin: 30px 0; font-size: 32px; font-weight: bold; letter-spacing: 8px;">
      ${otp}
    </div>

    <p><strong>This OTP will expire in 10 minutes.</strong></p>

    <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 5px;">
      <p style="margin: 0; color: #92400e;">
        <strong>Security Notice:</strong> Never share this OTP with anyone. Voyar support will never ask for your OTP.
      </p>
    </div>

    <p>If you didn't attempt to log in, please secure your account immediately by changing your password.</p>
    
    <p>Best regards,<br>The Voyar Team</p>
  `;

  const mailOptions = {
    from: `"Voyar Eyewear" <${process.env.EMAIL_ID}>`,
    to: email,
    subject: 'Your 2FA Login Code - Voyar Eyewear',
    html: getEmailTemplate('Two-Factor Authentication', 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', content),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`2FA OTP email sent to ${email}`);
  } catch (error) {
    console.error('Error sending 2FA OTP email:', error);
    throw new Error('Failed to send 2FA OTP email');
  }
};

