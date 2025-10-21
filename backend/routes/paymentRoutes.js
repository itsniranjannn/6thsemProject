// routes/paymentRoutes.js
const express = require('express');
const {
  createStripePayment,
  createKhaltiPayment,
  createEsewaPayment,
  createCodPayment,
  verifyKhaltiPayment,
  handleEsewaSuccess,
  handleKhaltiCallback,
  handleStripeWebhook,
  getPaymentHealth
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Payment health check (public - should be first)
router.get('/health', getPaymentHealth);

// Payment creation routes (protected)
router.post('/stripe', protect, createStripePayment);
router.post('/khalti', protect, createKhaltiPayment);
router.post('/esewa', protect, createEsewaPayment);
router.post('/cod', protect, createCodPayment);

// Payment verification routes
router.post('/khalti/verify', protect, verifyKhaltiPayment);

// Payment callbacks (no authentication needed for callbacks)
router.get('/esewa/success', handleEsewaSuccess);
router.get('/khalti/callback', handleKhaltiCallback);

// Stripe webhook (needs raw body parser)
router.post('/stripe/webhook', express.raw({type: 'application/json'}), handleStripeWebhook);

module.exports = router;