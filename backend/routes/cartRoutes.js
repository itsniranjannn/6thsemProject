// backend/routes/cartRoutes.js - UPDATED
const express = require('express');
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  validateCart,
  mergeCarts
} = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getCart);
router.post('/add', protect, addToCart);
router.put('/update/:productId', protect, updateCartItem);
router.delete('/remove/:productId', protect, removeFromCart);
router.delete('/clear', protect, clearCart);
router.post('/validate', protect, validateCart);
router.post('/merge', protect, mergeCarts);

module.exports = router;