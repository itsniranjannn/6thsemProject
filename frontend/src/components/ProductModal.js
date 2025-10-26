import React, { useState, useEffect } from 'react';

const ProductModal = ({ product, reviews, reviewsLoading, onClose, onAddToCart, onAddReview }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState('description');
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [activeAlgorithm, setActiveAlgorithm] = useState('ml');
  const [realTimeRating, setRealTimeRating] = useState(null);

  // Enhanced images handling with multiple URLs - FIXED
  const getProductImages = () => {
    if (!product) return ['https://via.placeholder.com/400x400?text=No+Image'];
    
    let images = [];
    
    // Handle image_urls array
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
    
    // Fallback to single image_url
    if (images.length === 0 && product.image_url) {
      images = [product.image_url];
    }
    
    // Final fallback
    if (images.length === 0) {
      images = ['https://via.placeholder.com/400x400?text=No+Image'];
    }
    
    return images;
  };

  const images = getProductImages();

  // Fetch real-time rating - FIXED
  useEffect(() => {
    fetchRealTimeRating();
  }, [product?.id]);

  // Fetch recommendations when modal opens - FIXED: Enhanced ML algorithm
  useEffect(() => {
    if (product?.id) {
      fetchRecommendations();
    }
  }, [product?.id, activeAlgorithm]);

  const fetchRealTimeRating = async () => {
    if (!product?.id) return;
    
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/reviews/product/${product.id}`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.stats) {
          setRealTimeRating({
            average: parseFloat(data.stats.average_rating || product.rating || 0).toFixed(1),
            total: data.stats.total_reviews || product.reviewCount || 0
          });
        }
      }
    } catch (error) {
      console.error('Error fetching real-time rating:', error);
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
          apiUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/recommendations/product/${product.id}?algorithm=ml&limit=3`;
          break;
        case 'content':
          apiUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/recommendations/product/${product.id}?algorithm=content&limit=3`;
          break;
        case 'collaborative':
          apiUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/recommendations/user/personalized?limit=3`;
          break;
        case 'popular':
          apiUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/recommendations/popular?limit=3`;
          break;
        default:
          apiUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/recommendations/product/${product.id}?algorithm=ml&limit=3`;
      }

      const response = await fetch(apiUrl, { headers });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.recommendations) {
          // Process recommendations with proper image handling - FIXED for ML algorithm
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
      // Enhanced fallback for ML algorithm
      if (activeAlgorithm === 'ml') {
        // Use content-based as fallback for ML
        try {
          const fallbackResponse = await fetch(
            `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/recommendations/product/${product.id}?algorithm=content&limit=3`
          );
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json();
            if (fallbackData.success && fallbackData.recommendations) {
              setRecommendations(fallbackData.recommendations.map(rec => ({
                ...rec,
                mainImage: rec.image_url || 'https://via.placeholder.com/200x200?text=No+Image',
                rating: parseFloat(rec.rating || 0).toFixed(1)
              })));
            }
          }
        } catch (fallbackError) {
          console.error('Fallback recommendation error:', fallbackError);
        }
      }
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
            className="bg-yellow-400 h-2 rounded-full" 
            style={{ width: total ? `${(bar.count / total) * 100}%` : '0%' }}
          ></div>
        </div>
        <span className="text-sm text-gray-600 w-12">{bar.count}</span>
      </div>
    ));
  };

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

  // Use real-time rating if available
  const displayRating = realTimeRating?.average || product.rating || "0.0";
  const displayReviewCount = realTimeRating?.total || product.reviewCount || 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 animate-fade-in backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-6xl w-full max-h-[95vh] overflow-hidden animate-scale-in shadow-2xl border border-gray-100">
        <div className="flex flex-col lg:flex-row h-full">
          {/* Product Images - FIXED: Enhanced multiple image support */}
          <div className="lg:w-1/2 p-8">
            <div className="relative group">
              {/* Main Image */}
              <div className="relative overflow-hidden rounded-2xl bg-gray-100">
                <img
                  src={images[selectedImage]}
                  alt={product.name}
                  className="w-full h-96 object-cover transition-transform duration-500 group-hover:scale-105"
                />
                
                {/* Image Navigation Arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setSelectedImage(selectedImage > 0 ? selectedImage - 1 : images.length - 1)}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setSelectedImage(selectedImage < images.length - 1 ? selectedImage + 1 : 0)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}

                {/* Product Tags - FIXED: Proper conditional rendering */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {product.is_featured && (
                    <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                      ⭐ Featured
                    </span>
                  )}
                  {product.is_new && (
                    <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                      🆕 New Arrival
                    </span>
                  )}
                  {product.stock_quantity < 10 && product.stock_quantity > 0 && (
                    <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg animate-pulse">
                      ⚠️ Only {product.stock_quantity} left!
                    </span>
                  )}
                </div>
              </div>

              {/* Thumbnail Images - FIXED: Show only if multiple images */}
              {images.length > 1 && (
                <div className="flex gap-3 mt-6 justify-center">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`w-20 h-20 border-2 rounded-xl overflow-hidden transition-all duration-300 transform hover:scale-110 ${
                        selectedImage === index 
                          ? 'border-blue-500 shadow-lg ring-2 ring-blue-200' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <img src={img} alt={`${product.name} view ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
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
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h2>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    {renderStars(displayRating, 'text-xl')}
                    <span className="text-xl font-semibold text-gray-900">{displayRating}</span>
                  </div>
                  <span className="text-gray-600 text-lg">({displayReviewCount} reviews)</span>
                  {realTimeRating && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      Live
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 text-3xl transition-colors duration-200 hover:scale-110"
              >
                ×
              </button>
            </div>

            {/* Price and Stock */}
            <div className="mb-6">
              <div className="flex items-center gap-4 mb-2">
                <span className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Rs. {parseFloat(product.price || 0).toLocaleString()}
                </span>
                {product.stock_quantity > 0 && (
                  <span className="text-green-600 font-semibold text-lg">
                    ✓ In Stock ({product.stock_quantity} available)
                  </span>
                )}
              </div>
              {product.stock_quantity === 0 && (
                <span className="text-red-500 font-semibold text-lg">❌ Out of Stock</span>
              )}
            </div>

            {/* Quantity Selector */}
            {product.stock_quantity > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Quantity:</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center justify-center transition-colors duration-200"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock_quantity, parseInt(e.target.value) || 1)))}
                    className="w-20 h-10 text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="1"
                    max={product.stock_quantity}
                  />
                  <button
                    onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                    className="w-10 h-10 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center justify-center transition-colors duration-200"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 mb-8">
              <button
                onClick={handleAddToCartWithQuantity}
                disabled={product.stock_quantity === 0 || isAddingToCart}
                className={`flex-1 py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg ${
                  product.stock_quantity === 0 || isAddingToCart
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white'
                }`}
              >
                {isAddingToCart ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Adding...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                    </svg>
                    Add to Cart
                  </div>
                )}
              </button>
              <button
                onClick={onAddReview}
                className="flex-1 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105"
              >
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  Write Review
                </div>
              </button>
            </div>

            {/* Enhanced Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <div className="flex gap-6">
                {['description', 'reviews', 'specifications', 'recommendations'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-3 px-1 font-semibold capitalize transition-all duration-200 ${
                      activeTab === tab
                        ? 'text-blue-600 border-b-2 border-blue-500'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab === 'recommendations' ? '🤖 AI Recommendations' : tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="max-h-80 overflow-y-auto">
              {activeTab === 'description' && (
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900">Product Description</h4>
                  <p className="text-gray-700 leading-relaxed">{product.description}</p>
                  
                  {/* Product Features */}
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="bg-blue-50 p-4 rounded-xl">
                      <h5 className="font-semibold text-blue-900 mb-2">📦 Category</h5>
                      <p className="text-blue-700">{product.category}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-xl">
                      <h5 className="font-semibold text-green-900 mb-2">📊 Stock Status</h5>
                      <p className="text-green-700">{product.stock_quantity} units available</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div>
                  {reviewsLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                      <p className="text-gray-600 mt-2">Loading reviews...</p>
                    </div>
                  ) : reviews && reviews.stats ? (
                    <div className="space-y-6">
                      {/* Rating Distribution */}
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Rating Distribution</h4>
                        <div className="bg-gray-50 p-4 rounded-xl">
                          {renderReviewBars(reviews.stats)}
                        </div>
                      </div>

                      {/* Reviews List */}
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Customer Reviews</h4>
                        {reviews.reviews && reviews.reviews.length > 0 ? (
                          <div className="space-y-4">
                            {reviews.reviews.slice(0, 5).map(review => (
                              <div key={review.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                                <div className="flex items-center gap-3 mb-3">
                                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                    <span className="text-white font-semibold text-sm">
                                      {review.user_name?.charAt(0).toUpperCase() || 'U'}
                                    </span>
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      {renderStars(review.rating, 'text-sm')}
                                    </div>
                                    <p className="text-sm font-semibold text-gray-900">{review.user_name || 'Anonymous'}</p>
                                  </div>
                                </div>
                                <p className="text-gray-700 text-sm leading-relaxed mb-2">{review.comment}</p>
                                <span className="text-xs text-gray-500">
                                  {new Date(review.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 bg-gray-50 rounded-xl">
                            <div className="text-4xl mb-2">⭐</div>
                            <p className="text-gray-500">No reviews yet. Be the first to review!</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-xl">
                      <p className="text-gray-500">No reviews available</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'specifications' && (
                <div className="space-y-6">
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
                </div>
              )}

              {activeTab === 'recommendations' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold text-gray-900">AI-Powered Recommendations</h4>
                    
                    {/* Algorithm Selector */}
                    <div className="flex gap-2">
                      {['ml', 'content', 'collaborative', 'popular'].map(algorithm => {
                        const info = getAlgorithmInfo(algorithm);
                        return (
                          <button
                            key={algorithm}
                            onClick={() => setActiveAlgorithm(algorithm)}
                            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
                              activeAlgorithm === algorithm
                                ? `bg-gradient-to-r ${info.color} text-white shadow-lg`
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {info.icon}
                          </button>
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {recommendations.map(rec => (
                        <div key={rec.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
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
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-xl">
                      <div className="text-4xl mb-2">🤖</div>
                      <p className="text-gray-500">No recommendations available</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-in {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default ProductModal;