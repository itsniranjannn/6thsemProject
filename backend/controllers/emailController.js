const nodemailer = require('nodemailer');

// Enhanced email transporter with better configuration
const createTransporter = () => {
  try {
    console.log('📧 Creating email transporter...');
    console.log('📧 Email User:', process.env.EMAIL_USER);
    console.log('📧 Email From:', process.env.EMAIL_FROM);
    console.log('📧 Environment:', process.env.NODE_ENV);
    
    return nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  } catch (error) {
    console.error('❌ Error creating email transporter:', error);
    throw error;
  }
};

// Test email configuration
const testEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ Email transporter verified successfully');
    return true;
  } catch (error) {
    console.error('❌ Email transporter verification failed:', error);
    console.error('❌ Error details:', {
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode
    });
    return false;
  }
};

// Common email styles
const getCommonStyles = () => `
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f5f5f5; }
    .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
    .header { color: white; padding: 40px 30px; text-align: center; }
    .content { padding: 40px 30px; }
    .button { display: inline-block; padding: 14px 35px; background: #007bff; color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: 600; font-size: 16px; }
    .button:hover { background: #0056b3; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3); }
    .footer { text-align: center; margin-top: 40px; padding-top: 30px; border-top: 1px solid #eee; color: #666; font-size: 14px; }
    .order-details { background: #f8f9fa; padding: 25px; border-radius: 10px; margin: 25px 0; }
    .order-item { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #eee; }
    .order-total { font-size: 18px; font-weight: bold; color: #28a745; margin-top: 15px; }
    .status-badge { display: inline-block; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: bold; margin-left: 10px; }
    .status-pending { background: #fff3cd; color: #856404; }
    .status-confirmed { background: #d1ecf1; color: #0c5460; }
    .status-shipped { background: #d4edda; color: #155724; }
    .status-delivered { background: #28a745; color: white; }
    .status-cancelled { background: #f8d7da; color: #721c24; }
    .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 10px; margin: 25px 0; }
    .success { background: #d4edda; border: 1px solid #c3e6cb; padding: 20px; border-radius: 10px; margin: 25px 0; }
    .error { background: #f8d7da; border: 1px solid #f5c6cb; padding: 20px; border-radius: 10px; margin: 25px 0; }
    .verification-code { 
      font-size: 42px; 
      font-weight: bold; 
      text-align: center; 
      letter-spacing: 8px; 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      padding: 20px;
      margin: 20px 0;
      border: 2px dashed #667eea;
      border-radius: 12px;
    }
  </style>
`;

// Enhanced email sending with better error handling
const sendEmail = async (mailOptions) => {
  try {
    console.log('\n📧 ===== ATTEMPTING TO SEND EMAIL =====');
    console.log('📧 To:', mailOptions.to);
    console.log('📧 Subject:', mailOptions.subject);
    console.log('📧 Environment:', process.env.NODE_ENV);

    const transporter = createTransporter();
    
    // Test email configuration first
    console.log('📧 Testing email configuration...');
    const configTest = await testEmailConfig();
    if (!configTest) {
      throw new Error('Email configuration test failed');
    }

    // For development, log the email instead of actually sending
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 DEVELOPMENT MODE - Email would be sent:');
      console.log('📧 To:', mailOptions.to);
      console.log('📧 Subject:', mailOptions.subject);
      console.log('📧 Content Preview:', mailOptions.html?.substring(0, 200) + '...');
      
      return { 
        success: true, 
        message: 'Development mode - email logged to console',
        development: true
      };
    }

    console.log('🚀 PRODUCTION MODE - SENDING ACTUAL EMAIL...');
    console.log('📧 Using email:', process.env.EMAIL_USER);
    
    const result = await transporter.sendMail(mailOptions);
    
    console.log('✅ EMAIL SENT SUCCESSFULLY!');
    console.log('📧 Message ID:', result.messageId);
    console.log('📧 Response:', result.response);
    console.log('📧 ===== EMAIL SEND COMPLETE =====\n');
    
    return { 
      success: true, 
      messageId: result.messageId,
      response: result.response 
    };
  } catch (error) {
    console.error('\n❌ ===== EMAIL SEND FAILED =====');
    console.error('❌ Error:', error.message);
    console.error('❌ Error details:', {
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode
    });
    console.error('❌ Stack:', error.stack);
    console.error('❌ ===== EMAIL ERROR COMPLETE =====\n');
    
    return { 
      success: false, 
      error: error.message,
      stack: error.stack,
      details: {
        code: error.code,
        command: error.command,
        response: error.response,
        responseCode: error.responseCode
      }
    };
  }
};

// 1. Email Verification with 6-digit Code
const sendEmailVerification = async (user, verificationCode) => {
  try {
    const mailOptions = {
      from: `"Nexus Store" <${process.env.EMAIL_FROM}>`,
      to: user.email,
      subject: '🔐 Verify Your Email - Nexus Store',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          ${getCommonStyles()}
          <style>.header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }</style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 28px;">🔐 Verify Your Email</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Welcome to Nexus Store!</p>
            </div>
            <div class="content">
              <h2 style="color: #333; margin-bottom: 20px;">Hello ${user.name},</h2>
              <p>Thank you for registering with Nexus Store! To complete your registration and start shopping, please verify your email address using the 6-digit code below:</p>
              
              <div class="verification-code">
                ${verificationCode}
              </div>
              
              <div class="warning">
                <strong>⚠️ Important:</strong> 
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li>This verification code will expire in 10 minutes</li>
                  <li>Enter this code on the verification screen to complete your registration</li>
                  <li>If you didn't request this code, please ignore this email</li>
                </ul>
              </div>
              
              <div class="footer">
                <p>Welcome to Nexus Store! 🛍️</p>
                <p>© 2024 Nexus Store. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };

    return await sendEmail(mailOptions);
  } catch (error) {
    console.error('❌ Email verification error:', error);
    return { success: false, error: error.message };
  }
};

// 2. Password Reset with 6-digit Code
const sendPasswordReset = async (user, resetCode) => {
  try {
    const mailOptions = {
      from: `"Nexus Store" <${process.env.EMAIL_FROM}>`,
      to: user.email,
      subject: '🔑 Reset Your Password - Nexus Store',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          ${getCommonStyles()}
          <style>.header { background: linear-gradient(135deg, #fd7e14 0%, #f76707 100%); }</style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 28px;">🔑 Reset Your Password</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Secure your account</p>
            </div>
            <div class="content">
              <h2 style="color: #333; margin-bottom: 20px;">Hello ${user.name},</h2>
              <p>We received a request to reset your password. Use the 6-digit code below to create a new password:</p>
              
              <div class="verification-code">
                ${resetCode}
              </div>
              
              <div class="warning">
                <strong>⚠️ Security Notice:</strong> 
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li>This reset code will expire in 10 minutes</li>
                  <li>Enter this code on the password reset screen</li>
                  <li>If you didn't request a password reset, please ignore this email</li>
                </ul>
              </div>
              
              <div class="footer">
                <p>Keep your account secure! 🔒</p>
                <p>© 2024 Nexus Store. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };

    return await sendEmail(mailOptions);
  } catch (error) {
    console.error('❌ Password reset email error:', error);
    return { success: false, error: error.message };
  }
};

// 3. Order Confirmation Email
const sendOrderConfirmation = async (order, user, orderItems = []) => {
  try {
    const orderDate = new Date(order.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const mailOptions = {
      from: `"Nexus Store" <${process.env.EMAIL_FROM}>`,
      to: user.email,
      subject: `🎉 Order Confirmed - #${order.id}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          ${getCommonStyles()}
          <style>.header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); }</style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 28px;">🎉 Order Confirmed!</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Thank you for your purchase, ${user.name}!</p>
            </div>
            <div class="content">
              <h2 style="color: #333; margin-bottom: 20px;">Hello ${user.name},</h2>
              <p>Your order has been successfully placed and is being processed. Here are your order details:</p>
              
              <div class="order-details">
                <h3 style="margin-top: 0; color: #495057;">Order #${order.id}</h3>
                <p><strong>Order Date:</strong> ${orderDate}</p>
                <p><strong>Status:</strong> ${order.status} <span class="status-badge status-${order.status}">${order.status}</span></p>
                <p><strong>Payment Method:</strong> ${order.payment_method}</p>
                <p><strong>Payment Status:</strong> ${order.payment_status}</p>
                
                ${orderItems.length > 0 ? `
                  <h4 style="margin: 20px 0 10px 0; color: #495057;">Order Items:</h4>
                  ${orderItems.map(item => `
                    <div class="order-item">
                      <span>${item.name || 'Product'} x ${item.quantity}</span>
                      <span>Rs. ${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  `).join('')}
                ` : ''}
                
                <div style="text-align: right; margin-top: 20px;">
                  <p><strong>Subtotal:</strong> Rs. ${order.subtotal || order.total_amount}</p>
                  <p><strong>Shipping:</strong> Rs. ${order.shipping_fee || 0}</p>
                  <p class="order-total">Total: Rs. ${order.total_amount}</p>
                </div>
              </div>
              
              <div class="success">
                <strong>✅ Order Processing:</strong> Your order is being prepared for shipment. You'll receive another email when your order ships.
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL}/orders" class="button" style="background: #28a745;">View Your Orders</a>
              </div>
              
              <div class="footer">
                <p>Thank you for shopping with Nexus Store, ${user.name}! 🛍️</p>
                <p>© 2024 Nexus Store. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };

    return await sendEmail(mailOptions);
  } catch (error) {
    console.error('❌ Order confirmation email error:', error);
    return { success: false, error: error.message };
  }
};

// 4. Payment Success Email
const sendPaymentSuccess = async (order, user, paymentDetails) => {
  try {
    const mailOptions = {
      from: `"Nexus Store" <${process.env.EMAIL_FROM}>`,
      to: user.email,
      subject: `✅ Payment Successful - Order #${order.id}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          ${getCommonStyles()}
          <style>.header { background: linear-gradient(135deg, #20c997 0%, #17a2b8 100%); }</style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 28px;">✅ Payment Successful</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Your payment has been processed</p>
            </div>
            <div class="content">
              <h2 style="color: #333; margin-bottom: 20px;">Hello ${user.name},</h2>
              <p>We're pleased to inform you that your payment for Order #${order.id} has been successfully processed.</p>
              
              <div class="order-details">
                <h3 style="margin-top: 0; color: #495057;">Payment Details</h3>
                <p><strong>Order Number:</strong> #${order.id}</p>
                <p><strong>Amount Paid:</strong> Rs. ${order.total_amount}</p>
                <p><strong>Payment Method:</strong> ${order.payment_method}</p>
                <p><strong>Transaction ID:</strong> ${paymentDetails.transaction_id || 'N/A'}</p>
                <p><strong>Payment Date:</strong> ${new Date().toLocaleString()}</p>
              </div>
              
              <div class="success">
                <strong>✅ Payment Confirmed:</strong> Your order is now being processed. You'll receive shipping updates soon.
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL}/orders/${order.id}" class="button" style="background: #20c997;">View Order Details</a>
              </div>
              
              <div class="footer">
                <p>Thank you for choosing Nexus Store, ${user.name}! 🛍️</p>
                <p>© 2024 Nexus Store. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };

    return await sendEmail(mailOptions);
  } catch (error) {
    console.error('❌ Payment success email error:', error);
    return { success: false, error: error.message };
  }
};

// 5. Payment Failed Email
const sendPaymentFailed = async (order, user, errorMessage) => {
  try {
    const mailOptions = {
      from: `"Nexus Store" <${process.env.EMAIL_FROM}>`,
      to: user.email,
      subject: `❌ Payment Failed - Order #${order.id}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          ${getCommonStyles()}
          <style>.header { background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); }</style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 28px;">❌ Payment Failed</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">We couldn't process your payment</p>
            </div>
            <div class="content">
              <h2 style="color: #333; margin-bottom: 20px;">Hello ${user.name},</h2>
              <p>We were unable to process your payment for Order #${order.id}. Please try again or use a different payment method.</p>
              
              <div class="error">
                <strong>❌ Payment Issue:</strong> ${errorMessage || 'There was an issue processing your payment.'}
              </div>
              
              <div class="order-details">
                <h3 style="margin-top: 0; color: #495057;">Order Summary</h3>
                <p><strong>Order Number:</strong> #${order.id}</p>
                <p><strong>Total Amount:</strong> Rs. ${order.total_amount}</p>
                <p><strong>Payment Method:</strong> ${order.payment_method}</p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL}/checkout?order=${order.id}" class="button" style="background: #dc3545;">Retry Payment</a>
              </div>
              
              <p>If you continue to experience issues, please contact our support team for assistance.</p>
              
              <div class="footer">
                <p>Need help, ${user.name}? Contact our support team! 📞</p>
                <p>© 2024 Nexus Store. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };

    return await sendEmail(mailOptions);
  } catch (error) {
    console.error('❌ Payment failed email error:', error);
    return { success: false, error: error.message };
  }
};

// 6. Order Shipped Email
const sendOrderShipped = async (order, user, trackingInfo) => {
  try {
    const mailOptions = {
      from: `"Nexus Store" <${process.env.EMAIL_FROM}>`,
      to: user.email,
      subject: `🚚 Order Shipped - #${order.id}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          ${getCommonStyles()}
          <style>.header { background: linear-gradient(135deg, #17a2b8 0%, #138496 100%); }</style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 28px;">🚚 Order Shipped!</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Your order is on the way, ${user.name}!</p>
            </div>
            <div class="content">
              <h2 style="color: #333; margin-bottom: 20px;">Hello ${user.name},</h2>
              <p>Great news! Your order #${order.id} has been shipped and is on its way to you.</p>
              
              <div class="order-details">
                <h3 style="margin-top: 0; color: #495057;">Shipping Information</h3>
                <p><strong>Order Number:</strong> #${order.id}</p>
                <p><strong>Tracking Number:</strong> ${trackingInfo.trackingNumber || order.tracking_number || 'Will be updated soon'}</p>
                <p><strong>Estimated Delivery:</strong> ${trackingInfo.estimatedDelivery || order.estimated_delivery || '3-5 business days'}</p>
                <p><strong>Shipping Address:</strong> ${order.shipping_address || user.address || 'N/A'}</p>
              </div>
              
              <div class="success">
                <strong>📦 Shipping Update:</strong> Your package has been handed over to our delivery partner. You can track your shipment using the tracking number above.
              </div>
              
              ${trackingInfo.trackingUrl ? `
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${trackingInfo.trackingUrl}" class="button" style="background: #17a2b8;">Track Your Package</a>
                </div>
              ` : ''}
              
              <div class="footer">
                <p>Your order is on the way, ${user.name}! 🎉</p>
                <p>© 2024 Nexus Store. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };

    return await sendEmail(mailOptions);
  } catch (error) {
    console.error('❌ Order shipped email error:', error);
    return { success: false, error: error.message };
  }
};

// 7. Order Delivered Email
const sendOrderDelivered = async (order, user) => {
  try {
    const mailOptions = {
      from: `"Nexus Store" <${process.env.EMAIL_FROM}>`,
      to: user.email,
      subject: `📦 Order Delivered - #${order.id}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          ${getCommonStyles()}
          <style>.header { background: linear-gradient(135deg, #28a745 0%, #1e7e34 100%); }</style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 28px;">📦 Order Delivered!</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Your order has arrived, ${user.name}!</p>
            </div>
            <div class="content">
              <h2 style="color: #333; margin-bottom: 20px;">Hello ${user.name},</h2>
              <p>We're excited to let you know that your order #${order.id} has been successfully delivered!</p>
              
              <div class="success">
                <strong>✅ Delivery Confirmed:</strong> Your package has been delivered. We hope you love your purchase!
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL}/orders/${order.id}/review" class="button" style="background: #28a745;">Leave a Review</a>
              </div>
              
              <p>If you have any questions about your order or need to initiate a return, please visit our support center.</p>
              
              <div class="footer">
                <p>Thank you for shopping with Nexus Store, ${user.name}! We hope to see you again soon. 🛍️</p>
                <p>© 2024 Nexus Store. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };

    return await sendEmail(mailOptions);
  } catch (error) {
    console.error('❌ Order delivered email error:', error);
    return { success: false, error: error.message };
  }
};

// 8. Order Cancelled Email
const sendOrderCancelled = async (order, user, cancellationReason) => {
  try {
    const mailOptions = {
      from: `"Nexus Store" <${process.env.EMAIL_FROM}>`,
      to: user.email,
      subject: `❌ Order Cancelled - #${order.id}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          ${getCommonStyles()}
          <style>.header { background: linear-gradient(135deg, #6c757d 0%, #495057 100%); }</style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 28px;">❌ Order Cancelled</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Order #${order.id}</p>
            </div>
            <div class="content">
              <h2 style="color: #333; margin-bottom: 20px;">Hello ${user.name},</h2>
              <p>Your order #${order.id} has been cancelled.</p>
              
              <div class="order-details">
                <h3 style="margin-top: 0; color: #495057;">Cancellation Details</h3>
                <p><strong>Order Number:</strong> #${order.id}</p>
                <p><strong>Total Amount:</strong> Rs. ${order.total_amount}</p>
                <p><strong>Cancellation Reason:</strong> ${cancellationReason || 'Not specified'}</p>
                <p><strong>Cancellation Date:</strong> ${new Date().toLocaleString()}</p>
              </div>
              
              ${order.payment_status === 'completed' ? `
                <div class="success">
                  <strong>💰 Refund Initiated:</strong> Your payment will be refunded to your original payment method within 5-7 business days.
                </div>
              ` : ''}
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL}/products" class="button" style="background: #6c757d;">Continue Shopping</a>
              </div>
              
              <p>If you have any questions about this cancellation, please contact our support team.</p>
              
              <div class="footer">
                <p>We hope to see you again soon, ${user.name}! 🛍️</p>
                <p>© 2024 Nexus Store. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };

    return await sendEmail(mailOptions);
  } catch (error) {
    console.error('❌ Order cancelled email error:', error);
    return { success: false, error: error.message };
  }
};

// 9. Welcome Email (After Verification)
const sendWelcome = async (user) => {
  try {
    const mailOptions = {
      from: `"Nexus Store" <${process.env.EMAIL_FROM}>`,
      to: user.email,
      subject: '🎉 Welcome to Nexus Store!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          ${getCommonStyles()}
          <style>.header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }</style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 28px;">🎉 Welcome to Nexus Store!</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Your account is now verified</p>
            </div>
            <div class="content">
              <h2 style="color: #333; margin-bottom: 20px;">Hello ${user.name},</h2>
              <p>Congratulations! Your account has been successfully verified and is now fully active.</p>
              
              <div class="success">
                <strong>✅ Account Verified:</strong> You now have full access to all Nexus Store features including order tracking, wishlist, and personalized recommendations.
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL}/products" class="button" style="background: #667eea;">Start Shopping Now</a>
              </div>
              
              <h3 style="color: #495057; margin-top: 30px;">What you can do now:</h3>
              <ul style="color: #666; line-height: 1.8;">
                <li>🛍️ Browse thousands of products</li>
                <li>⭐ Save items to your wishlist</li>
                <li>📦 Track your orders in real-time</li>
                <li>💬 Leave reviews for products you love</li>
                <li>🎯 Get personalized recommendations</li>
              </ul>
              
              <div class="footer">
                <p>Happy Shopping, ${user.name}! 🛍️</p>
                <p>© 2024 Nexus Store. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };

    return await sendEmail(mailOptions);
  } catch (error) {
    console.error('❌ Welcome email error:', error);
    return { success: false, error: error.message };
  }
};

// 10. Password Changed Confirmation
const sendPasswordChanged = async (user) => {
  try {
    const mailOptions = {
      from: `"Nexus Store" <${process.env.EMAIL_FROM}>`,
      to: user.email,
      subject: '✅ Password Changed Successfully',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          ${getCommonStyles()}
          <style>.header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); }</style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 28px;">✅ Password Changed</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Your account is secure</p>
            </div>
            <div class="content">
              <h2 style="color: #333; margin-bottom: 20px;">Hello ${user.name},</h2>
              <p>Your password has been successfully changed.</p>
              
              <div class="success">
                <strong>🔒 Security Update:</strong> Your account password was updated on ${new Date().toLocaleString()}
              </div>
              
              <div class="warning">
                <strong>⚠️ Security Tip:</strong> If you didn't make this change, please contact our support team immediately.
              </div>
              
              <div class="footer">
                <p>Your account security is our priority, ${user.name}! 🔒</p>
                <p>© 2024 Nexus Store. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };

    return await sendEmail(mailOptions);
  } catch (error) {
    console.error('❌ Password changed email error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendEmailVerification,
  sendPasswordReset,
  sendOrderConfirmation,
  sendPaymentSuccess,
  sendPaymentFailed,
  sendOrderShipped,
  sendOrderDelivered,
  sendOrderCancelled,
  sendWelcome,
  sendPasswordChanged,
  sendEmail,
  testEmailConfig
};