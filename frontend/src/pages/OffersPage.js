// frontend/src/pages/OffersPage.js - COMPLETELY FIXED VERSION
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toast } from '../components/Toast.js';
import { useCart } from '../context/CartContext.js';
import { useAuth } from '../context/AuthContext.js';
import SupportWidget from '../components/SupportWidget.js';

const OffersPage = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchOffers();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: 'success' }), 4000);
  };

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/offers`
      );
      
      if (response.ok) {
        const data = await response.json();
        console.log('🎯 Offers data:', data);
        setOffers(data);
      } else {
        showToast('Failed to load offers', 'error');
      }
    } catch (error) {
      console.error('Error fetching offers:', error);
      showToast('Error loading offers', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Calculate offer details
  const calculateOfferDetails = (offer) => {
    const originalPrice = parseFloat(offer.price);
    let finalPrice = originalPrice;
    let quantity = 1;
    let description = '';
    let savings = 0;

    switch (offer.offer_type) {
      case 'Bogo':
        quantity = 2; // Add 2 items for BOGO
        finalPrice = originalPrice; // Pay for only 1
        savings = originalPrice; // Save the price of one item
        description = offer.description || 'Buy One Get One Free - Get 2 for price of 1!';
        break;
        
      case 'flat_discount':
        if (offer.discount_amount) {
          finalPrice = Math.max(0, originalPrice - offer.discount_amount);
          savings = offer.discount_amount;
          description = offer.description || `Flat Rs. ${offer.discount_amount} OFF - Special Discount!`;
        }
        break;
        
      default:
        // Handle percentage discounts and other types
        if (offer.discount_percentage && offer.discount_percentage > 0) {
          finalPrice = originalPrice * (1 - offer.discount_percentage / 100);
          savings = originalPrice - finalPrice;
          description = offer.description || `${offer.discount_percentage}% OFF - Amazing Savings!`;
        } else if (offer.discount_amount && offer.discount_amount > 0) {
          finalPrice = Math.max(0, originalPrice - offer.discount_amount);
          savings = offer.discount_amount;
          description = offer.description || `Rs. ${offer.discount_amount} OFF Special Offer`;
        } else {
          description = offer.description || 'Special Limited Time Offer - Grab it now!';
        }
    }
    
    return {
      originalPrice,
      finalPrice: parseFloat(finalPrice.toFixed(2)),
      quantity,
      description,
      savings: parseFloat(savings.toFixed(2)),
      isBOGO: offer.offer_type === 'Bogo',
      isFlatDiscount: offer.offer_type === 'flat_discount',
      isPercentageDiscount: offer.discount_percentage > 0
    };
  };

  // FIXED: Handle add to cart with proper offer handling
  const handleAddToCart = async (offer) => {
    if (!user) {
      showToast('Please login to add offer items to cart', 'error');
      navigate('/login');
      return;
    }

    try {
      const offerDetails = calculateOfferDetails(offer);
      
      // Prepare cart item with offer information
      const cartItem = {
        id: offer.product_id,
        name: offer.product_name,
        price: offerDetails.finalPrice,
        original_price: offerDetails.originalPrice,
        image_url: getProductImage(offer),
        stock_quantity: offer.stock_quantity,
        offer_id: offer.id,
        offer_type: offer.offer_type,
        quantity: offerDetails.quantity,
        discount_percentage: offer.discount_percentage,
        discount_amount: offer.discount_amount
      };

      const result = await addToCart(cartItem);
      
      if (result && result.success) {
        let message = '';
        if (offerDetails.isBOGO) {
          message = `🎁 BOGO Deal! 2 ${offer.product_name} added for Rs. ${offerDetails.originalPrice.toFixed(2)} only!`;
        } else if (offerDetails.savings > 0) {
          message = `💰 ${offer.product_name} added! You saved Rs. ${offerDetails.savings.toFixed(2)}!`;
        } else {
          message = `🛒 ${offer.product_name} added to cart!`;
        }
        
        showToast(message, 'success');
      } else {
        showToast(result?.error || 'Failed to add offer to cart', 'error');
      }
    } catch (error) {
      console.error('Error adding offer to cart:', error);
      showToast('Error adding offer to cart', 'error');
    }
  };

  // FIXED: Get product image with proper error handling
  const getProductImage = (offer) => {
    // Check if image_urls exists and is a string (not null or array)
    if (offer.image_urls && typeof offer.image_urls === 'string') {
      try {
        // Try to parse as JSON if it's a string
        const parsed = JSON.parse(offer.image_urls);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0]) {
          return parsed[0];
        }
      } catch (error) {
        // If parsing fails, check if it's a valid URL string
        if (offer.image_urls.trim && offer.image_urls.trim() !== '') {
          return offer.image_urls;
        }
      }
    }
    
    // Check if image_urls is an array
    if (Array.isArray(offer.image_urls) && offer.image_urls.length > 0 && offer.image_urls[0]) {
      return offer.image_urls[0];
    }
    
    // Fallback to image_url
    if (offer.image_url && typeof offer.image_url === 'string' && offer.image_url.trim() !== '') {
      return offer.image_url;
    }
    
    // Final fallback based on category
    const category = offer.category?.toLowerCase() || '';
    if (category.includes('electronic')) {
      return 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500';
    } else if (category.includes('cloth')) {
      return 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=500';
    } else if (category.includes('home')) {
      return 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500';
    } else {
      return 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500';
    }
  };

  // Get offer badge styling
  const getOfferBadge = (offer) => {
    switch (offer.offer_type) {
      case 'Bogo':
        return {
          text: 'BOGO DEAL',
          gradient: 'from-purple-500 to-pink-500',
          icon: '🎁',
          pulse: true
        };
      case 'flat_discount':
        return {
          text: 'FLAT DISCOUNT',
          gradient: 'from-green-500 to-emerald-600',
          icon: '💰',
          pulse: false
        };
      default:
        if (offer.discount_percentage > 0) {
          return {
            text: `${offer.discount_percentage}% OFF`,
            gradient: 'from-blue-500 to-cyan-600',
            icon: '🔥',
            pulse: true
          };
        } else {
          return {
            text: 'SPECIAL OFFER',
            gradient: 'from-orange-500 to-red-500',
            icon: '🎯',
            pulse: false
          };
        }
    }
  };

  // Get time remaining
  const getTimeRemaining = (validUntil) => {
    const now = new Date();
    const end = new Date(validUntil);
    const diff = end - now;
    
    if (diff <= 0) return { text: 'EXPIRED', urgent: true };
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return { text: `${days}d ${hours}h left`, urgent: days <= 1 };
    return { text: `${hours}h left`, urgent: true };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg font-medium">Loading amazing offers...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="relative inline-block mb-6">
            <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              🎊 Exclusive Offers
            </h1>
            <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 px-4 py-1 rounded-full text-sm font-bold rotate-12 animate-bounce">
              LIMITED TIME
            </div>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Don't miss these incredible deals! Limited stock available.
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-purple-100">
              <div className="text-2xl font-bold text-purple-600 mb-2">{offers.length}</div>
              <div className="text-gray-600 font-medium">Active Offers</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-green-100">
              <div className="text-2xl font-bold text-green-600 mb-2">
                {offers.filter(o => o.offer_type === 'Bogo').length}
              </div>
              <div className="text-gray-600 font-medium">BOGO Deals</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-blue-100">
              <div className="text-2xl font-bold text-blue-600 mb-2">
                {offers.filter(o => o.discount_percentage > 0 || o.discount_amount > 0).length}
              </div>
              <div className="text-gray-600 font-medium">Discount Offers</div>
            </div>
          </div>
        </div>

        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ message: '', type: 'success' })} 
        />

        {offers.length === 0 ? (
          <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100">
            <div className="text-6xl mb-4">😔</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">No Active Offers Right Now</h3>
            <p className="text-gray-600 mb-6">We're preparing some amazing deals for you. Check back soon!</p>
            <button
              onClick={() => navigate('/products')}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Browse All Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {offers.map((offer, index) => {
              const offerDetails = calculateOfferDetails(offer);
              const badge = getOfferBadge(offer);
              const timeRemaining = getTimeRemaining(offer.valid_until);
              
              return (
                <div 
                  key={offer.id}
                  className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-105 border border-gray-100 overflow-hidden group"
                >
                  {/* Offer Badge */}
                  <div className={`relative bg-gradient-to-r ${badge.gradient} text-white p-4 ${badge.pulse ? 'animate-pulse' : ''}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{badge.icon}</span>
                        <span className="font-bold text-sm tracking-wider">{badge.text}</span>
                      </div>
                      <span className={`text-xs px-3 py-1 rounded-full font-bold backdrop-blur-sm ${
                        timeRemaining.urgent 
                          ? 'bg-red-500/90 text-white animate-pulse' 
                          : 'bg-white/20 text-white'
                      }`}>
                        {timeRemaining.text}
                      </span>
                    </div>
                  </div>

                  {/* Product Image */}
                  <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                    <img
                      src={getProductImage(offer)}
                      alt={offer.product_name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500';
                      }}
                    />
                    
                    {/* Stock Status */}
                    <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm ${
                      offer.stock_quantity > 10 
                        ? 'bg-green-500/90 text-white'
                        : offer.stock_quantity > 0
                        ? 'bg-yellow-500/90 text-white'
                        : 'bg-red-500/90 text-white'
                    }`}>
                      {offer.stock_quantity > 10 ? 'In Stock' : offer.stock_quantity > 0 ? `Only ${offer.stock_quantity} left` : 'Out of Stock'}
                    </div>

                    {/* Offer Type Overlay */}
                    {offerDetails.isBOGO && (
                      <div className="absolute bottom-4 left-4 bg-gradient-to-r from-purple-500/90 to-pink-500/90 text-white px-3 py-2 rounded-xl text-sm font-bold shadow-lg backdrop-blur-sm animate-bounce">
                        🎁 BUY 1 GET 1 FREE
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-6">
                    <div className="mb-4">
                      <h3 className="font-bold text-gray-900 text-xl mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
                        {offer.product_name}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                        {offerDetails.description}
                      </p>
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <span className="bg-gray-100 px-2 py-1 rounded">📦 {offer.category}</span>
                      </div>
                    </div>

                    {/* Price Section */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl font-bold text-gray-900">
                            Rs. {offerDetails.finalPrice.toLocaleString()}
                          </span>
                          {offerDetails.savings > 0 && (
                            <span className="text-lg text-gray-500 line-through">
                              Rs. {offerDetails.originalPrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                        
                        {offerDetails.savings > 0 && (
                          <span className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full font-semibold animate-pulse">
                            Save Rs. {offerDetails.savings.toFixed(2)}
                          </span>
                        )}
                      </div>
                      
                      {/* Quantity Info */}
                      {offerDetails.quantity > 1 && (
                        <div className="text-sm text-purple-600 font-medium">
                          📦 Get {offerDetails.quantity} items
                          {offerDetails.isBOGO && ' (BOGO Deal)'}
                        </div>
                      )}
                    </div>

                    {/* Validity */}
                    <div className="text-xs text-gray-500 mb-4">
                      ⏰ Valid until: {new Date(offer.valid_until).toLocaleDateString()}
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                      <button
                        onClick={() => handleAddToCart(offer)}
                        disabled={offer.stock_quantity === 0}
                        className={`w-full py-4 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg ${
                          offer.stock_quantity === 0
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : `bg-gradient-to-r ${badge.gradient} hover:shadow-xl text-white`
                        }`}
                      >
                        {offer.stock_quantity === 0 ? 'Out of Stock' : (
                          offerDetails.isBOGO ? '🎁 Grab BOGO Deal' : 
                          '🛒 Add to Cart'
                        )}
                      </button>

                      <button
                        onClick={() => navigate(`/product/${offer.product_id}`)}
                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 text-sm"
                      >
                        👀 View Product Details
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Support Widget */}
        <SupportWidget />
      </div>
    </div>
  );
};

export default OffersPage;