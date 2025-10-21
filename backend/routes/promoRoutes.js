const express = require('express');
const router = express.Router();
const { validatePromoCode, getAvailablePromoCodes } = require('../controllers/promoController');
const { protect } = require('../middleware/authMiddleware');

router.post('/validate', protect, validatePromoCode);
router.get('/available', protect, getAvailablePromoCodes);

module.exports = router;