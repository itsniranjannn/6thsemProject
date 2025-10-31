const express = require('express');
const {
  getProducts,
  getProductById,
  getProductCategories,
  getFeaturedProducts,
  getNewArrivals,
  getProductOffers,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  getProductsByCategory,
  uploadProductImage
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/categories', getProductCategories);
router.get('/featured', getFeaturedProducts);
router.get('/new-arrivals', getNewArrivals);
router.get('/offers', getProductOffers);
router.get('/search', searchProducts);
router.get('/category/:category', getProductsByCategory);
router.get('/:id', getProductById);

// Image upload route
router.post('/upload-image', protect, admin, uploadProductImage);

// Admin routes
router.post('/', protect, admin, createProduct);
router.put('/:id', protect, admin, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);
// Get trending searches
router.get('/trending-searches', async (req, res) => {
  try {
    // Get popular search terms from database or analytics
    const popularSearches = await Product.aggregate([
      { 
        $match: { 
          // Add any filters for popular products
        } 
      },
      { 
        $group: { 
          _id: '$category',
          count: { $sum: 1 }
        } 
      },
      { 
        $sort: { count: -1 } 
      },
      { 
        $limit: 5 
      }
    ]);

    // Fallback if no data
    const trendingSearches = popularSearches.length > 0 
      ? popularSearches.map(item => item._id.toLowerCase())
      : ['electronics', 'clothing', 'home', 'sports', 'books'];

    res.json({
      success: true,
      trendingSearches
    });
  } catch (error) {
    console.error('Error fetching trending searches:', error);
    res.json({
      success: true,
      trendingSearches: ['electronics', 'clothing', 'home', 'sports', 'books']
    });
  }
});

module.exports = router;