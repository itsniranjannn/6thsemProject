const express = require('express');
const RecommendationEngine = require('../utils/recommendation');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Get related products for a specific product
router.get('/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { limit = 4, algorithm = 'content' } = req.query;

    let recommendations;
    
    switch (algorithm) {
      case 'ml':
        recommendations = await RecommendationEngine.getMLRecommendations(productId, parseInt(limit));
        break;
      case 'collaborative':
        // For collaborative filtering, we need a user ID
        if (req.user) {
          recommendations = await RecommendationEngine.getUserRecommendations(req.user.id, parseInt(limit));
        } else {
          recommendations = await RecommendationEngine.getRelatedProducts(productId, parseInt(limit));
        }
        break;
      case 'content':
      default:
        recommendations = await RecommendationEngine.getRelatedProducts(productId, parseInt(limit));
    }

    res.json({
      success: true,
      algorithm,
      recommendations,
      count: recommendations.length
    });
  } catch (error) {
    console.error('Recommendation error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error generating recommendations',
      error: error.message 
    });
  }
});

// Get personalized recommendations for logged-in user
router.get('/user/personalized', protect, async (req, res) => {
  try {
    const { limit = 4 } = req.query;
    const recommendations = await RecommendationEngine.getUserRecommendations(req.user.id, parseInt(limit));
    
    res.json({
      success: true,
      algorithm: 'collaborative',
      recommendations,
      count: recommendations.length
    });
  } catch (error) {
    console.error('Personalized recommendation error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error generating personalized recommendations',
      error: error.message 
    });
  }
});

// Get popular products
router.get('/popular', async (req, res) => {
  try {
    const { limit = 4 } = req.query;
    const recommendations = await RecommendationEngine.getPopularProducts(parseInt(limit));
    
    res.json({
      success: true,
      algorithm: 'popularity',
      recommendations,
      count: recommendations.length
    });
  } catch (error) {
    console.error('Popular products error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching popular products',
      error: error.message 
    });
  }
});

module.exports = router;