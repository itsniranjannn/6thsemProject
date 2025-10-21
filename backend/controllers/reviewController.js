const Review = require('../models/reviewModel');

const addReview = async (req, res) => {
  try {
    const { product_id, rating, comment } = req.body;
    const user_id = req.user.id;
    const user_name = req.user.name;

    const review = await Review.create({
      user_id,
      product_id,
      rating,
      comment,
      user_name
    });

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      review
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding review',
      error: error.message
    });
  }
};

const getProductReviews = async (req, res) => {
  try {
    const { product_id } = req.params;
    const reviews = await Review.getByProduct(product_id);
    const stats = await Review.getProductStats(product_id);

    res.json({
      success: true,
      reviews,
      stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching reviews',
      error: error.message
    });
  }
};

module.exports = {
  addReview,
  getProductReviews
};