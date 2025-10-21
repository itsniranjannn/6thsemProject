import React, { useState } from 'react';

const ProductCard = ({ product, onAddToCart, onViewDetails, onAddReview, compact = false }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);

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

  // 🧩 Compact card (for recommendations)
  if (compact) {
    return (
      <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden group">
        <div className="relative overflow-hidden">
          <img
            src={product.image_url}
            alt={product.name}
            className={`w-full h-32 object-cover transition-transform duration-500 group-hover:scale-110 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
          />
          {product.isNew && (
            <span className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
              New
            </span>
          )}
          {product.isFeatured && (
            <span className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
              Featured
            </span>
          )}
        </div>

        <div className="p-3">
          <h3 className="font-semibold text-gray-900 text-sm mb-1 truncate">{product.name}</h3>
          <div className="flex items-center mb-1">
            <div className="flex">{renderStars(product.rating)}</div>
            <span className="text-xs text-gray-500 ml-1">({product.reviewCount})</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-gray-900">Rs. {product.price}</span>
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
          src={product.image_url}
          alt={product.name}
          className={`w-full h-48 object-cover transition-transform duration-700 group-hover:scale-110 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
        />
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.isNew && (
            <span className="bg-green-500 text-white text-xs px-3 py-1 rounded-full font-medium shadow-sm">
              New Arrival
            </span>
          )}
          {product.isFeatured && (
            <span className="bg-blue-500 text-white text-xs px-3 py-1 rounded-full font-medium shadow-sm">
              Featured
            </span>
          )}
        </div>
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

        <div className="flex items-center mb-3">
          <div className="flex">{renderStars(product.rating)}</div>
          <span className="text-sm text-gray-500 ml-2">({product.reviewCount} reviews)</span>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div>
            <span className="text-2xl font-bold text-gray-900">Rs. {product.price}</span>
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
