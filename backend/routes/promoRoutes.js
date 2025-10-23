const express = require('express');
const { 
  getPromoCodes, 
  getPromoCodeById, 
  createPromoCode, 
  updatePromoCode, 
  deletePromoCode, 
  validatePromoCode, 
  getActivePromoCodes,
  getAvailablePromoCodes
} = require('../controllers/promoController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes - FIXED: Added proper promo code endpoints
router.get('/active', getActivePromoCodes);
router.get('/available', getAvailablePromoCodes);
router.post('/validate', validatePromoCode);

// Admin routes
router.get('/', protect, admin, getPromoCodes);
router.get('/:id', protect, admin, getPromoCodeById);
router.post('/', protect, admin, createPromoCode);
router.put('/:id', protect, admin, updatePromoCode);
router.delete('/:id', protect, admin, deletePromoCode);

module.exports = router;