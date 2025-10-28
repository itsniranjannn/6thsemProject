// backend/routes/offerRoutes.js - COMPLETE VERSION
const express = require('express');
const {
  getActiveOffers,
  getAdminOffers,
  createOffer,
  updateOffer,
  deleteOffer
} = require('../controllers/offerController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.get('/', getActiveOffers);

// Admin routes
router.get('/admin/all', protect, admin, getAdminOffers);
router.post('/', protect, admin, createOffer);
router.put('/:id', protect, admin, updateOffer);
router.delete('/:id', protect, admin, deleteOffer);

module.exports = router;