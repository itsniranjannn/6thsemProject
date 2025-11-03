// frontend/src/pages/OffersPage.js - ENHANCED PROFESSIONAL VERSION
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toast } from '../components/Toast.js';
import { useCart } from '../context/CartContext.js';
import { useAuth } from '../context/AuthContext.js';
import SupportWidget from '../components/SupportWidget.js';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  Clock, 
  Star, 
  Shield, 
  Truck, 
  Gift, 
  TrendingUp,
  Sparkles,
  ShoppingCart,
  Eye
} from 'lucide-react';

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

  // Handle add to cart with proper offer handling
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

  // Get product image with proper error handling
  const getProductImage = (offer) => {
    if (offer.image_urls && typeof offer.image_urls === 'string') {
      try {
        const parsed = JSON.parse(offer.image_urls);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0]) {
          return parsed[0];
        }
      } catch (error) {
        if (offer.image_urls.trim && offer.image_urls.trim() !== '') {
          return offer.image_urls;
        }
      }
    }
    
    if (Array.isArray(offer.image_urls) && offer.image_urls.length > 0 && offer.image_urls[0]) {
      return offer.image_urls[0];
    }
    
    if (offer.image_url && typeof offer.image_url === 'string' && offer.image_url.trim() !== '') {
      return offer.image_url;
    }
    
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
          pulse: true,
          color: 'purple'
        };
      case 'flat_discount':
        return {
          text: 'FLAT DISCOUNT',
          gradient: 'from-green-500 to-emerald-600',
          icon: '💰',
          pulse: false,
          color: 'green'
        };
      default:
        if (offer.discount_percentage > 0) {
          return {
            text: `${offer.discount_percentage}% OFF`,
            gradient: 'from-blue-500 to-cyan-600',
            icon: '🔥',
            pulse: true,
            color: 'blue'
          };
        } else {
          return {
            text: 'SPECIAL OFFER',
            gradient: 'from-orange-500 to-red-500',
            icon: '🎯',
            pulse: false,
            color: 'orange'
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
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return { text: `${days}d ${hours}h`, urgent: days <= 1 };
    if (hours > 0) return { text: `${hours}h ${minutes}m`, urgent: true };
    return { text: `${minutes}m`, urgent: true };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="rounded-full h-16 w-16 border-4 border-cyan-500 border-t-transparent mx-auto mb-4"
            />
            <p className="text-gray-300 text-lg font-medium">Loading amazing offers...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Enhanced Header Section */}
        <motion.div 
          className="text-center mb-12 relative"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          {/* Animated Background Elements */}
          <div className="absolute top-10 left-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
          
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="inline-block mb-6"
          >
            <h1 className="text-5xl lg:text-7xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
              EXCLUSIVE OFFERS
            </h1>
            <motion.div 
              className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-yellow-900 px-6 py-2 rounded-full text-sm font-bold rotate-12 shadow-2xl"
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [12, -12, 12]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              ⚡ LIMITED TIME
            </motion.div>
          </motion.div>
          
          <motion.p 
            className="text-xl text-gray-300 max-w-2xl mx-auto mb-8 leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Discover incredible deals with massive savings. Don't miss these limited-time offers!
          </motion.p>
          
          {/* Enhanced Stats */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-cyan-500/20 group hover:border-cyan-400/40 transition-all duration-300">
              <div className="text-3xl font-black text-cyan-400 mb-2 group-hover:scale-110 transition-transform duration-300">
                {offers.length}
              </div>
              <div className="text-gray-300 font-semibold flex items-center gap-2">
                <Zap className="w-4 h-4 text-cyan-400" />
                Active Offers
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-green-500/20 group hover:border-green-400/40 transition-all duration-300">
              <div className="text-3xl font-black text-green-400 mb-2 group-hover:scale-110 transition-transform duration-300">
                {offers.filter(o => o.offer_type === 'Bogo').length}
              </div>
              <div className="text-gray-300 font-semibold flex items-center gap-2">
                <Gift className="w-4 h-4 text-green-400" />
                BOGO Deals
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-blue-500/20 group hover:border-blue-400/40 transition-all duration-300">
              <div className="text-3xl font-black text-blue-400 mb-2 group-hover:scale-110 transition-transform duration-300">
                {offers.filter(o => o.discount_percentage > 0 || o.discount_amount > 0).length}
              </div>
              <div className="text-gray-300 font-semibold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                Discount Offers
              </div>
            </div>
          </motion.div>
        </motion.div>

        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ message: '', type: 'success' })} 
        />

        {offers.length === 0 ? (
          <motion.div 
            className="text-center py-16 bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-cyan-500/20"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-8xl mb-4">🎁</div>
            <h3 className="text-2xl font-semibold text-white mb-2">No Active Offers Right Now</h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              We're preparing some amazing deals for you. Check back soon for exclusive offers!
            </p>
            <motion.button
              onClick={() => navigate('/products')}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-8 py-4 rounded-2xl font-bold transition-all duration-200 shadow-2xl hover:shadow-cyan-500/25"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Browse All Products
            </motion.button>
          </motion.div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.15
                }
              }
            }}
          >
            {offers.map((offer, index) => {
              const offerDetails = calculateOfferDetails(offer);
              const badge = getOfferBadge(offer);
              const timeRemaining = getTimeRemaining(offer.valid_until);
              
              return (
                <motion.div 
                  key={offer.id}
                  variants={{
                    hidden: { opacity: 0, y: 30, scale: 0.9 },
                    visible: { opacity: 1, y: 0, scale: 1 }
                  }}
                  transition={{ duration: 0.5, type: "spring" }}
                  className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 border border-cyan-500/20 overflow-hidden group hover:border-cyan-400/40 relative"
                  whileHover={{ y: -8, scale: 1.02 }}
                >
                  {/* Offer Badge */}
                  <div className={`relative bg-gradient-to-r ${badge.gradient} text-white p-5 ${badge.pulse ? 'animate-pulse' : ''}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl animate-bounce">{badge.icon}</span>
                        <span className="font-black text-sm tracking-wider drop-shadow-lg">{badge.text}</span>
                      </div>
                      <motion.span 
                        className={`text-xs px-3 py-2 rounded-full font-bold backdrop-blur-sm border ${
                          timeRemaining.urgent 
                            ? 'bg-red-500/90 text-white border-red-400 animate-pulse' 
                            : 'bg-white/20 text-white border-white/30'
                        }`}
                        animate={timeRemaining.urgent ? { scale: [1, 1.1, 1] } : {}}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Clock className="w-3 h-3 inline mr-1" />
                        {timeRemaining.text}
                      </motion.span>
                    </div>
                  </div>

                  {/* Product Image */}
                  <div className="relative aspect-square bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
                    <motion.img
                      src={getProductImage(offer)}
                      alt={offer.product_name}
                      className="w-full h-full object-cover"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.7 }}
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500';
                      }}
                    />
                    
                    {/* Stock Status */}
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={`absolute top-4 left-4 px-4 py-2 rounded-full text-xs font-bold shadow-2xl backdrop-blur-sm border ${
                        offer.stock_quantity > 10 
                          ? 'bg-green-500/90 text-white border-green-400'
                          : offer.stock_quantity > 0
                          ? 'bg-yellow-500/90 text-white border-yellow-400'
                          : 'bg-red-500/90 text-white border-red-400'
                      }`}
                    >
                      {offer.stock_quantity > 10 ? 'In Stock' : offer.stock_quantity > 0 ? `Only ${offer.stock_quantity} left` : 'Out of Stock'}
                    </motion.div>

                    {/* Offer Type Overlay */}
                    {offerDetails.isBOGO && (
                      <motion.div 
                        className="absolute bottom-4 left-4 bg-gradient-to-r from-purple-500/90 to-pink-500/90 text-white px-4 py-3 rounded-2xl text-sm font-black shadow-2xl backdrop-blur-sm border border-purple-400"
                        animate={{ 
                          y: [0, -5, 0],
                          scale: [1, 1.05, 1]
                        }}
                        transition={{ 
                          duration: 2, 
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        🎁 BUY 1 GET 1 FREE
                      </motion.div>
                    )}

                    {/* Premium Features Overlay */}
                    <div className="absolute top-4 right-4 flex flex-col gap-2">
                      <div className="flex items-center gap-1 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full text-xs text-white border border-white/20">
                        <Shield className="w-3 h-3" />
                        <span>Secure</span>
                      </div>
                      <div className="flex items-center gap-1 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full text-xs text-white border border-white/20">
                        <Truck className="w-3 h-3" />
                        <span>Fast Delivery</span>
                      </div>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-6">
                    <div className="mb-4">
                      <motion.h3 
                        className="font-black text-white text-xl mb-3 line-clamp-2 group-hover:text-cyan-300 transition-colors duration-300"
                        whileHover={{ scale: 1.02 }}
                      >
                        {offer.product_name}
                      </motion.h3>
                      <p className="text-gray-400 text-sm line-clamp-2 mb-3 leading-relaxed">
                        {offerDetails.description}
                      </p>
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <span className="bg-white/10 text-white px-3 py-1 rounded-full border border-white/10 backdrop-blur-sm">
                          📦 {offer.category}
                        </span>
                      </div>
                    </div>

                    {/* Price Section */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl font-black text-white">
                            Rs. {offerDetails.finalPrice.toLocaleString()}
                          </span>
                          {offerDetails.savings > 0 && (
                            <span className="text-lg text-gray-400 line-through">
                              Rs. {offerDetails.originalPrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                        
                        {offerDetails.savings > 0 && (
                          <motion.span 
                            className="text-sm bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-2 rounded-full font-black shadow-lg border border-green-400"
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            Save Rs. {offerDetails.savings.toFixed(2)}
                          </motion.span>
                        )}
                      </div>
                      
                      {/* Quantity Info */}
                      {offerDetails.quantity > 1 && (
                        <div className="text-sm text-cyan-300 font-semibold flex items-center gap-2">
                          <Sparkles className="w-4 h-4" />
                          Get {offerDetails.quantity} items
                          {offerDetails.isBOGO && ' (BOGO Deal)'}
                        </div>
                      )}
                    </div>

                    {/* Validity */}
                    <div className="text-xs text-gray-500 mb-4 flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      Valid until: {new Date(offer.valid_until).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                      <motion.button
                        onClick={() => handleAddToCart(offer)}
                        disabled={offer.stock_quantity === 0}
                        className={`w-full py-4 rounded-2xl font-black transition-all duration-300 shadow-2xl flex items-center justify-center gap-3 ${
                          offer.stock_quantity === 0
                            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                            : `bg-gradient-to-r ${badge.gradient} hover:shadow-cyan-500/25 text-white border border-${badge.color}-400`
                        }`}
                        whileHover={offer.stock_quantity > 0 ? { scale: 1.03 } : {}}
                        whileTap={offer.stock_quantity > 0 ? { scale: 0.97 } : {}}
                      >
                        <ShoppingCart className="w-5 h-5" />
                        {offer.stock_quantity === 0 ? 'Out of Stock' : (
                          offerDetails.isBOGO ? 'Grab BOGO Deal' : 
                          'Add to Cart'
                        )}
                      </motion.button>

                      <motion.button
                        onClick={() => navigate(`/product/${offer.product_id}`)}
                        className="w-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white py-3 rounded-2xl font-semibold transition-all duration-200 border border-white/10 hover:border-white/20 flex items-center justify-center gap-2 backdrop-blur-sm"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Eye className="w-4 h-4" />
                        View Product Details
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Support Widget */}
        <SupportWidget />
      </div>
    </div>
  );
};

export default OffersPage;