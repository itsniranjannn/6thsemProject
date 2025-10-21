import React, { useState } from 'react';

const ProductModal = ({ product, reviews, reviewsLoading, onClose, onAddToCart, onAddReview }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState('description');

  const images = [
    product.image_url,
    product.image_url, // In real app, you'd have multiple images
    product.image_url
  ];

  const renderStars = (rating, size = 'text-lg') => {
    const stars = [];
    const numericRating = parseFloat(rating);
    
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
    
    const total = stats.total_reviews;
    const bars = [
      { stars: 5, count: stats.five_star },
      { stars: 4, count: stats.four_star },
      { stars: 3, count: stats.three_star },
      { stars: 2, count: stats.two_star },
      { stars: 1, count: stats.one_star }
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-scale-in">
        <div className="flex flex-col lg:flex-row">
          {/* Product Images */}
          <div className="lg:w-1/2 p-6">
            <div className="relative">
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-80 object-cover rounded-xl"
              />
              <div className="flex gap-2 mt-4">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-16 h-16 border-2 rounded-lg overflow-hidden ${
                      selectedImage === index ? 'border-blue-500' : 'border-gray-300'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="lg:w-1/2 p-6 overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-gray-900">{product.name}</h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Rating Summary */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                {renderStars(product.rating)}
                <span className="text-lg font-semibold text-gray-900">{product.rating}</span>
              </div>
              <span className="text-gray-600">({product.reviewCount} reviews)</span>
            </div>

            <div className="mb-6">
              <span className="text-3xl font-bold text-gray-900">${product.price}</span>
              {product.stock_quantity < 10 && product.stock_quantity > 0 && (
                <span className="text-sm text-orange-500 ml-2">Only {product.stock_quantity} left!</span>
              )}
            </div>

            <p className="text-gray-600 mb-6">{product.description}</p>

            <div className="flex gap-3 mb-6">
              <button
                onClick={() => onAddToCart(product)}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold transition-colors duration-200"
              >
                Add to Cart
              </button>
              <button
                onClick={onAddReview}
                className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 py-3 px-6 rounded-xl font-semibold transition-colors duration-200"
              >
                Write Review
              </button>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-4">
              <div className="flex gap-6">
                {['description', 'reviews', 'specifications'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-3 px-1 font-medium capitalize ${
                      activeTab === tab
                        ? 'text-blue-500 border-b-2 border-blue-500'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="max-h-60 overflow-y-auto">
              {activeTab === 'description' && (
                <div>
                  <h4 className="font-semibold mb-2">Product Description</h4>
                  <p className="text-gray-600">{product.description}</p>
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
                    <div>
                      {/* Rating Distribution */}
                      <div className="mb-6">
                        <h4 className="font-semibold mb-3">Rating Distribution</h4>
                        {renderReviewBars(reviews.stats)}
                      </div>

                      {/* Reviews List */}
                      <div>
                        <h4 className="font-semibold mb-3">Customer Reviews</h4>
                        {reviews.reviews && reviews.reviews.length > 0 ? (
                          <div className="space-y-4">
                            {reviews.reviews.slice(0, 5).map(review => (
                              <div key={review.id} className="border-b border-gray-200 pb-4">
                                <div className="flex items-center gap-2 mb-2">
                                  {renderStars(review.rating, 'text-sm')}
                                  <span className="text-sm font-semibold">{review.user_name}</span>
                                </div>
                                <p className="text-gray-600 text-sm">{review.comment}</p>
                                <span className="text-xs text-gray-500">
                                  {new Date(review.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-center py-4">No reviews yet. Be the first to review!</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No reviews available</p>
                  )}
                </div>
              )}

              {activeTab === 'specifications' && (
                <div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-semibold">Category:</span>
                      <p className="text-gray-600">{product.category}</p>
                    </div>
                    <div>
                      <span className="font-semibold">Stock:</span>
                      <p className="text-gray-600">{product.stock_quantity} units</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;