import React, { useState } from 'react';

const ProductCard = ({ product, onAddToCart, onViewDetails, onAddReview, compact = false }) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Enhanced image handling with proper fallbacks
  const getMainImage = () => {
    if (!product) return 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500';
    
    // Handle image_urls array or single image_url
    if (product.image_urls && Array.isArray(product.image_urls) && product.image_urls.length > 0) {
      return product.image_urls[0];
    }
    if (product.image_urls && typeof product.image_urls === 'string') {
      try {
        const parsed = JSON.parse(product.image_urls);
        return Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : product.image_url;
      } catch {
        return product.image_url;
      }
    }
    return product.image_url || 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500';
  };

  const mainImage = getMainImage();

  // Enhanced rating handling - FIXED: Proper default values
  const rating = product && product.rating ? parseFloat(product.rating).toFixed(1) : "0.0";
  const reviewCount = product?.reviewCount || 0;

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

  if (compact) {
    return (
      <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-100 overflow-hidden">
        {/* Product Image */}
        <div className="relative aspect-square bg-gray-100 overflow-hidden">
          {imageLoading && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          )}
          <img
            src={imageError ? 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500' : mainImage}
            alt={product.name}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              imageLoading ? 'opacity-0' : 'opacity-100'
            }`}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
          
          {/* Badges - FIXED: Proper conditional rendering */}
          <div className="absolute top-3 left-3 flex flex-col space-y-1">
            {product.is_featured && (
              <span className="bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                ⭐ Featured
              </span>
            )}
            {product.is_new && (
              <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                🆕 New
              </span>
            )}
            {product.discount_percentage > 0 && (
              <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                {product.discount_percentage}% OFF
              </span>
            )}
          </div>

          {/* Stock Badge */}
          <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-bold ${
            product.stock_quantity > 10 
              ? 'bg-green-500 text-white'
              : product.stock_quantity > 0
              ? 'bg-yellow-500 text-white'
              : 'bg-red-500 text-white'
          }`}>
            {product.stock_quantity > 10 ? 'In Stock' : product.stock_quantity > 0 ? `${product.stock_quantity} left` : 'Out of Stock'}
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2 h-10">
            {product.name}
          </h3>
          
          <p className="text-gray-600 text-xs mb-2 line-clamp-2 h-8">
            {product.category}
          </p>

          {/* Rating - FIXED: Proper rating display */}
          <div className="flex items-center space-x-1 mb-2">
            {renderStars(rating)}
            <span className="text-xs text-gray-600 ml-1">
              ({rating}) {reviewCount > 0 && `• ${reviewCount}`}
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-lg font-bold text-gray-900">
              {formatNPR(product.price)}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <button
              onClick={() => onViewDetails(product)}
              className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 py-2 rounded-lg text-xs font-medium transition-colors duration-200"
            >
              View
            </button>
            <button
              onClick={() => onAddToCart(product)}
              disabled={product.stock_quantity === 0}
              className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors duration-200 ${
                product.stock_quantity === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
              }`}
            >
              {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-100 overflow-hidden">
      {/* Product Image */}
      <div className="relative aspect-square bg-gray-100 overflow-hidden">
        {imageLoading && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        )}
        <img
          src={imageError ? 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500' : mainImage}
          alt={product.name}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            imageLoading ? 'opacity-0' : 'opacity-100'
          }`}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
        
        {/* Badges - FIXED: Proper conditional rendering */}
        <div className="absolute top-3 left-3 flex flex-col space-y-1">
          {product.is_featured && (
            <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
              ⭐ Featured
            </span>
          )}
          {product.is_new && (
            <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
              🆕 New
            </span>
          )}
          {product.discount_percentage > 0 && (
            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
              {product.discount_percentage}% OFF
            </span>
          )}
        </div>

        {/* Stock Badge */}
        <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-sm font-bold shadow-lg ${
          product.stock_quantity > 10 
            ? 'bg-green-500 text-white'
            : product.stock_quantity > 0
            ? 'bg-yellow-500 text-white'
            : 'bg-red-500 text-white'
        }`}>
          {product.stock_quantity > 10 ? 'In Stock' : product.stock_quantity > 0 ? `${product.stock_quantity} left` : 'Out of Stock'}
        </div>

        {/* Quick Actions Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 opacity-0 hover:opacity-100 transition-opacity duration-300">
          <div className="flex space-x-2">
            <button
              onClick={() => onViewDetails(product)}
              className="flex-1 bg-white/20 hover:bg-white/30 text-white py-2 rounded-lg text-sm font-medium backdrop-blur-sm transition-colors"
            >
              Quick View
            </button>
            <button
              onClick={() => onAddReview(product)}
              className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              ⭐
            </button>
          </div>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-6">
        <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2 h-14">
          {product.name}
        </h3>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2 h-10">
          {product.category}
        </p>

        {/* Rating and Reviews - FIXED: Proper rating display */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              {renderStars(rating)}
            </div>
            <span className="text-sm text-gray-600">
              {rating} {reviewCount > 0 && `(${reviewCount})`}
            </span>
          </div>
          {/* FIXED: Tags display - only show if tags exist */}
          {product.tags && product.tags.length > 0 && product.tags[0] && (
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
              {Array.isArray(product.tags) ? product.tags[0] : product.tags}
            </span>
          )}
        </div>

        {/* Price */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-2xl font-bold text-gray-900">
            {formatNPR(product.price)}
          </span>
          {product.original_price && product.original_price > product.price && (
            <span className="text-sm text-gray-500 line-through">
              {formatNPR(product.original_price)}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={() => onViewDetails(product)}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-medium transition-colors duration-200 transform hover:scale-105"
          >
            View Details
          </button>
          <button
            onClick={() => onAddToCart(product)}
            disabled={product.stock_quantity === 0}
            className={`flex-1 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 ${
              product.stock_quantity === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
            }`}
          >
            {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;