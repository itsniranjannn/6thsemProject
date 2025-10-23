// routes/promoRoutes.js
const express = require('express');
const { validatePromoCode, getAvailablePromoCodes } = require('../controllers/promoController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/validate', protect, validatePromoCode);
router.get('/available', protect, getAvailablePromoCodes);

module.exports = router;