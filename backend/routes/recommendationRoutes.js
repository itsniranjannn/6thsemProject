const express = require('express');
const RecommendationEngine = require('../utils/recommendation');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Get related products for a specific product
router.get('/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { limit = 8, algorithm = 'ml' } = req.query;

    console.log(`🔍 Generating ${algorithm} recommendations for product ${productId}, limit: ${limit}`);

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
        recommendations = await RecommendationEngine.getRelatedProducts(productId, parseInt(limit));
        break;
      case 'popular':
        recommendations = await RecommendationEngine.getPopularProducts(parseInt(limit));
        break;
      case 'hybrid':
        recommendations = await RecommendationEngine.getHybridRecommendations(
          productId, 
          req.user?.id, 
          parseInt(limit)
        );
        break;
      default:
        recommendations = await RecommendationEngine.getMLRecommendations(productId, parseInt(limit));
    }

    console.log(`✅ ${algorithm} recommendations generated: ${recommendations.length} products`);

    res.json({
      success: true,
      algorithm,
      recommendations: recommendations.map(rec => ({
        ...rec,
        // Ensure all required fields are present
        image_urls: rec.image_urls || [rec.image_url],
        rating: rec.rating || "0.0",
        reviewCount: rec.reviewCount || 0
      })),
      count: recommendations.length,
      performance: {
        algorithm,
        responseTime: Date.now() - req.startTime,
        recommendationCount: recommendations.length
      }
    });
  } catch (error) {
    console.error('❌ Recommendation error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error generating recommendations',
      error: error.message,
      algorithm: req.query.algorithm || 'ml'
    });
  }
});

// Get personalized recommendations for logged-in user
router.get('/user/personalized', protect, async (req, res) => {
  try {
    const { limit = 8 } = req.query;
    const recommendations = await RecommendationEngine.getUserRecommendations(req.user.id, parseInt(limit));
    
    res.json({
      success: true,
      algorithm: 'collaborative',
      recommendations: recommendations.map(rec => ({
        ...rec,
        image_urls: rec.image_urls || [rec.image_url],
        rating: rec.rating || "0.0",
        reviewCount: rec.reviewCount || 0
      })),
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
    const { limit = 8 } = req.query;
    const recommendations = await RecommendationEngine.getPopularProducts(parseInt(limit));
    
    res.json({
      success: true,
      algorithm: 'popularity',
      recommendations: recommendations.map(rec => ({
        ...rec,
        image_urls: rec.image_urls || [rec.image_url],
        rating: rec.rating || "0.0",
        reviewCount: rec.reviewCount || 0
      })),
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

// Get hybrid recommendations (combination of all algorithms)
router.get('/hybrid/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { limit = 8 } = req.query;
    
    const recommendations = await RecommendationEngine.getHybridRecommendations(
      productId, 
      req.user?.id, 
      parseInt(limit)
    );
    
    res.json({
      success: true,
      algorithm: 'hybrid',
      recommendations: recommendations.map(rec => ({
        ...rec,
        image_urls: rec.image_urls || [rec.image_url],
        rating: rec.rating || "0.0",
        reviewCount: rec.reviewCount || 0
      })),
      count: recommendations.length
    });
  } catch (error) {
    console.error('Hybrid recommendation error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error generating hybrid recommendations',
      error: error.message 
    });
  }
});

// Health check for recommendation service
router.get('/health', async (req, res) => {
  try {
    const testRecommendations = await RecommendationEngine.getPopularProducts(2);
    
    res.json({
      success: true,
      service: 'recommendation-engine',
      status: 'healthy',
      testRecommendations: testRecommendations.length,
      algorithms: ['ml', 'content', 'collaborative', 'popular', 'hybrid']
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      service: 'recommendation-engine',
      status: 'unhealthy',
      error: error.message
    });
  }
});

// Add middleware to track response time
router.use((req, res, next) => {
  req.startTime = Date.now();
  next();
});

module.exports = router;