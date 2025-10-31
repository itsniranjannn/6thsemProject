// frontend/src/components/ProductModal.js - PROFESSIONAL REDESIGN
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ShoppingCart, 
  Heart, 
  Star, 
  ChevronLeft, 
  ChevronRight,
  Truck,
  Shield,
  Zap,
  Clock,
  Package
} from 'lucide-react';

const ProductModal = ({ product, reviews, reviewsLoading, onClose, onAddToCart, onAddReview }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState('description');
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [activeAlgorithm, setActiveAlgorithm] = useState('ml');
  const [realTimeRating, setRealTimeRating] = useState(null);
  const [realTimeReviews, setRealTimeReviews] = useState(null);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Enhanced images handling
  const getProductImages = () => {
    if (!product) return ['https://via.placeholder.com/400x400?text=No+Image'];
    
    let images = [];
    
    if (product.image_urls) {
      if (Array.isArray(product.image_urls)) {
        images = product.image_urls.filter(url => url && url.trim() !== '');
      } else if (typeof product.image_urls === 'string') {
        try {
          const parsed = JSON.parse(product.image_urls);
          images = Array.isArray(parsed) ? parsed.filter(url => url && url.trim() !== '') : [product.image_urls];
        } catch {
          images = [product.image_urls];
        }
      }
    }
    
    if (images.length === 0 && product.image_url) {
      images = [product.image_url];
    }
    
    if (images.length === 0) {
      images = ['https://via.placeholder.com/400x400?text=No+Image'];
    }
    
    return images;
  };

  const images = getProductImages();

  // Fetch real-time data
  useEffect(() => {
    if (product?.id) {
      fetchRealTimeData();
    }
  }, [product?.id]);

  // Fetch recommendations
  useEffect(() => {
    if (product?.id) {
      fetchRecommendations();
    }
  }, [product?.id, activeAlgorithm]);

  const fetchRealTimeData = async () => {
    if (!product?.id) return;
    
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/reviews/product/${product.id}`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setRealTimeRating({
            average: parseFloat(data.stats?.average_rating || product.rating || 0).toFixed(1),
            total: data.stats?.total_reviews || product.reviewCount || 0
          });
          setRealTimeReviews(data);
        }
      }
    } catch (error) {
      console.error('Error fetching real-time data:', error);
    }
  };

  const fetchRecommendations = async () => {
    if (!product?.id) return;
    
    try {
      setRecommendationsLoading(true);
      const token = localStorage.getItem('token');
      
      let apiUrl = '';
      const headers = {};
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      switch (activeAlgorithm) {
        case 'ml':
          apiUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/recommendations/product/${product.id}?algorithm=ml&limit=4`;
          break;
        case 'content':
          apiUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/recommendations/product/${product.id}?algorithm=content&limit=4`;
          break;
        case 'collaborative':
          apiUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/recommendations/user/personalized?limit=4`;
          break;
        case 'popular':
          apiUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/recommendations/popular?limit=4`;
          break;
        default:
          apiUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/recommendations/product/${product.id}?algorithm=ml&limit=4`;
      }

      const response = await fetch(apiUrl, { headers });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.recommendations) {
          const processedRecs = data.recommendations.map(rec => {
            let recImages = [];
            
            if (rec.image_urls) {
              if (Array.isArray(rec.image_urls)) {
                recImages = rec.image_urls.filter(url => url && url.trim() !== '');
              } else if (typeof rec.image_urls === 'string') {
                try {
                  const parsed = JSON.parse(rec.image_urls);
                  recImages = Array.isArray(parsed) ? parsed : [rec.image_urls];
                } catch {
                  recImages = [rec.image_urls];
                }
              }
            }
            
            if (recImages.length === 0 && rec.image_url) {
              recImages = [rec.image_url];
            }
            
            if (recImages.length === 0) {
              recImages = ['https://via.placeholder.com/200x200?text=No+Image'];
            }

            return {
              ...rec,
              image_urls: recImages,
              mainImage: recImages[0],
              rating: parseFloat(rec.rating || 0).toFixed(1),
              reviewCount: rec.reviewCount || 0
            };
          });
          
          setRecommendations(processedRecs);
        }
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setRecommendationsLoading(false);
    }
  };

  const handleAddToCartWithQuantity = async () => {
    if (!product || quantity < 1 || quantity > product.stock_quantity) {
      alert('Invalid quantity');
      return;
    }
    
    setIsAddingToCart(true);
    try {
      const productWithQuantity = { ...product, quantity };
      await onAddToCart(productWithQuantity);
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const getAlgorithmInfo = () => {
    switch (activeAlgorithm) {
      case 'ml':
        return { name: 'AI ML', icon: '🧠', color: 'from-purple-500 to-pink-500' };
      case 'content':
        return { name: 'Content-Based', icon: '📊', color: 'from-blue-500 to-cyan-500' };
      case 'collaborative':
        return { name: 'Collaborative', icon: '👥', color: 'from-green-500 to-emerald-500' };
      case 'popular':
        return { name: 'Popular', icon: '🔥', color: 'from-orange-500 to-red-500' };
      default:
        return { name: 'AI ML', icon: '🧠', color: 'from-purple-500 to-pink-500' };
    }
  };

  const renderStars = (rating, size = 'text-lg') => {
    const stars = [];
    const numericRating = parseFloat(rating) || 0;
    
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={`${size} ${
            i <= numericRating ? 'text-yellow-400' : 'text-gray-300'
          }`}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  const renderReviewBars = (stats) => {
    if (!stats) return null;
    
    const total = stats.total_reviews || 0;
    if (total === 0) return null;

    const bars = [
      { stars: 5, count: stats.five_star || 0 },
      { stars: 4, count: stats.four_star || 0 },
      { stars: 3, count: stats.three_star || 0 },
      { stars: 2, count: stats.two_star || 0 },
      { stars: 1, count: stats.one_star || 0 }
    ];

    return bars.map(bar => (
      <div key={bar.stars} className="flex items-center gap-3 mb-2">
        <span className="text-sm text-gray-600 w-8">{bar.stars}★</span>
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div 
            className="bg-yellow-400 h-2 rounded-full transition-all duration-500" 
            style={{ width: total ? `${(bar.count / total) * 100}%` : '0%' }}
          ></div>
        </div>
        <span className="text-sm text-gray-600 w-12">{bar.count}</span>
        <span className="text-xs text-gray-500 w-16">
          {total ? `${Math.round((bar.count / total) * 100)}%` : '0%'}
        </span>
      </div>
    ));
  };

  // Use real-time data if available
  const displayRating = realTimeRating?.average || product.rating || "0.0";
  const displayReviewCount = realTimeRating?.total || product.reviewCount || 0;
  const displayReviews = realTimeReviews || reviews;

  // FIXED: Handle empty product
  if (!product) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-3xl max-w-2xl w-full p-8 text-center">
          <p>Product not found</p>
          <button onClick={onClose} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="bg-white rounded-3xl max-w-6xl w-full max-h-[95vh] overflow-hidden shadow-2xl border border-gray-100"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 30 }}
      >
        <div className="flex flex-col lg:flex-row h-full">
          {/* Product Images */}
          <div className="lg:w-1/2 p-8">
            <div className="relative group">
              {/* Main Image */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100">
                <motion.img
                  src={images[selectedImage]}
                  alt={product.name}
                  className="w-full h-96 object-cover"
                  key={selectedImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
                
                {/* Image Navigation Arrows */}
                {images.length > 1 && (
                  <>
                    <motion.button
                      onClick={() => setSelectedImage(selectedImage > 0 ? selectedImage - 1 : images.length - 1)}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-3 shadow-lg transition-all duration-200"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                      onClick={() => setSelectedImage(selectedImage < images.length - 1 ? selectedImage + 1 : 0)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-3 shadow-lg transition-all duration-200"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </motion.button>
                  </>
                )}

                {/* Product Tags */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {product.is_featured && (
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-2 rounded-full text-sm font-semibold shadow-lg"
                    >
                      ⭐ Featured
                    </motion.span>
                  )}
                  {product.is_new && (
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-2 rounded-full text-sm font-semibold shadow-lg"
                    >
                      🆕 New Arrival
                    </motion.span>
                  )}
                  {product.stock_quantity < 10 && product.stock_quantity > 0 && (
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-2 rounded-full text-sm font-semibold shadow-lg animate-pulse"
                    >
                      ⚠️ Only {product.stock_quantity} left!
                    </motion.span>
                  )}
                  {product.discount_percentage > 0 && (
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-2 rounded-full text-sm font-semibold shadow-lg"
                    >
                      {product.discount_percentage}% OFF
                    </motion.span>
                  )}
                </div>

                {/* Wishlist Button */}
                <motion.button
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className="absolute top-4 right-4 bg-white/90 hover:bg-white text-gray-600 hover:text-red-500 rounded-full p-3 shadow-lg transition-all duration-200"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                </motion.button>
              </div>

              {/* Thumbnail Images */}
              {images.length > 1 && (
                <div className="flex gap-3 mt-6 justify-center">
                  {images.map((img, index) => (
                    <motion.button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`w-20 h-20 border-2 rounded-xl overflow-hidden transition-all duration-300 ${
                        selectedImage === index 
                          ? 'border-blue-500 shadow-lg ring-2 ring-blue-200' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <img src={img} alt={`${product.name} view ${index + 1}`} className="w-full h-full object-cover" />
                    </motion.button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Product Details */}
          <div className="lg:w-1/2 p-8 overflow-y-auto bg-gradient-to-br from-gray-50 to-white">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1">
                <motion.h2 
                  className="text-3xl font-bold text-gray-900 mb-2"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {product.name}
                </motion.h2>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2 bg-yellow-50 px-3 py-2 rounded-xl">
                    {renderStars(displayRating, 'text-xl')}
                    <span className="text-xl font-semibold text-gray-900">{displayRating}</span>
                  </div>
                  <span className="text-gray-600 text-lg">({displayReviewCount} reviews)</span>
                  {realTimeRating && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      Live Rating
                    </span>
                  )}
                </div>
              </div>
              <motion.button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 text-3xl transition-colors duration-200 hover:scale-110 bg-gray-100 hover:bg-gray-200 rounded-full w-10 h-10 flex items-center justify-center"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-6 h-6" />
              </motion.button>
            </div>

            {/* Price and Stock */}
            <div className="mb-6">
              <div className="flex items-center gap-4 mb-2">
                <span className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Rs. {parseFloat(product.price || 0).toLocaleString()}
                </span>
                {product.stock_quantity > 0 ? (
                  <span className="text-green-600 font-semibold text-lg bg-green-50 px-3 py-1 rounded-full flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    In Stock ({product.stock_quantity} available)
                  </span>
                ) : (
                  <span className="text-red-500 font-semibold text-lg bg-red-50 px-3 py-1 rounded-full">
                    ❌ Out of Stock
                  </span>
                )}
              </div>
              {product.discount_percentage > 0 && (
                <div className="text-green-600 font-semibold text-lg">
                  🎉 You save {product.discount_percentage}% on this product!
                </div>
              )}
            </div>

            {/* Premium Features */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-2 bg-blue-50 p-3 rounded-lg">
                <Truck className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">Free Delivery</span>
              </div>
              <div className="flex items-center gap-2 bg-green-50 p-3 rounded-lg">
                <Shield className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-700">Secure Payment</span>
              </div>
              <div className="flex items-center gap-2 bg-purple-50 p-3 rounded-lg">
                <Zap className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-700">Fast Support</span>
              </div>
              <div className="flex items-center gap-2 bg-orange-50 p-3 rounded-lg">
                <Clock className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-medium text-orange-700">24/7 Available</span>
              </div>
            </div>

            {/* Quantity Selector */}
            {product.stock_quantity > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Quantity:</label>
                <div className="flex items-center gap-3">
                  <motion.button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center justify-center transition-all duration-200"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <span className="text-lg font-bold">-</span>
                  </motion.button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock_quantity, parseInt(e.target.value) || 1)))}
                    className="w-20 h-12 text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-semibold"
                    min="1"
                    max={product.stock_quantity}
                  />
                  <motion.button
                    onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                    className="w-12 h-12 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center justify-center transition-all duration-200"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <span className="text-lg font-bold">+</span>
                  </motion.button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 mb-8">
              <motion.button
                onClick={handleAddToCartWithQuantity}
                disabled={product.stock_quantity === 0 || isAddingToCart}
                className={`flex-1 py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg flex items-center justify-center gap-3 ${
                  product.stock_quantity === 0 || isAddingToCart
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                }`}
                whileHover={product.stock_quantity > 0 && !isAddingToCart ? { scale: 1.02 } : {}}
                whileTap={product.stock_quantity > 0 && !isAddingToCart ? { scale: 0.98 } : {}}
              >
                {isAddingToCart ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    Adding to Cart...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <ShoppingCart className="w-6 h-6" />
                    Add to Cart ({quantity})
                  </div>
                )}
              </motion.button>
              <motion.button
                onClick={onAddReview}
                className="flex-1 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-3"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Star className="w-6 h-6" />
                Write Review
              </motion.button>
            </div>

            {/* Enhanced Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <div className="flex gap-6">
                {['description', 'reviews', 'specifications', 'recommendations'].map(tab => (
                  <motion.button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-3 px-1 font-semibold capitalize transition-all duration-200 ${
                      activeTab === tab
                        ? 'text-blue-600 border-b-2 border-blue-500'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                    whileHover={{ scale: 1.05 }}
                  >
                    {tab === 'recommendations' ? '🤖 AI Recommendations' : tab}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="max-h-80 overflow-y-auto">
              {activeTab === 'description' && (
                <motion.div 
                  className="space-y-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <h4 className="text-lg font-semibold text-gray-900">Product Description</h4>
                  <p className="text-gray-700 leading-relaxed">{product.description || 'No description available for this product.'}</p>
                  
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl">
                      <h5 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                        <span>📂</span> Category
                      </h5>
                      <p className="text-blue-700">{product.category}</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl">
                      <h5 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                        <span>📊</span> Stock Status
                      </h5>
                      <p className="text-green-700">{product.stock_quantity} units available</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'reviews' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {reviewsLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                      <p className="text-gray-600 mt-2">Loading reviews...</p>
                    </div>
                  ) : displayReviews && displayReviews.stats ? (
                    <div className="space-y-6">
                      {/* Overall Rating Summary */}
                      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-xl">
                        <div className="flex items-center justify-between">
                          <div className="text-center">
                            <div className="text-4xl font-bold text-gray-900">{displayRating}</div>
                            <div className="flex items-center justify-center mt-1">
                              {renderStars(displayRating)}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">{displayReviewCount} reviews</div>
                          </div>
                          <div className="flex-1 ml-6">
                            {renderReviewBars(displayReviews.stats)}
                          </div>
                        </div>
                      </div>

                      {/* Reviews List */}
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Customer Reviews</h4>
                        {displayReviews.reviews && displayReviews.reviews.length > 0 ? (
                          <div className="space-y-4">
                            {displayReviews.reviews.slice(0, 5).map(review => (
                              <motion.div 
                                key={review.id} 
                                className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                                whileHover={{ scale: 1.02 }}
                              >
                                <div className="flex items-center gap-3 mb-3">
                                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                    <span className="text-white font-semibold text-sm">
                                      {review.user_name?.charAt(0).toUpperCase() || 'U'}
                                    </span>
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      {renderStars(review.rating, 'text-sm')}
                                      <span className="text-sm font-semibold text-gray-900">{review.rating}.0</span>
                                    </div>
                                    <p className="text-sm font-semibold text-gray-900">{review.user_name || 'Anonymous'}</p>
                                  </div>
                                </div>
                                <p className="text-gray-700 text-sm leading-relaxed mb-2">{review.comment}</p>
                                <span className="text-xs text-gray-500">
                                  {new Date(review.created_at).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </span>
                              </motion.div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 bg-gray-50 rounded-xl">
                            <div className="text-4xl mb-2">⭐</div>
                            <p className="text-gray-500 mb-4">No reviews yet. Be the first to review!</p>
                            <motion.button
                              onClick={onAddReview}
                              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              Write First Review
                            </motion.button>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-xl">
                      <p className="text-gray-500">No reviews available</p>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'specifications' && (
                <motion.div 
                  className="space-y-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <h4 className="text-lg font-semibold text-gray-900">Product Specifications</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl">
                      <h5 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                        <span>📂</span> Category
                      </h5>
                      <p className="text-blue-700">{product.category}</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl">
                      <h5 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                        <span>📦</span> Stock Quantity
                      </h5>
                      <p className="text-green-700">{product.stock_quantity} units</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl">
                      <h5 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                        <span>💰</span> Price
                      </h5>
                      <p className="text-purple-700">Rs. {parseFloat(product.price || 0).toLocaleString()}</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl">
                      <h5 className="font-semibold text-orange-900 mb-2 flex items-center gap-2">
                        <span>🆔</span> Product ID
                      </h5>
                      <p className="text-orange-700">#{product.id}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'recommendations' && (
                <motion.div 
                  className="space-y-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold text-gray-900">AI-Powered Recommendations</h4>
                    
                    {/* Algorithm Selector */}
                    <div className="flex gap-2">
                      {['ml', 'content', 'collaborative', 'popular'].map(algorithm => {
                        const info = getAlgorithmInfo(algorithm);
                        return (
                          <motion.button
                            key={algorithm}
                            onClick={() => setActiveAlgorithm(algorithm)}
                            className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                              activeAlgorithm === algorithm
                                ? `bg-gradient-to-r ${info.color} text-white shadow-lg`
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {info.icon} {info.name}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  {recommendationsLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                      <p className="text-gray-600 mt-2">Generating AI recommendations...</p>
                    </div>
                  ) : recommendations.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {recommendations.map(rec => (
                        <motion.div 
                          key={rec.id} 
                          className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
                          onClick={() => window.location.href = `/product/${rec.id}`}
                          whileHover={{ scale: 1.02, y: -2 }}
                        >
                          <img 
                            src={rec.mainImage || rec.image_urls?.[0] || rec.image_url} 
                            alt={rec.name}
                            className="w-full h-32 object-cover rounded-lg mb-3"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/200x200?text=No+Image';
                            }}
                          />
                          <h5 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">{rec.name}</h5>
                          <p className="text-blue-600 font-bold text-sm">Rs. {parseFloat(rec.price || 0).toLocaleString()}</p>
                          <div className="flex items-center gap-1 mt-2">
                            {renderStars(rec.rating || '0', 'text-xs')}
                            <span className="text-xs text-gray-500">({rec.reviewCount || 0})</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-xl">
                      <div className="text-4xl mb-2">🤖</div>
                      <p className="text-gray-500">No recommendations available</p>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProductModal;