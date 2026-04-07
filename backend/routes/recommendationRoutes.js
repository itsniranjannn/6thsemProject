const express = require('express');
const RecommendationEngine = require('../utils/recommendation');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Timing middleware - must be first to track response time
router.use((req, res, next) => {
  req.startTime = Date.now();
  next();
});

// Placeholder image for products without images
const PLACEHOLDER_IMAGE = '/placeholder.jpg';

// Helper to parse and clamp limit parameter (1-50, default 8)
function parseLimit(limitParam) {
  const parsed = parseInt(limitParam, 10);
  if (isNaN(parsed) || parsed < 1) return 8;
  return Math.min(parsed, 50);
}

// Helper to ensure image_urls is always a valid array with at least one image
function normalizeImageUrls(rec) {
  let imageUrls = rec.image_urls;
  
  // Parse JSON if it's a string
  if (typeof imageUrls === 'string') {
    try {
      imageUrls = JSON.parse(imageUrls);
    } catch {
      imageUrls = null;
    }
  }
  
  // If image_urls is valid array with items, use it
  if (Array.isArray(imageUrls) && imageUrls.length > 0 && imageUrls[0]) {
    return imageUrls;
  }
  
  // Fallback to image_url if it exists
  if (rec.image_url) {
    return [rec.image_url];
  }
  
  // Ultimate fallback to placeholder
  return [PLACEHOLDER_IMAGE];
}

// Helper to format recommendation with proper defaults
function formatRecommendation(rec) {
  return {
    ...rec,
    image_urls: normalizeImageUrls(rec),
    rating: typeof rec.rating === 'number' ? rec.rating : parseFloat(rec.rating) || 0,
    reviewCount: parseInt(rec.reviewCount, 10) || 0
  };
}

// Get related products for a specific product
router.get('/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { algorithm = 'ml' } = req.query;
    const limit = parseLimit(req.query.limit);

    console.log(`🔍 Generating ${algorithm} recommendations for product ${productId}, limit: ${limit}`);

    let recommendations;
    let algorithmUsed = algorithm;
    
    switch (algorithm) {
      case 'ml':
        recommendations = await RecommendationEngine.getMLRecommendations(productId, limit);
        break;
      case 'collaborative':
        // For collaborative filtering, we need a user ID
        if (req.user) {
          recommendations = await RecommendationEngine.getUserRecommendations(req.user.id, limit);
        } else {
          // Fallback to content-based when no user is logged in
          recommendations = await RecommendationEngine.getRelatedProducts(productId, limit);
          algorithmUsed = 'content (fallback)';
        }
        break;
      case 'content':
        recommendations = await RecommendationEngine.getRelatedProducts(productId, limit);
        break;
      case 'popular':
        recommendations = await RecommendationEngine.getPopularProducts(limit);
        break;
      case 'hybrid':
        recommendations = await RecommendationEngine.getHybridRecommendations(
          productId, 
          req.user?.id, 
          limit
        );
        break;
      default:
        recommendations = await RecommendationEngine.getMLRecommendations(productId, limit);
    }

    console.log(`✅ ${algorithmUsed} recommendations generated: ${recommendations.length} products`);

    res.json({
      success: true,
      algorithm,
      algorithm_used: algorithmUsed,
      recommendations: recommendations.map(formatRecommendation),
      count: recommendations.length,
      performance: {
        algorithm: algorithmUsed,
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
    const limit = parseLimit(req.query.limit);
    const result = await RecommendationEngine.getUserRecommendations(req.user.id, limit, true);
    
    // Handle both old format (array) and new format (object with metadata)
    const recommendations = result.recommendations || result;
    const algorithmUsed = result.algorithm_used || 'collaborative';
    const fallback = result.fallback || false;
    const fallbackReason = result.fallbackReason || null;
    
    res.json({
      success: true,
      algorithm: 'collaborative',
      algorithm_used: algorithmUsed,
      fallback,
      fallback_reason: fallbackReason,
      recommendations: recommendations.map(formatRecommendation),
      count: recommendations.length,
      performance: {
        responseTime: Date.now() - req.startTime
      }
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
    const limit = parseLimit(req.query.limit);
    const recommendations = await RecommendationEngine.getPopularProducts(limit);
    
    res.json({
      success: true,
      algorithm: 'popularity',
      algorithm_used: 'popularity',
      recommendations: recommendations.map(formatRecommendation),
      count: recommendations.length,
      performance: {
        responseTime: Date.now() - req.startTime
      }
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
    const limit = parseLimit(req.query.limit);
    
    const recommendations = await RecommendationEngine.getHybridRecommendations(
      productId, 
      req.user?.id, 
      limit
    );
    
    res.json({
      success: true,
      algorithm: 'hybrid',
      recommendations: recommendations.map(formatRecommendation),
      count: recommendations.length,
      performance: {
        responseTime: Date.now() - req.startTime
      }
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
      algorithms: ['ml', 'content', 'collaborative', 'popular', 'hybrid'],
      responseTime: Date.now() - req.startTime
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

module.exports = router;