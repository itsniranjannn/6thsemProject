// controllers/emailController.js - ENHANCED EMAIL SYSTEM
const nodemailer = require('nodemailer');

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'your-email@gmail.com',
      pass: process.env.EMAIL_PASS || 'your-app-password'
    }
  });
};

// Common email styles
const getCommonStyles = () => `
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .button { display: inline-block; padding: 12px 30px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .button:hover { background: #0056b3; }
    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
    .code { background: #f8f9fa; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 3px; border-radius: 8px; margin: 20px 0; }
    .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0; }
  </style>
`;

// Order confirmation email
const sendOrderConfirmationEmail = async (order) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'nexusstore@example.com',
      to: order.shipping_address?.email || order.user_email,
      subject: `🎉 Order Confirmed - #${order.id}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
                .product-item { display: flex; align-items: center; padding: 10px 0; border-bottom: 1px solid #eee; }
                .product-image { width: 60px; height: 60px; object-fit: cover; border-radius: 8px; margin-right: 15px; }
                .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎉 Order Confirmed!</h1>
                    <p>Thank you for shopping with Nexus Store</p>
                </div>
                <div class="content">
                    <h2>Hello ${order.shipping_address?.fullName || 'Customer'},</h2>
                    <p>Your order has been confirmed and is being processed. Here are your order details:</p>
                    
                    <div class="order-details">
                        <h3>Order Summary</h3>
                        <p><strong>Order ID:</strong> #${order.id}</p>
                        <p><strong>Order Date:</strong> ${new Date(order.created_at).toLocaleDateString()}</p>
                        <p><strong>Total Amount:</strong> Rs. ${order.total_amount?.toFixed(2)}</p>
                        <p><strong>Payment Method:</strong> ${order.payment_method?.toUpperCase()}</p>
                        <p><strong>Status:</strong> ${order.status}</p>
                        
                        <h4>Items Ordered:</h4>
                        ${order.items?.map(item => `
                            <div class="product-item">
                                <img src="${item.product_image || 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500'}" 
                                     alt="${item.product_name}" class="product-image">
                                <div>
                                    <strong>${item.product_name}</strong><br>
                                    Quantity: ${item.quantity} × Rs. ${item.price?.toFixed(2)}<br>
                                    Total: Rs. ${(item.quantity * item.price)?.toFixed(2)}
                                </div>
                            </div>
                        `).join('') || '<p>No items found</p>'}
                        
                        <h4>Shipping Address:</h4>
                        <p>
                            ${order.shipping_address?.fullName || ''}<br>
                            ${order.shipping_address?.address || ''}<br>
                            ${order.shipping_address?.city || ''}, ${order.shipping_address?.postalCode || ''}<br>
                            ${order.shipping_address?.country || 'Nepal'}<br>
                            Phone: ${order.shipping_address?.phone || 'N/A'}
                        </p>
                        
                        ${order.tracking_number ? `
                        <h4>Tracking Information:</h4>
                        <p><strong>Tracking Number:</strong> ${order.tracking_number}</p>
                        <p><strong>Estimated Delivery:</strong> ${new Date(order.estimated_delivery).toLocaleDateString()}</p>
                        ` : ''}
                    </div>
                    
                    <p>You can track your order anytime from your account dashboard.</p>
                    <p>If you have any questions, feel free to contact our support team.</p>
                    
                    <div class="footer">
                        <p>Thank you for choosing Nexus Store! 🛍️</p>
                        <p>Email: support@nexusstore.com | Phone: +977-1-4000000</p>
                        <p>© 2024 Nexus Store. All rights reserved.</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Order confirmation email sent for order #${order.id}`);
    return true;
  } catch (error) {
    console.error('❌ Order confirmation email error:', error);
    return false;
  }
};

// Payment failed email
const sendPaymentFailedEmail = async (order) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'nexusstore@example.com',
      to: order.shipping_address?.email || order.user_email,
      subject: `❌ Payment Failed - Order #${order.id}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
                .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>❌ Payment Failed</h1>
                    <p>There was an issue with your payment</p>
                </div>
                <div class="content">
                    <h2>Hello ${order.shipping_address?.fullName || 'Customer'},</h2>
                    <p>We encountered an issue while processing your payment for order <strong>#${order.id}</strong>.</p>
                    
                    <div class="order-details">
                        <h3>Order Details</h3>
                        <p><strong>Order ID:</strong> #${order.id}</p>
                        <p><strong>Order Date:</strong> ${new Date(order.created_at).toLocaleDateString()}</p>
                        <p><strong>Total Amount:</strong> Rs. ${order.total_amount?.toFixed(2)}</p>
                        <p><strong>Payment Method:</strong> ${order.payment_method?.toUpperCase()}</p>
                        <p><strong>Status:</strong> ${order.status}</p>
                    </div>
                    
                    <h3>What to do next?</h3>
                    <ul>
                        <li>Check if your payment method has sufficient funds</li>
                        <li>Verify your payment details are correct</li>
                        <li>Try placing the order again</li>
                        <li>Contact your bank if the issue persists</li>
                    </ul>
                    
                    <p>If you need any assistance, our support team is here to help.</p>
                    
                    <div class="footer">
                        <p>Need help? Contact us at support@nexusstore.com</p>
                        <p>© 2024 Nexus Store. All rights reserved.</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Payment failed email sent for order #${order.id}`);
    return true;
  } catch (error) {
    console.error('❌ Payment failed email error:', error);
    return false;
  }
};

// Order shipped email
const sendOrderShippedEmail = async (order) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'nexusstore@example.com',
      to: order.shipping_address?.email || order.user_email,
      subject: `🚚 Your Order Has Been Shipped - #${order.id}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .tracking-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
                .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🚚 Order Shipped!</h1>
                    <p>Your order is on the way</p>
                </div>
                <div class="content">
                    <h2>Hello ${order.shipping_address?.fullName || 'Customer'},</h2>
                    <p>Great news! Your order <strong>#${order.id}</strong> has been shipped and is on its way to you.</p>
                    
                    <div class="tracking-info">
                        <h3>📦 Tracking Information</h3>
                        <p><strong>Tracking Number:</strong> ${order.tracking_number}</p>
                        <p><strong>Estimated Delivery:</strong> ${new Date(order.estimated_delivery).toLocaleDateString()}</p>
                        <p><strong>Shipping Address:</strong> ${order.shipping_address?.address}, ${order.shipping_address?.city}</p>
                    </div>
                    
                    <p>You can track your package using the tracking number above on our website.</p>
                    <p>We'll notify you when your package is out for delivery.</p>
                    
                    <div class="footer">
                        <p>Thank you for shopping with Nexus Store! 🛍️</p>
                        <p>Email: support@nexusstore.com | Phone: +977-1-4000000</p>
                        <p>© 2024 Nexus Store. All rights reserved.</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Order shipped email sent for order #${order.id}`);
    return true;
  } catch (error) {
    console.error('❌ Order shipped email error:', error);
    return false;
  }
};

// Email verification email
const sendEmailVerificationEmail = async (user, verificationToken) => {
  try {
    const transporter = createTransporter();
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'nexusstore@example.com',
      to: user.email,
      subject: '🔐 Verify Your Email - Nexus Store',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          ${getCommonStyles()}
          <style>
            .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Verify Your Email</h1>
              <p>Welcome to Nexus Store!</p>
            </div>
            <div class="content">
              <h2>Hello ${user.name},</h2>
              <p>Thank you for registering with Nexus Store! To complete your registration and start shopping, please verify your email address.</p>
              
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
              </div>
              
              <div class="warning">
                <strong>⚠️ Important:</strong> This verification link will expire in 24 hours. If you don't verify your email, you won't be able to place orders.
              </div>
              
              <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
              
              <p>If you didn't create an account with us, please ignore this email.</p>
              
              <div class="footer">
                <p>Welcome to Nexus Store! 🛍️</p>
                <p>Email: support@nexusstore.com | Phone: +977-1-4000000</p>
                <p>© 2024 Nexus Store. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email verification sent to ${user.email}`);
    return true;
  } catch (error) {
    console.error('❌ Email verification error:', error);
    return false;
  }
};

// Password reset email
const sendPasswordResetEmail = async (user, resetToken) => {
  try {
    const transporter = createTransporter();
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'nexusstore@example.com',
      to: user.email,
      subject: '🔑 Reset Your Password - Nexus Store',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          ${getCommonStyles()}
          <style>
            .header { background: linear-gradient(135deg, #dc3545 0%, #fd7e14 100%); }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔑 Reset Your Password</h1>
              <p>Secure your account</p>
            </div>
            <div class="content">
              <h2>Hello ${user.name},</h2>
              <p>We received a request to reset your password for your Nexus Store account. If you made this request, click the button below to reset your password.</p>
              
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>
              
              <div class="warning">
                <strong>⚠️ Security Notice:</strong> This password reset link will expire in 1 hour for your security. If you didn't request this reset, please ignore this email.
              </div>
              
              <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #666;">${resetUrl}</p>
              
              <p>For security reasons, this link can only be used once. If you need to reset your password again, please request a new reset.</p>
              
              <div class="footer">
                <p>Keep your account secure! 🔒</p>
                <p>Email: support@nexusstore.com | Phone: +977-1-4000000</p>
                <p>© 2024 Nexus Store. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Password reset email sent to ${user.email}`);
    return true;
  } catch (error) {
    console.error('❌ Password reset email error:', error);
    return false;
  }
};

// Password changed confirmation email
const sendPasswordChangedEmail = async (user) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'nexusstore@example.com',
      to: user.email,
      subject: '✅ Password Changed Successfully - Nexus Store',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          ${getCommonStyles()}
          <style>
            .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Password Changed</h1>
              <p>Your account is secure</p>
            </div>
            <div class="content">
              <h2>Hello ${user.name},</h2>
              <p>Your password has been successfully changed for your Nexus Store account.</p>
              
              <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <strong>✅ Confirmed:</strong> Your password was changed on ${new Date().toLocaleString()}
              </div>
              
              <p>If you made this change, no further action is needed. Your account is secure.</p>
              
              <div class="warning">
                <strong>⚠️ Security Alert:</strong> If you didn't make this change, please contact our support team immediately and change your password again.
              </div>
              
              <div class="footer">
                <p>Your account security is our priority! 🔒</p>
                <p>Email: support@nexusstore.com | Phone: +977-1-4000000</p>
                <p>© 2024 Nexus Store. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Password changed confirmation sent to ${user.email}`);
    return true;
  } catch (error) {
    console.error('❌ Password changed email error:', error);
    return false;
  }
};

// Welcome email after successful verification
const sendWelcomeEmail = async (user) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'nexusstore@example.com',
      to: user.email,
      subject: '🎉 Welcome to Nexus Store!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          ${getCommonStyles()}
          <style>
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
            .feature { background: white; padding: 20px; border-radius: 8px; margin: 10px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to Nexus Store!</h1>
              <p>Your account is now verified and ready to use</p>
            </div>
            <div class="content">
              <h2>Hello ${user.name},</h2>
              <p>Congratulations! Your email has been verified and your Nexus Store account is now fully active.</p>
              
              <h3>What you can do now:</h3>
              <div class="feature">
                <strong>🛍️ Shop Products:</strong> Browse our wide selection of electronics, gadgets, and more
              </div>
              <div class="feature">
                <strong>💳 Secure Payments:</strong> Pay with Stripe, Khalti, eSewa, or Cash on Delivery
              </div>
              <div class="feature">
                <strong>📦 Fast Delivery:</strong> Get your orders delivered quickly and safely
              </div>
              <div class="feature">
                <strong>🎁 Special Offers:</strong> Enjoy exclusive deals and promotions
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/products" class="button">Start Shopping Now</a>
              </div>
              
              <p>Thank you for choosing Nexus Store! We're excited to have you as a customer.</p>
              
              <div class="footer">
                <p>Happy Shopping! 🛍️</p>
                <p>Email: support@nexusstore.com | Phone: +977-1-4000000</p>
                <p>© 2024 Nexus Store. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Welcome email sent to ${user.email}`);
    return true;
  } catch (error) {
    console.error('❌ Welcome email error:', error);
    return false;
  }
};

module.exports = {
  sendOrderConfirmationEmail,
  sendPaymentFailedEmail,
  sendOrderShippedEmail,
  sendEmailVerificationEmail,
  sendPasswordResetEmail,
  sendPasswordChangedEmail,
  sendWelcomeEmail
};