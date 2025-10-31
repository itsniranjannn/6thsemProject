import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext.js';
import { useAuth } from '../context/AuthContext.js';
import { Link, useNavigate } from 'react-router-dom';
import { Toast } from '../components/Toast.js';
import ConfirmationModal from '../components/ConfirmationModel.js';
import SupportWidget from '../components/SupportWidget.js';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowLeft, 
  ShoppingBag,
  Shield,
  Truck,
  RotateCcw,
  Sparkles,
  Crown,
  Zap,
  Heart
} from 'lucide-react';

const CartPage = () => {
  const { 
    cartItems, 
    loading, 
    updateCartItem, 
    removeFromCart, 
    clearCart, 
    getCartTotal,
    refreshCart,
    isCartEmpty
  } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [updatingItem, setUpdatingItem] = useState(null);
  const [removingItem, setRemovingItem] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);
  const [animateItems, setAnimateItems] = useState(false);

  useEffect(() => {
    if (user && cartItems.length === 0) {
      refreshCart();
    }
  }, [user, cartItems.length, refreshCart]);

  useEffect(() => {
    if (cartItems.length > 0) {
      setAnimateItems(true);
      const timer = setTimeout(() => setAnimateItems(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [cartItems.length]);

  const showToast = (message, type = 'success') => {
    const emojis = {
      success: '🎉',
      error: '❌',
      info: '💡',
      warning: '⚠️'
    };
    setToast({ message: `${emojis[type]} ${message}`, type });
    setTimeout(() => setToast({ message: '', type: 'success' }), 4000);
  };

  const handleQuantityChange = async (productId, newQuantity, offerId = null) => {
    if (!user) {
      showToast('🔐 Please login to update cart', 'error');
      return;
    }

    setUpdatingItem(productId);
    
    try {
      const result = await updateCartItem(productId, newQuantity, offerId);
      
      if (result.success) {
        showToast(result.message || '🛒 Cart updated successfully', 'success');
      } else {
        showToast(result.error || '❌ Failed to update cart', 'error');
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      showToast('❌ Error updating quantity. Please try again.', 'error');
    } finally {
      setUpdatingItem(null);
    }
  };

  const handleRemoveClick = (productId, productName, offerId = null) => {
    setItemToRemove({ id: productId, name: productName, offerId });
    setShowRemoveModal(true);
  };

  const handleRemoveConfirm = async () => {
    if (!itemToRemove) return;

    setRemovingItem(itemToRemove.id);
    setShowRemoveModal(false);
    
    try {
      const result = await removeFromCart(itemToRemove.id, itemToRemove.offerId);
      
      if (result.success) {
        showToast('🗑️ Item removed from cart', 'success');
      } else {
        showToast(result.error || '❌ Failed to remove item', 'error');
      }
    } catch (error) {
      console.error('Error removing item:', error);
      showToast('❌ Error removing item. Please try again.', 'error');
    } finally {
      setRemovingItem(null);
      setItemToRemove(null);
    }
  };

  const handleClearClick = () => {
    setShowClearModal(true);
  };

  const handleClearConfirm = async () => {
    setShowClearModal(false);
    
    try {
      const result = await clearCart();
      
      if (result.success) {
        showToast('🧹 Cart cleared successfully', 'success');
      } else {
        showToast(result.error || '❌ Failed to clear cart', 'error');
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      showToast('❌ Error clearing cart. Please try again.', 'error');
    }
  };

  const incrementQuantity = (item) => {
    const productId = item.product_id || item.product?.id || item.id;
    const offerId = item.offer_id || null;
    handleQuantityChange(productId, item.quantity + 1, offerId);
  };

  const decrementQuantity = (item) => {
    if (item.quantity > 1) {
      const productId = item.product_id || item.product?.id || item.id;
      const offerId = item.offer_id || null;
      handleQuantityChange(productId, item.quantity - 1, offerId);
    }
  };

  const handleCheckout = () => {
    if (isCartEmpty()) {
      showToast('🛒 Your cart is empty', 'error');
      return;
    }
    navigate('/checkout');
  };

  const getProductData = (item) => {
    const finalPrice = parseFloat(item.final_price || item.product?.price || item.price || 0);
    const originalPrice = parseFloat(item.product?.price || item.price || 0);
    const unitPrice = parseFloat(item.unit_price || finalPrice);
    const hasOffer = item.has_offer || item.offer_id;
    const displayQuantity = item.display_quantity || item.quantity;
    
    let calculatedSavings = 0;
    
    if (item.offer_type === 'Bogo' && hasOffer) {
      const regularPriceForQuantity = originalPrice * displayQuantity;
      calculatedSavings = regularPriceForQuantity - finalPrice;
    } else if (hasOffer) {
      calculatedSavings = (originalPrice - unitPrice) * displayQuantity;
    }
    
    return {
      id: item.product_id || item.product?.id || item.id,
      name: item.product?.name || item.name || 'Unknown Product',
      price: unitPrice,
      final_price: finalPrice,
      original_price: originalPrice,
      category: item.product?.category || item.category || 'Uncategorized',
      image_url: item.product?.image_url || item.image_url || '/api/placeholder/80/80',
      offer_id: item.offer_id,
      offer_type: item.offer_type,
      has_offer: hasOffer,
      quantity: item.quantity,
      display_quantity: displayQuantity,
      savings: calculatedSavings
    };
  };

  const getOfferBadge = (item) => {
    if (!item.has_offer) return null;
    
    switch (item.offer_type) {
      case 'Bogo':
        return {
          text: 'BOGO DEAL',
          color: 'bg-gradient-to-r from-purple-500 to-pink-500',
          icon: '🎁',
          textColor: 'text-white'
        };
      case 'flat_discount':
        return {
          text: 'FLAT DISCOUNT',
          color: 'bg-gradient-to-r from-green-500 to-emerald-500',
          icon: '💰',
          textColor: 'text-white'
        };
      case 'percentage_discount':
        return {
          text: `${item.discount_percentage}% OFF`,
          color: 'bg-gradient-to-r from-blue-500 to-cyan-500',
          icon: '🔥',
          textColor: 'text-white'
        };
      default:
        return {
          text: 'SPECIAL OFFER',
          color: 'bg-gradient-to-r from-orange-500 to-red-500',
          icon: '🎯',
          textColor: 'text-white'
        };
    }
  };

  const getTotalSavings = () => {
    return cartItems.reduce((total, item) => {
      const product = getProductData(item);
      return total + product.savings;
    }, 0);
  };

  if (loading && cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 pt-20 py-8">
        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative inline-block mb-6">
              <motion.div
                animate={{ 
                  rotate: 360,
                  scale: [1, 1.2, 1]
                }}
                transition={{ 
                  rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                  scale: { duration: 1.5, repeat: Infinity }
                }}
                className="w-20 h-20 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto"
              />
            </div>
            <motion.h2 
              className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Loading Your Cart
            </motion.h2>
            <motion.p 
              className="text-gray-300 text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Preparing your shopping journey...
            </motion.p>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div 
            className="text-center py-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              animate={{ 
                y: [0, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="text-8xl mb-6"
            >
              🛒
            </motion.div>
            <h2 className="text-4xl font-bold text-white mb-4">Authentication Required</h2>
            <p className="text-gray-300 text-lg mb-8">Please login to access your shopping cart and manage your items.</p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/login"
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-2xl inline-flex items-center gap-3"
              >
                <Shield className="w-5 h-5" />
                Login to Continue
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Enhanced Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.h1 
            className="text-5xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-4 relative"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Your Shopping Cart
            <motion.div 
              className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: 128 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            />
          </motion.h1>
          
          <motion.p 
            className="text-xl text-gray-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {isCartEmpty() ? 'Your cart is waiting for amazing products!' : `You have ${cartItems.length} premium item(s) in your cart`}
          </motion.p>
        </motion.div>

        {/* Toast Notification */}
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ message: '', type: 'success' })} 
        />

        {/* Confirmation Modals */}
        <ConfirmationModal
          isOpen={showRemoveModal}
          onClose={() => setShowRemoveModal(false)}
          onConfirm={handleRemoveConfirm}
          title="Remove Item from Cart"
          message={itemToRemove ? `Are you sure you want to remove "${itemToRemove.name}" from your cart?` : "Are you sure you want to remove this item from your cart?"}
          confirmText="Remove Item"
          cancelText="Keep Item"
          type="danger"
        />

        <ConfirmationModal
          isOpen={showClearModal}
          onClose={() => setShowClearModal(false)}
          onConfirm={handleClearConfirm}
          title="Clear Shopping Cart"
          message="Are you sure you want to clear your entire cart? This action cannot be undone."
          confirmText="Clear Cart"
          cancelText="Keep Items"
          type="danger"
        />

        {isCartEmpty() ? (
          <motion.div 
            className="text-center py-20 bg-white/10 backdrop-blur-md rounded-3xl border border-cyan-500/20 shadow-2xl"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              animate={{ 
                y: [0, -15, 0],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="text-8xl mb-6"
            >
              🛒
            </motion.div>
            <h3 className="text-3xl font-bold text-white mb-4 mt-15">Your Cart is Empty</h3>
            <p className="text-gray-300 text-lg mb-8">Discover amazing products and start your shopping journey!</p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/products"
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-2xl inline-flex items-center gap-3"
              >
                <Sparkles className="w-5 h-5" />
                Explore Products
              </Link>
            </motion.div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items - 2/3 width */}
            <div className="lg:col-span-2 space-y-6">
              {/* Cart Header */}
              <motion.div 
                className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-cyan-500/20 shadow-2xl"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl">
                      <ShoppingBag className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Cart Items</h3>
                      <p className="text-gray-300 text-sm">{cartItems.length} premium products</p>
                    </div>
                  </div>
                  <motion.button
                    onClick={handleClearClick}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-red-500/20 hover:bg-red-500/30 text-red-300 px-4 py-2 rounded-xl font-medium transition-all duration-300 border border-red-500/30 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear All
                  </motion.button>
                </div>
              </motion.div>

              {/* Cart Items List */}
              <motion.div 
                className="space-y-4"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.1
                    }
                  }
                }}
              >
                {cartItems.map((item, index) => {
                  const product = getProductData(item);
                  const productId = product.id;
                  const quantity = product.display_quantity;
                  const price = product.price;
                  const finalPrice = product.final_price;
                  const originalPrice = product.original_price;
                  const total = finalPrice;
                  const offerBadge = getOfferBadge(item);

                  return (
                    <motion.div
                      key={`${productId}-${product.offer_id || 'regular'}-${index}`}
                      variants={{
                        hidden: { opacity: 0, y: 20, scale: 0.9 },
                        visible: { opacity: 1, y: 0, scale: 1 }
                      }}
                      transition={{ 
                        duration: 0.5, 
                        delay: index * 0.1,
                        type: "spring",
                        stiffness: 100
                      }}
                      whileHover={{ 
                        y: -4,
                        transition: { duration: 0.3 }
                      }}
                      className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-cyan-500/20 shadow-2xl hover:shadow-cyan-500/25 transition-all duration-300 relative group"
                    >
                      {/* Offer Badge */}
                      {offerBadge && (
                        <div className={`absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-bold ${offerBadge.color} ${offerBadge.textColor} flex items-center gap-1.5 shadow-lg z-10`}>
                          <span className="text-sm">{offerBadge.icon}</span>
                          <span>{offerBadge.text}</span>
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row items-start gap-6">
                        {/* Product Image */}
                        <div className="flex-shrink-0 w-24 h-24">
                          <div className="relative w-full h-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-2xl overflow-hidden border border-cyan-500/30">
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                              onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500';
                              }}
                            />
                          </div>
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
                                {product.name}
                              </h3>
                              <p className="text-cyan-300 text-sm mb-3 font-medium">
                                {product.category}
                              </p>
                              
                              {/* Price Display */}
                              <div className="flex items-center gap-3 mb-3">
                                <p className="text-2xl font-bold text-cyan-400">
                                  Rs. {price.toFixed(2)}
                                  {product.offer_type === 'Bogo' && (
                                    <span className="text-sm font-normal text-cyan-200 ml-2">(per paid item)</span>
                                  )}
                                </p>
                                {product.has_offer && originalPrice > price && (
                                  <p className="text-lg text-gray-400 line-through">
                                    Rs. {originalPrice.toFixed(2)}
                                  </p>
                                )}
                              </div>
                              
                              {/* Savings & BOGO Info */}
                              {product.savings > 0 && (
                                <div className="flex items-center gap-2 bg-green-500/20 px-3 py-1.5 rounded-lg border border-green-400/30 w-fit">
                                  <span className="text-green-300 text-sm font-medium">🎁 You save: Rs. {product.savings.toFixed(2)}</span>
                                </div>
                              )}
                              
                              {product.offer_type === 'Bogo' && (
                                <div className="flex items-center gap-2 bg-purple-500/20 px-3 py-1.5 rounded-lg border border-purple-400/30 w-fit mt-2">
                                  <span className="text-purple-300 text-sm font-medium">
                                    🎁 BOGO Deal: Pay for {Math.ceil(quantity / 2)} out of {quantity} items
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Quantity Controls & Total */}
                            <div className="flex flex-col sm:items-end gap-4">
                              {/* Quantity Controls */}
                              <div className="flex items-center gap-3 bg-white/10 rounded-2xl p-2 border border-cyan-500/30">
                                <motion.button
                                  onClick={() => decrementQuantity(item)}
                                  disabled={updatingItem === productId || quantity <= 1}
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  className="w-10 h-10 flex items-center justify-center bg-cyan-500/20 hover:bg-cyan-500/30 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 text-cyan-300"
                                >
                                  <Minus className="w-4 h-4" />
                                </motion.button>
                                
                                <span className="w-12 text-center font-bold text-white text-lg">
                                  {updatingItem === productId ? (
                                    <div className="animate-spin h-5 w-5 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto"></div>
                                  ) : (
                                    quantity
                                  )}
                                </span>
                                
                                <motion.button
                                  onClick={() => incrementQuantity(item)}
                                  disabled={updatingItem === productId}
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  className="w-10 h-10 flex items-center justify-center bg-cyan-500/20 hover:bg-cyan-500/30 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 text-cyan-300"
                                >
                                  <Plus className="w-4 h-4" />
                                </motion.button>
                              </div>

                              {/* Total Price */}
                              <div className="text-right">
                                <p className="text-2xl font-bold text-white">
                                  Rs. {total.toFixed(2)}
                                </p>
                                <p className="text-cyan-300 text-sm">
                                  {quantity} items
                                  {product.offer_type === 'Bogo' && (
                                    <span className="text-purple-300"> (pay for {Math.ceil(quantity / 2)})</span>
                                  )}
                                </p>
                              </div>

                              {/* Remove Button */}
                              <motion.button
                                onClick={() => handleRemoveClick(productId, product.name, product.offer_id)}
                                disabled={removingItem === productId || updatingItem === productId}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 p-2 rounded-xl border border-red-500/30 flex items-center gap-2"
                              >
                                {removingItem === productId ? (
                                  <div className="animate-spin h-4 w-4 border border-red-400 border-t-transparent rounded-full"></div>
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                                <span className="text-sm font-medium">Remove</span>
                              </motion.button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>

            {/* Cart Summary - 1/3 width */}
            <div className="space-y-6">
              <motion.div 
                className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-cyan-500/20 shadow-2xl sticky top-6"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                    <Crown className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Order Summary</h3>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center text-gray-300">
                    <span>Subtotal ({cartItems.length} items)</span>
                    <span className="text-lg font-semibold text-white">Rs. {getCartTotal().toFixed(2)}</span>
                  </div>
                  
                  {/* Total Savings */}
                  {getTotalSavings() > 0 && (
                    <div className="flex justify-between items-center bg-green-500/20 p-3 rounded-xl border border-green-400/30">
                      <span className="text-green-300 font-medium">Total Savings</span>
                      <span className="text-lg font-bold text-green-300">
                        - Rs. {getTotalSavings().toFixed(2)}
                      </span>
                    </div>
                  )}
                  
                  <div className="border-t border-cyan-500/30 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-white">Total Amount</span>
                      <span className="text-2xl font-black text-cyan-400">
                        Rs. {getCartTotal().toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Security Features */}
                <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30 rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-green-400" />
                    <div>
                      <p className="font-semibold text-green-300">Secure Checkout</p>
                      <p className="text-green-200 text-sm">Your payment information is protected</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-4">
                  <motion.button
                    onClick={handleCheckout}
                    disabled={loading || isCartEmpty()}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  >
                    <Zap className="w-5 h-5" />
                    Proceed to Checkout
                    <span className="text-cyan-100">•</span>
                    <span>Rs. {getCartTotal().toFixed(2)}</span>
                  </motion.button>

                  <motion.button
                    onClick={() => navigate('/products')}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-white/10 hover:bg-white/20 text-white py-3 px-6 rounded-xl font-medium transition-all duration-300 border border-cyan-500/30 flex items-center justify-center gap-3"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Continue Shopping
                  </motion.button>
                </div>

                {/* Additional Features */}
                <div className="mt-6 pt-6 border-t border-cyan-500/20">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-white/5 rounded-xl p-3 border border-cyan-500/10">
                      <Truck className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                      <p className="text-xs text-cyan-300 font-medium">Free Shipping</p>
                      <p className="text-xs text-gray-400">Over Rs. 5000</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3 border border-cyan-500/10">
                      <RotateCcw className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                      <p className="text-xs text-cyan-300 font-medium">Easy Returns</p>
                      <p className="text-xs text-gray-400">30 Day Policy</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </div>
      
      {/* Support Widget */}
      <SupportWidget />
    </div>
  );
};

export default CartPage;