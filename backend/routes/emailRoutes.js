const express = require('express');
const { 
  sendOrderConfirmation,
  sendPaymentSuccess,
  sendPaymentFailed,
  sendOrderShipped,
  sendOrderDelivered,
  sendOrderCancelled,
  sendEmailVerification,
  sendPasswordReset,
  sendPasswordChanged,
  sendWelcome,
  sendEmail,
  testEmailConfig
} = require('../controllers/emailController');
const { protect, admin } = require('../middleware/authMiddleware');

// Import models (you'll need to adjust these based on your actual models)
const Order = require('../models/orderModel');
const User = require('../models/userModel');

const router = express.Router();

// Common email styles function (moved from controller for routes usage)
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
  </style>
`;

// Email health check
router.get('/health', async (req, res) => {
  try {
    const configTest = await testEmailConfig();
    
    res.json({
      success: configTest,
      message: configTest ? 'Email service is healthy' : 'Email service configuration failed',
      environment: process.env.NODE_ENV || 'development',
      emailUser: process.env.EMAIL_USER ? 'Configured' : 'Not configured',
      emailFrom: process.env.EMAIL_FROM || 'Not configured',
      frontendUrl: process.env.FRONTEND_URL || 'Not configured'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Email health check failed',
      error: error.message
    });
  }
});

// Send order confirmation email
router.post('/order-confirmation/:orderId', protect, async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const order = await Order.findById(orderId);
    const user = await User.findById(order.user_id);
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Check authorization
    if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const result = await sendOrderConfirmation(order, user);
    
    res.json({
      success: result.success,
      message: result.success ? 'Order confirmation email sent successfully' : 'Failed to send email',
      error: result.error,
      development: result.development
    });
  } catch (error) {
    console.error('Send order confirmation email error:', error);
    res.status(500).json({ success: false, message: 'Error sending email' });
  }
});

// Send payment success email
router.post('/payment-success/:orderId', protect, async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const order = await Order.findById(orderId);
    const user = await User.findById(order.user_id);
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Check authorization
    if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const paymentDetails = {
      transaction_id: req.body.transaction_id,
      payment_method: order.payment_method
    };

    const result = await sendPaymentSuccess(order, user, paymentDetails);
    
    res.json({
      success: result.success,
      message: result.success ? 'Payment success email sent successfully' : 'Failed to send email',
      error: result.error,
      development: result.development
    });
  } catch (error) {
    console.error('Send payment success email error:', error);
    res.status(500).json({ success: false, message: 'Error sending email' });
  }
});

// Send payment failed email
router.post('/payment-failed/:orderId', protect, async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const order = await Order.findById(orderId);
    const user = await User.findById(order.user_id);
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Check authorization
    if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const result = await sendPaymentFailed(order, user, req.body.error_message);
    
    res.json({
      success: result.success,
      message: result.success ? 'Payment failed email sent successfully' : 'Failed to send email',
      error: result.error,
      development: result.development
    });
  } catch (error) {
    console.error('Send payment failed email error:', error);
    res.status(500).json({ success: false, message: 'Error sending email' });
  }
});

// Admin: Send order shipped email
router.post('/order-shipped/:orderId', protect, admin, async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const order = await Order.findById(orderId);
    const user = await User.findById(order.user_id);
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const trackingInfo = {
      trackingNumber: req.body.tracking_number,
      estimatedDelivery: req.body.estimated_delivery,
      trackingUrl: req.body.tracking_url
    };

    const result = await sendOrderShipped(order, user, trackingInfo);
    
    res.json({
      success: result.success,
      message: result.success ? 'Order shipped email sent successfully' : 'Failed to send email',
      error: result.error,
      development: result.development
    });
  } catch (error) {
    console.error('Send order shipped email error:', error);
    res.status(500).json({ success: false, message: 'Error sending email' });
  }
});

// Admin: Send order delivered email
router.post('/order-delivered/:orderId', protect, admin, async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const order = await Order.findById(orderId);
    const user = await User.findById(order.user_id);
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const result = await sendOrderDelivered(order, user);
    
    res.json({
      success: result.success,
      message: result.success ? 'Order delivered email sent successfully' : 'Failed to send email',
      error: result.error,
      development: result.development
    });
  } catch (error) {
    console.error('Send order delivered email error:', error);
    res.status(500).json({ success: false, message: 'Error sending email' });
  }
});

// Send order cancelled email
router.post('/order-cancelled/:orderId', protect, async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const order = await Order.findById(orderId);
    const user = await User.findById(order.user_id);
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Check authorization
    if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const result = await sendOrderCancelled(order, user, req.body.cancellation_reason);
    
    res.json({
      success: result.success,
      message: result.success ? 'Order cancelled email sent successfully' : 'Failed to send email',
      error: result.error,
      development: result.development
    });
  } catch (error) {
    console.error('Send order cancelled email error:', error);
    res.status(500).json({ success: false, message: 'Error sending email' });
  }
});

// Send email verification email
router.post('/send-verification', async (req, res) => {
  try {
    const { email, name, verification_token } = req.body;
    
    if (!email || !verification_token) {
      return res.status(400).json({ success: false, message: 'Email and verification token are required' });
    }

    const user = { email, name: name || 'User' };
    const result = await sendEmailVerification(user, verification_token);
    
    res.json({
      success: result.success,
      message: result.success ? 'Verification email sent successfully' : 'Failed to send verification email',
      error: result.error,
      development: result.development
    });
  } catch (error) {
    console.error('Send verification email error:', error);
    res.status(500).json({ success: false, message: 'Error sending verification email' });
  }
});

// Send password reset email
router.post('/send-password-reset', async (req, res) => {
  try {
    const { email, name, reset_token } = req.body;
    
    if (!email || !reset_token) {
      return res.status(400).json({ success: false, message: 'Email and reset token are required' });
    }

    const user = { email, name: name || 'User' };
    const result = await sendPasswordReset(user, reset_token);
    
    res.json({
      success: result.success,
      message: result.success ? 'Password reset email sent successfully' : 'Failed to send password reset email',
      error: result.error,
      development: result.development
    });
  } catch (error) {
    console.error('Send password reset email error:', error);
    res.status(500).json({ success: false, message: 'Error sending password reset email' });
  }
});

// Send welcome email
router.post('/send-welcome', protect, async (req, res) => {
  try {
    const result = await sendWelcome(req.user);
    
    res.json({
      success: result.success,
      message: result.success ? 'Welcome email sent successfully' : 'Failed to send welcome email',
      error: result.error,
      development: result.development
    });
  } catch (error) {
    console.error('Send welcome email error:', error);
    res.status(500).json({ success: false, message: 'Error sending welcome email' });
  }
});

// Send password changed email
router.post('/send-password-changed', protect, async (req, res) => {
  try {
    const result = await sendPasswordChanged(req.user);
    
    res.json({
      success: result.success,
      message: result.success ? 'Password changed email sent successfully' : 'Failed to send password changed email',
      error: result.error,
      development: result.development
    });
  } catch (error) {
    console.error('Send password changed email error:', error);
    res.status(500).json({ success: false, message: 'Error sending password changed email' });
  }
});

// Test email endpoint
router.post('/test', protect, admin, async (req, res) => {
  try {
    const { to, subject, message } = req.body;
    
    const result = await sendEmail({
      from: `"Nexus Store" <${process.env.EMAIL_FROM}>`,
      to: to || req.user.email,
      subject: subject || 'Test Email from Nexus Store',
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
              <h1 style="margin: 0; font-size: 28px;">📧 Test Email</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Nexus Store Email System</p>
            </div>
            <div class="content">
              <h2 style="color: #333; margin-bottom: 20px;">Hello ${req.user.name},</h2>
              <p>This is a test email from your Nexus Store application.</p>
              <p><strong>Message:</strong> ${message || 'Email system is working correctly!'}</p>
              
              <div class="success">
                <strong>✅ Email System Status:</strong> Your email configuration is working properly.
              </div>
              
              <div class="footer">
                <p>Nexus Store Email System 🛍️</p>
                <p>© 2024 Nexus Store. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    });

    res.json({
      success: result.success,
      message: result.success ? 'Test email sent successfully' : 'Failed to send test email',
      error: result.error,
      development: result.development
    });
  } catch (error) {
    console.error('Send test email error:', error);
    res.status(500).json({ success: false, message: 'Error sending test email' });
  }
});

// Public test endpoint (for development)
router.post('/public-test', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const result = await sendEmail({
      from: `"Nexus Store" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: 'Nexus Store - Email System Test',
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
              <h1 style="margin: 0; font-size: 28px;">✅ Email System Working!</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Nexus Store Email Test</p>
            </div>
            <div class="content">
              <h2 style="color: #333; margin-bottom: 20px;">Hello!</h2>
              <p>This is a test email to verify that your Nexus Store email system is working correctly.</p>
              
              <div class="success">
                <strong>✅ Success:</strong> If you're reading this, your email configuration is working properly!
              </div>
              
              <p><strong>Environment:</strong> ${process.env.NODE_ENV || 'development'}</p>
              <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
              
              <div class="footer">
                <p>Nexus Store Email System 🛍️</p>
                <p>© 2024 Nexus Store. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    });

    res.json({
      success: result.success,
      message: result.success ? 'Test email sent successfully' : 'Failed to send test email',
      error: result.error,
      development: result.development
    });
  } catch (error) {
    console.error('Public test email error:', error);
    res.status(500).json({ success: false, message: 'Error sending test email' });
  }
});

module.exports = router;