import React, { useState } from 'react';

const ProductCard = ({ product, onAddToCart, onViewDetails, onAddReview, compact = false }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Enhanced image handling with multiple URLs
  const images = product.image_urls && product.image_urls.length > 0 
    ? product.image_urls.filter(url => url && url.trim() !== '')
    : [product.image_url || 'https://via.placeholder.com/400x400?text=No+Image'];

  const handleAddToCart = async () => {
    if (added) return;
    setIsAdding(true);
    await onAddToCart(product);
    setIsAdding(false);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const renderStars = (rating) => {
    const stars = [];
    const numericRating = parseFloat(rating);
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

  const getDiscountPrice = () => {
    if (product.discount_percentage && product.discount_percentage > 0) {
      const discountAmount = (product.price * product.discount_percentage) / 100;
      return product.price - discountAmount;
    }
    return null;
  };

  const discountPrice = getDiscountPrice();

  // 🧩 Compact card (for recommendations)
  if (compact) {
    return (
      <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden group">
        <div className="relative overflow-hidden">
          <img
            src={images[currentImageIndex]}
            alt={product.name}
            className={`w-full h-32 object-cover transition-transform duration-500 group-hover:scale-110 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
          />
          
          {/* Image Navigation for Multiple Images */}
          {images.length > 1 && (
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-between px-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex(currentImageIndex > 0 ? currentImageIndex - 1 : images.length - 1);
                }}
                className="opacity-0 group-hover:opacity-100 bg-white/80 hover:bg-white text-gray-800 rounded-full p-1 transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex(currentImageIndex < images.length - 1 ? currentImageIndex + 1 : 0);
                }}
                className="opacity-0 group-hover:opacity-100 bg-white/80 hover:bg-white text-gray-800 rounded-full p-1 transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}

          {/* Product Tags */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.is_new && (
              <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                🆕 New
              </span>
            )}
            {product.is_featured && (
              <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                ⭐ Featured
              </span>
            )}
            {discountPrice && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                🔥 {product.discount_percentage}% OFF
              </span>
            )}
          </div>
        </div>

        <div className="p-3">
          <h3 className="font-semibold text-gray-900 text-sm mb-1 truncate">{product.name}</h3>
          <div className="flex items-center mb-1">
            <div className="flex">{renderStars(product.rating)}</div>
            <span className="text-xs text-gray-500 ml-1">({product.reviewCount})</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              {discountPrice ? (
                <>
                  <span className="text-lg font-bold text-red-600">Rs. {discountPrice.toFixed(0)}</span>
                  <span className="text-xs text-gray-500 line-through">Rs. {product.price}</span>
                </>
              ) : (
                <span className="text-lg font-bold text-gray-900">Rs. {product.price}</span>
              )}
            </div>
            <button
              onClick={handleAddToCart}
              disabled={isAdding}
              className={`p-2 rounded-lg transition-all duration-200 ${
                added
                  ? 'bg-green-500 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              } disabled:opacity-50`}
            >
              {isAdding ? '...' : added ? '✓' : '+'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 🧩 Full card (main grid)
  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden group border border-gray-100">
      <div className="relative overflow-hidden">
        <img
          src={images[currentImageIndex]}
          alt={product.name}
          className={`w-full h-48 object-cover transition-transform duration-700 group-hover:scale-110 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
        />
        
        {/* Image Navigation for Multiple Images */}
        {images.length > 1 && (
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-between px-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCurrentImageIndex(currentImageIndex > 0 ? currentImageIndex - 1 : images.length - 1);
              }}
              className="opacity-0 group-hover:opacity-100 bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 transition-all duration-200 shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCurrentImageIndex(currentImageIndex < images.length - 1 ? currentImageIndex + 1 : 0);
              }}
              className="opacity-0 group-hover:opacity-100 bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 transition-all duration-200 shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}

        {/* Image Indicators */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-1">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex(index);
                }}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}

        {/* Product Tags */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.is_new && (
            <span className="bg-green-500 text-white text-xs px-3 py-1 rounded-full font-medium shadow-sm">
              🆕 New Arrival
            </span>
          )}
          {product.is_featured && (
            <span className="bg-blue-500 text-white text-xs px-3 py-1 rounded-full font-medium shadow-sm">
              ⭐ Featured
            </span>
          )}
          {discountPrice && (
            <span className="bg-red-500 text-white text-xs px-3 py-1 rounded-full font-medium shadow-sm">
              🔥 {product.discount_percentage}% OFF
            </span>
          )}
        </div>

        {/* Stock Status */}
        {product.stock_quantity === 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold">
              Out of Stock
            </span>
          </div>
        )}

        {added && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 animate-fade-in">
            <div className="bg-white rounded-full p-4 shadow-lg">
              <span className="text-green-600 text-2xl font-bold animate-bounce">✓</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-5">
        <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
          {product.name}
        </h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>

        {/* Category and Tags */}
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
            {product.category}
          </span>
          {product.tags && product.tags.map((tag, index) => (
            <span key={index} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full font-medium">
              #{tag}
            </span>
          ))}
        </div>

        <div className="flex items-center mb-3">
          <div className="flex">{renderStars(product.rating)}</div>
          <span className="text-sm text-gray-500 ml-2">({product.reviewCount} reviews)</span>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div>
            {discountPrice ? (
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-red-600">Rs. {discountPrice.toFixed(0)}</span>
                <span className="text-sm text-gray-500 line-through">Rs. {product.price}</span>
              </div>
            ) : (
              <span className="text-2xl font-bold text-gray-900">Rs. {product.price}</span>
            )}
            {product.stock_quantity < 10 && product.stock_quantity > 0 && (
              <span className="text-xs text-orange-500 ml-2">
                Only {product.stock_quantity} left!
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onViewDetails}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm"
            >
              Details
            </button>
            <button
              onClick={handleAddToCart}
              disabled={isAdding || product.stock_quantity === 0}
              className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 transform text-sm ${
                added
                  ? 'bg-green-500 text-white'
                  : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white'
              } hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
            >
              {isAdding ? (
                <span className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Adding...
                </span>
              ) : added ? (
                '✓ Added!'
              ) : product.stock_quantity === 0 ? (
                'Out of Stock'
              ) : (
                'Add to Cart'
              )}
            </button>
          </div>
        </div>

        <button
          onClick={onAddReview}
          className="w-full mt-3 text-center text-blue-500 hover:text-blue-600 text-sm font-medium transition-colors duration-200"
        >
          Write a Review
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
