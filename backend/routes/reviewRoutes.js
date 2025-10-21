const express = require('express');
const { addReview, getProductReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, addReview);
router.get('/product/:product_id', getProductReviews);

module.exports = router;