// routes/emailRoutes.js - NEW FILE
const express = require('express');
const { 
  sendOrderConfirmationEmail, 
  sendPaymentFailedEmail,
  sendOrderShippedEmail,
  sendEmailVerificationEmail,
  sendPasswordResetEmail,
  sendPasswordChangedEmail,
  sendWelcomeEmail
} = require('../controllers/emailController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// Send order confirmation email
router.post('/order-confirmation/:orderId', protect, async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Check authorization
    if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const result = await sendOrderConfirmationEmail(order);
    
    if (result) {
      res.json({ success: true, message: 'Order confirmation email sent successfully' });
    } else {
      res.status(500).json({ success: false, message: 'Failed to send email' });
    }
  } catch (error) {
    console.error('Send order confirmation email error:', error);
    res.status(500).json({ success: false, message: 'Error sending email' });
  }
});

// Admin: Send order shipped email
router.post('/order-shipped/:orderId', protect, admin, async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const result = await sendOrderShippedEmail(order);
    
    if (result) {
      res.json({ success: true, message: 'Order shipped email sent successfully' });
    } else {
      res.status(500).json({ success: false, message: 'Failed to send email' });
    }
  } catch (error) {
    console.error('Send order shipped email error:', error);
    res.status(500).json({ success: false, message: 'Error sending email' });
  }
});

module.exports = router;