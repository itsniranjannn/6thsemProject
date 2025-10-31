// frontend/src/components/ProductCard.js - PROFESSIONAL REDESIGN
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ShoppingCart, 
  Eye, 
  Star, 
  Heart,
  Zap,
  Shield,
  Truck
} from 'lucide-react';

const ProductCard = ({ product, onAddToCart, onViewDetails, onAddReview, compact = false }) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [realTimeRating, setRealTimeRating] = useState(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Fetch real-time rating when product changes
  useEffect(() => {
    if (product?.id) {
      fetchRealTimeRating();
    }
  }, [product?.id]);

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

  const getMainImage = () => {
    if (!product) return 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500';
    
    if (product.image_urls) {
      if (Array.isArray(product.image_urls)) {
        const validImages = product.image_urls.filter(url => url && url.trim() !== '');
        if (validImages.length > 0) return validImages[0];
      } else if (typeof product.image_urls === 'string') {
        try {
          const parsed = JSON.parse(product.image_urls);
          const validImages = Array.isArray(parsed) ? parsed.filter(url => url && url.trim() !== '') : [product.image_urls];
          if (validImages.length > 0) return validImages[0];
        } catch {
          if (product.image_urls.trim() !== '') return product.image_urls;
        }
      }
    }
    
    if (product.image_url && product.image_url.trim() !== '') {
      return product.image_url;
    }
    
    return 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500';
  };

  const mainImage = getMainImage();

  // Use real-time rating if available
  const displayRating = realTimeRating?.average || product.rating || "0.0";
  const displayReviewCount = realTimeRating?.total || product.reviewCount || 0;

  const formatNPR = (amount) => {
    const numAmount = parseFloat(amount || 0);
    return `Rs. ${numAmount.toLocaleString('en-NP')}`;
  };

  const renderStars = (ratingValue) => {
    const stars = [];
    const numericRating = parseFloat(ratingValue) || 0;
    
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={`text-sm ${
            i <= numericRating ? 'text-yellow-400' : 'text-gray-300'
          }`}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleWishlistToggle = (e) => {
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    // Add wishlist functionality here
  };

  // FIXED: Handle empty product case
  if (!product) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden animate-pulse">
        <div className="aspect-square bg-gray-200"></div>
        <div className="p-4">
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  // FIXED: Proper badge rendering
  const showFeaturedBadge = Boolean(product.is_featured);
  const showNewBadge = Boolean(product.is_new);
  const showDiscountBadge = product.discount_percentage > 0;

  if (compact) {
    return (
      <motion.div 
        className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden group cursor-pointer"
        whileHover={{ scale: 1.02, y: -5 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        {/* Product Image */}
        <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
          {imageLoading && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          )}
          <motion.img
            src={imageError ? 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500' : mainImage}
            alt={product.name}
            className={`w-full h-full object-cover transition-all duration-500 ${
              imageLoading ? 'opacity-0' : 'opacity-100'
            }`}
            onLoad={handleImageLoad}
            onError={handleImageError}
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.3 }}
          />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col space-y-1">
            {showFeaturedBadge && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg"
              >
                ⭐ Featured
              </motion.span>
            )}
            {showNewBadge && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg"
              >
                🆕 New
              </motion.span>
            )}
            {showDiscountBadge && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg"
              >
                {product.discount_percentage}% OFF
              </motion.span>
            )}
          </div>

          {/* Stock Badge */}
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-bold shadow-lg ${
              product.stock_quantity > 10 
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                : product.stock_quantity > 0
                ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
                : 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
            }`}
          >
            {product.stock_quantity > 10 ? 'In Stock' : product.stock_quantity > 0 ? `${product.stock_quantity} left` : 'Out of Stock'}
          </motion.div>

          {/* Wishlist Button */}
          <motion.button
            onClick={handleWishlistToggle}
            className="absolute top-3 right-3 bg-white/90 hover:bg-white text-gray-600 hover:text-red-500 rounded-full p-2 shadow-lg transition-all duration-200"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
          </motion.button>

          {/* Quick View Overlay */}
          <motion.div 
            className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
          >
            <motion.button
              onClick={() => onViewDetails(product)}
              className="bg-white text-gray-800 px-4 py-2 rounded-lg font-medium shadow-lg flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Eye className="w-4 h-4" />
              Quick View
            </motion.button>
          </motion.div>
        </div>

        {/* Product Info */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2 h-10 hover:text-blue-600 transition-colors cursor-pointer"
              onClick={() => onViewDetails(product)}>
            {product.name}
          </h3>
          
          <p className="text-gray-600 text-xs mb-2 line-clamp-1">
            {product.category}
          </p>

          {/* Rating */}
          <div className="flex items-center space-x-1 mb-2">
            <div className="flex items-center space-x-1">
              {renderStars(displayRating)}
            </div>
            <span className="text-xs text-gray-600">
              {displayRating}
              {displayReviewCount > 0 && (
                <span className="ml-1">({displayReviewCount})</span>
              )}
            </span>
            {realTimeRating && (
              <span className="text-xs bg-green-100 text-green-800 px-1 rounded">Live</span>
            )}
          </div>

          {/* Price */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-lg font-bold text-gray-900">
              {formatNPR(product.price)}
            </span>
            {showDiscountBadge && (
              <span className="text-sm text-green-600 font-semibold">
                Save {product.discount_percentage}%
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <motion.button
              onClick={() => onViewDetails(product)}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg text-xs font-medium transition-all duration-200 border border-gray-300 flex items-center justify-center gap-1"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Eye className="w-3 h-3" />
              Details
            </motion.button>
            <motion.button
              onClick={() => onAddToCart(product)}
              disabled={product.stock_quantity === 0}
              className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all duration-200 flex items-center justify-center gap-1 ${
                product.stock_quantity === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
              }`}
              whileHover={product.stock_quantity > 0 ? { scale: 1.05 } : {}}
              whileTap={product.stock_quantity > 0 ? { scale: 0.95 } : {}}
            >
              <ShoppingCart className="w-3 h-3" />
              {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden group cursor-pointer"
      whileHover={{ scale: 1.02, y: -5 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Product Image */}
      <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
        {imageLoading && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        )}
        <motion.img
          src={imageError ? 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500' : mainImage}
          alt={product.name}
          className={`w-full h-full object-cover transition-all duration-500 ${
            imageLoading ? 'opacity-0' : 'opacity-100'
          }`}
          onLoad={handleImageLoad}
          onError={handleImageError}
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.3 }}
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col space-y-2">
          {showFeaturedBadge && (
            <motion.span 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg"
            >
              ⭐ Featured
            </motion.span>
          )}
          {showNewBadge && (
            <motion.span 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg"
            >
              🆕 New
            </motion.span>
          )}
          {showDiscountBadge && (
            <motion.span 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg"
            >
              {product.discount_percentage}% OFF
            </motion.span>
          )}
        </div>

        {/* Stock Badge */}
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={`absolute top-3 right-3 px-3 py-1 rounded-full text-sm font-bold shadow-lg ${
            product.stock_quantity > 10 
              ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
              : product.stock_quantity > 0
              ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
              : 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
          }`}
        >
          {product.stock_quantity > 10 ? 'In Stock' : product.stock_quantity > 0 ? `${product.stock_quantity} left` : 'Out of Stock'}
        </motion.div>

        {/* Wishlist Button */}
        <motion.button
          onClick={handleWishlistToggle}
          className="absolute top-3 right-3 bg-white/90 hover:bg-white text-gray-600 hover:text-red-500 rounded-full p-2 shadow-lg transition-all duration-200"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
        </motion.button>

        {/* Quick Actions Overlay */}
        <motion.div 
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex space-x-2">
            <motion.button
              onClick={() => onViewDetails(product)}
              className="flex-1 bg-white/20 hover:bg-white/30 text-white py-3 rounded-lg text-sm font-medium backdrop-blur-sm transition-all duration-200 border border-white/30 flex items-center justify-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Eye className="w-4 h-4" />
              Quick View
            </motion.button>
            <motion.button
              onClick={() => onAddReview(product)}
              className="px-4 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Star className="w-4 h-4" />
              Review
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Product Info */}
      <div className="p-6">
        <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2 h-14 hover:text-blue-600 transition-colors cursor-pointer"
            onClick={() => onViewDetails(product)}>
          {product.name}
        </h3>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.description || 'No description available'}
        </p>

        {/* Rating and Reviews */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 bg-yellow-50 px-2 py-1 rounded-lg">
              {renderStars(displayRating)}
              <span className="text-sm font-semibold text-gray-900 ml-1">{displayRating}</span>
            </div>
            <span className="text-sm text-gray-600">
              {displayReviewCount > 0 ? `${displayReviewCount} reviews` : 'No reviews yet'}
            </span>
            {realTimeRating && (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Live Rating</span>
            )}
          </div>
          {product.tags && Array.isArray(product.tags) && product.tags.length > 0 && product.tags[0] && product.tags[0].trim() !== '' && (
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
              {product.tags[0]}
            </span>
          )}
        </div>

        {/* Price */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-gray-900">
              {formatNPR(product.price)}
            </span>
            {product.original_price && product.original_price > product.price && (
              <span className="text-sm text-gray-500 line-through">
                {formatNPR(product.original_price)}
              </span>
            )}
          </div>
          {showDiscountBadge && (
            <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full font-semibold">
              Save {product.discount_percentage}%
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <motion.button
            onClick={() => onViewDetails(product)}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-medium transition-all duration-200 border border-gray-300 flex items-center justify-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Eye className="w-4 h-4" />
            View Details
          </motion.button>
          <motion.button
            onClick={() => onAddToCart(product)}
            disabled={product.stock_quantity === 0}
            className={`flex-1 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg flex items-center justify-center gap-2 ${
              product.stock_quantity === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white hover:shadow-xl'
            }`}
            whileHover={product.stock_quantity > 0 ? { scale: 1.05 } : {}}
            whileTap={product.stock_quantity > 0 ? { scale: 0.95 } : {}}
          >
            <ShoppingCart className="w-4 h-4" />
            {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;