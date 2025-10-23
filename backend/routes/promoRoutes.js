const express = require('express');
const { 
  getPromoCodes, 
  getPromoCodeById, 
  createPromoCode, 
  updatePromoCode, 
  deletePromoCode, 
  validatePromoCode, 
  getActivePromoCodes 
} = require('../controllers/promoController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.get('/active', getActivePromoCodes);
router.post('/validate', validatePromoCode);

// Admin routes
router.get('/', protect, adminOnly, getPromoCodes);
router.get('/:id', protect, adminOnly, getPromoCodeById);
router.post('/', protect, adminOnly, createPromoCode);
router.put('/:id', protect, adminOnly, updatePromoCode);
router.delete('/:id', protect, adminOnly, deletePromoCode);

module.exports = router;