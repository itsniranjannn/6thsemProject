import React, { useState, useEffect, useRef } from 'react';
import { useCart } from '../context/CartContext.js';
import { useAuth } from '../context/AuthContext.js';
import { useNavigate } from 'react-router-dom';
import { Toast } from '../components/Toast.js';
import SupportWidget from '../components/SupportWidget.js';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield,
  Truck,
  CreditCard,
  Wallet,
  Smartphone,
  Package,
  Zap,
  Crown,
  Sparkles,
  CheckCircle,
  Lock,
  ArrowLeft,
  RotateCcw
} from 'lucide-react';

const CheckoutPage = () => {
  const { 
    cartItems, 
    getCartTotal, 
    getCartItemsForCheckout,
    isCartEmpty,
    clearCart,
    getCartSummary
  } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const [selectedPayment, setSelectedPayment] = useState('cod');
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [applyingPromo, setApplyingPromo] = useState(false);
  const [availablePromos, setAvailablePromos] = useState([]);
  const [showPromoDropdown, setShowPromoDropdown] = useState(false);

  const promoDropdownRef = useRef(null);
  const promoInputRef = useRef(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    phone: '',
    notes: ''
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (promoDropdownRef.current && !promoDropdownRef.current.contains(event.target) &&
          promoInputRef.current && !promoInputRef.current.contains(event.target)) {
        setShowPromoDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.name || '',
        email: user.email || '',
        address: '',
        city: '',
        postalCode: '',
        phone: '',
        notes: ''
      });
    }
  }, [user]);

  useEffect(() => {
    if (isCartEmpty()) {
      showToast('🛒 Your cart is empty', 'error');
      navigate('/cart');
    }
  }, [isCartEmpty, navigate]);

  useEffect(() => {
    loadAvailablePromos();
  }, [cartItems]);

  useEffect(() => {
    if (availablePromos.length === 0 && cartItems.length > 0) {
      loadFallbackPromos();
    }
  }, [availablePromos.length, cartItems.length]);

  const loadFallbackPromos = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      
      const response = await fetch(`${API_BASE_URL}/api/promo/active`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const promos = await response.json();
        const totalAmount = getCartTotal();
        const applicablePromos = promos.filter(promo => {
          return promo.min_order_amount <= totalAmount;
        });
        
        setAvailablePromos(applicablePromos);
      }
    } catch (error) {
      // Silently fail
    }
  };

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

  const getCartCategories = () => {
    const categories = new Set();
    cartItems.forEach(item => {
      const category = item.product?.category || item.category;
      if (category) {
        categories.add(category);
      }
    });
    return Array.from(categories);
  };

  const loadAvailablePromos = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const cartCategories = getCartCategories();
      const totalAmount = getCartTotal();
      
      const response = await fetch(`${API_BASE_URL}/api/promo/available?totalAmount=${totalAmount}&categories=${JSON.stringify(cartCategories)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        
        if (result.success) {
          const allPromos = result.promos || [];
          const applicablePromos = allPromos.filter(promo => {
            if (!promo.categories || promo.categories.length === 0) {
              return true;
            }
            
            const promoCategories = Array.isArray(promo.categories) ? promo.categories : JSON.parse(promo.categories || '[]');
            const isApplicable = cartCategories.some(cartCategory => 
              promoCategories.includes(cartCategory)
            );
            
            return isApplicable;
          });
          
          setAvailablePromos(applicablePromos);
        } else {
          setAvailablePromos([]);
        }
      } else {
        setAvailablePromos([]);
      }
    } catch (error) {
      setAvailablePromos([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    const required = ['fullName', 'email', 'address', 'city', 'postalCode'];
    
    required.forEach(field => {
      if (!formData[field].trim()) {
        errors[field] = `${field.replace(/([A-Z])/g, ' $1').toLowerCase()} is required`;
      }
    });

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (formData.phone && !/^[0-9+\-\s()]{10,}$/.test(formData.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const applyPromoCode = async (code = null) => {
    const codeToApply = code || promoCode;
    
    if (!codeToApply.trim()) {
      showToast('🔤 Please enter a promo code', 'error');
      return;
    }

    setApplyingPromo(true);
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const cartCategories = getCartCategories();
      
      const response = await fetch(`${API_BASE_URL}/api/promo/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          code: codeToApply,
          totalAmount: getCartTotal(),
          cartItems: cartItems.map(item => ({
            category: item.product?.category || item.category
          })),
          categories: cartCategories
        })
      });

      const result = await response.json();

      if (result.success) {
        setDiscount(result.discount);
        setAppliedPromo(result.promo);
        setPromoCode(codeToApply);
        setShowPromoDropdown(false);
        showToast(result.promo.description || `🎉 Promo code applied! Rs. ${result.discount} discount`, 'success');
      } else {
        showToast(result.message || '❌ Invalid promo code', 'error');
      }
    } catch (error) {
      showToast('❌ Error applying promo code', 'error');
    } finally {
      setApplyingPromo(false);
    }
  };

  const removePromoCode = () => {
    setPromoCode('');
    setDiscount(0);
    setAppliedPromo(null);
    showToast('🔤 Promo code removed', 'info');
  };

  const handlePromoInputFocus = () => {
    if (availablePromos.length > 0) {
      setShowPromoDropdown(true);
    }
  };

  const handlePromoInputChange = (e) => {
    setPromoCode(e.target.value.toUpperCase());
    if (e.target.value.length > 0 && availablePromos.length > 0) {
      setShowPromoDropdown(true);
    }
  };

  const handlePromoItemClick = (code) => {
    applyPromoCode(code);
  };

  const handlePayment = async () => {
    if (!validateForm()) {
      showToast('❌ Please fix the form errors before proceeding', 'error');
      return;
    }

    setLoading(true);

    try {
      const cartSummary = getCartSummary();
      const cartItemsForCheckout = getCartItemsForCheckout();
      
      const shippingCharge = 50;
      
      const orderData = {
        items: cartItemsForCheckout,
        totalAmount: parseFloat(cartSummary.subtotal) + shippingCharge - discount,
        subtotal: parseFloat(cartSummary.subtotal),
        shipping: shippingCharge,
        discount: discount,
        promoCode: appliedPromo ? promoCode : null,
        promoCodeId: appliedPromo ? appliedPromo.id : null,
        shippingAddress: {
          fullName: formData.fullName,
          email: formData.email,
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
          phone: formData.phone,
          country: 'Nepal',
          notes: formData.notes
        }
      };

      const token = localStorage.getItem('token');
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      
      let paymentEndpoint = '';
      let paymentData = {};

      switch (selectedPayment) {
        case 'stripe':
          paymentEndpoint = '/api/payments/stripe';
          paymentData = {
            amount: orderData.totalAmount,
            items: orderData.items,
            shippingAddress: orderData.shippingAddress,
            subtotal: orderData.subtotal,
            shipping: orderData.shipping,
            discount: orderData.discount,
            promoCode: orderData.promoCode,
            promoCodeId: orderData.promoCodeId
          };
          break;

        case 'khalti':
          paymentEndpoint = '/api/payments/khalti';
          paymentData = {
            amount: orderData.totalAmount,
            items: orderData.items,
            shippingAddress: orderData.shippingAddress,
            subtotal: orderData.subtotal,
            shipping: orderData.shipping,
            discount: orderData.discount,
            promoCode: orderData.promoCode,
            promoCodeId: orderData.promoCodeId,
            customer_info: {
              name: formData.fullName,
              email: formData.email,
              phone: formData.phone
            }
          };
          break;

        case 'esewa':
          paymentEndpoint = '/api/payments/esewa';
          paymentData = {
            amount: orderData.totalAmount,
            items: orderData.items,
            shippingAddress: orderData.shippingAddress,
            subtotal: orderData.subtotal,
            shipping: orderData.shipping,
            discount: orderData.discount,
            promoCode: orderData.promoCode,
            promoCodeId: orderData.promoCodeId
          };
          break;

        case 'cod':
          paymentEndpoint = '/api/payments/cod';
          paymentData = {
            items: orderData.items,
            totalAmount: orderData.totalAmount,
            subtotal: orderData.subtotal,
            shipping: orderData.shipping,
            discount: orderData.discount,
            promoCode: orderData.promoCode,
            promoCodeId: orderData.promoCodeId,
            shippingAddress: orderData.shippingAddress
          };
          break;

        default:
          throw new Error('Invalid payment method');
      }

      const response = await fetch(`${API_BASE_URL}${paymentEndpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(paymentData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Payment failed: ${response.status}`;
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          errorMessage = errorText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();

      if (result.success) {
        if (selectedPayment === 'stripe' && result.sessionUrl) {
          showToast('🔒 Redirecting to secure payment...', 'success');
          setTimeout(() => {
            window.location.href = result.sessionUrl;
          }, 1000);
          return;
        
        } else if (selectedPayment === 'khalti' && result.payment_url) {
          showToast('📱 Redirecting to Khalti...', 'success');
          setTimeout(() => {
            window.location.href = result.payment_url;
          }, 1000);
          return;
        
        } else if (selectedPayment === 'esewa' && result.formData) {
          showToast('💳 Redirecting to eSewa...', 'success');
          
          navigate('/esewa-payment', {
            state: {
              formData: result.formData,
              submitUrl: result.submit_url
            }
          });
          return;
        
        } else if (selectedPayment === 'cod' || result.redirect_url) {
          const redirectUrl = result.redirect_url || `/order-success?orderId=${result.orderId}&payment=${selectedPayment}&success=true`;
          
          showToast('🎉 Order placed successfully!', 'success');
          
          await clearCart();
          
          setTimeout(() => {
            if (redirectUrl.startsWith('http')) {
              window.location.href = redirectUrl;
            } else {
              navigate(redirectUrl);
            }
          }, 1500);
          return;
        }
      } else {
        showToast(result.message || '❌ Payment failed. Please try again.', 'error');
      }

    } catch (error) {
      showToast(error.message || '❌ Payment processing failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentSuccess = urlParams.get('success');
    const orderId = urlParams.get('orderId');
    const paymentMethod = urlParams.get('payment');
    
    if (paymentSuccess === 'true' && orderId) {
      showToast('🎉 Payment completed successfully!', 'success');
      clearCart();
      setTimeout(() => {
        navigate('/order-success', { 
          state: { 
            orderId: orderId,
            paymentMethod: paymentMethod,
            success: true
          }
        });
      }, 1500);
    }
  }, [navigate, clearCart]);

  const cartSummary = getCartSummary();
  const subtotal = parseFloat(cartSummary.subtotal);
  const shipping = 50;
  const totalBeforeDiscount = subtotal + shipping;
  const total = totalBeforeDiscount - discount;

  const getCategoryBadge = (promo) => {
    if (!promo.categories || promo.categories.length === 0) {
      return null;
    }
    
    const categories = Array.isArray(promo.categories) ? promo.categories : JSON.parse(promo.categories || '[]');
    if (categories.length === 0) return null;
    
    return (
      <span className="text-xs bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-2 py-1 rounded-full ml-2">
        {categories[0]}{categories.length > 1 ? ` +${categories.length - 1}` : ''}
      </span>
    );
  };

  if (isCartEmpty()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div 
            className="text-center py-20"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              animate={{ 
                y: [0, -15, 0],
                scale: [1, 1.1, 1]
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
            <h2 className="text-4xl font-bold text-white mb-4">Your Cart is Empty</h2>
            <p className="text-gray-300 text-lg mb-8">Add some amazing products to your cart before checkout.</p>
            <motion.button
              onClick={() => navigate('/products')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-2xl inline-flex items-center gap-3"
            >
              <Sparkles className="w-5 h-5" />
              Continue Shopping
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
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
            Secure Checkout
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
            Complete your purchase with confidence and security
          </motion.p>
        </motion.div>

        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ message: '', type: 'success' })} 
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Forms */}
          <div className="space-y-6">
            {/* Shipping Information */}
            <motion.div 
              className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-cyan-500/20 shadow-2xl"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center mr-4">
                  <span className="text-white text-lg font-bold">1</span>
                </div>
                <h2 className="text-2xl font-bold text-white">Shipping Information</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-cyan-300 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-white/5 border rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors text-white placeholder-gray-400 ${
                      formErrors.fullName ? 'border-red-500' : 'border-cyan-500/30'
                    }`}
                    placeholder="Enter your full name"
                  />
                  {formErrors.fullName && (
                    <p className="text-red-400 text-sm mt-1">{formErrors.fullName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-cyan-300 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-white/5 border rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors text-white placeholder-gray-400 ${
                      formErrors.email ? 'border-red-500' : 'border-cyan-500/30'
                    }`}
                    placeholder="your@email.com"
                  />
                  {formErrors.email && (
                    <p className="text-red-400 text-sm mt-1">{formErrors.email}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-cyan-300 mb-2">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-white/5 border rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors text-white placeholder-gray-400 ${
                      formErrors.address ? 'border-red-500' : 'border-cyan-500/30'
                    }`}
                    placeholder="Your complete address"
                  />
                  {formErrors.address && (
                    <p className="text-red-400 text-sm mt-1">{formErrors.address}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-cyan-300 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-white/5 border rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors text-white placeholder-gray-400 ${
                      formErrors.city ? 'border-red-500' : 'border-cyan-500/30'
                    }`}
                    placeholder="Your city"
                  />
                  {formErrors.city && (
                    <p className="text-red-400 text-sm mt-1">{formErrors.city}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-cyan-300 mb-2">
                    Postal Code *
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-white/5 border rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors text-white placeholder-gray-400 ${
                      formErrors.postalCode ? 'border-red-500' : 'border-cyan-500/30'
                    }`}
                    placeholder="44600"
                  />
                  {formErrors.postalCode && (
                    <p className="text-red-400 text-sm mt-1">{formErrors.postalCode}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-cyan-300 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-white/5 border rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors text-white placeholder-gray-400 ${
                      formErrors.phone ? 'border-red-500' : 'border-cyan-500/30'
                    }`}
                    placeholder="98XXXXXXXX"
                  />
                  {formErrors.phone && (
                    <p className="text-red-400 text-sm mt-1">{formErrors.phone}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-cyan-300 mb-2">
                    Delivery Notes (Optional)
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-3 bg-white/5 border border-cyan-500/30 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors text-white placeholder-gray-400"
                    placeholder="Any special delivery instructions..."
                  />
                </div>
              </div>
            </motion.div>

          {/* Payment Method */}
<motion.div 
  className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-cyan-500/20 shadow-2xl"
  initial={{ opacity: 0, x: -30 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ delay: 0.6 }}
>
  <div className="flex items-center mb-6">
    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mr-4">
      <span className="text-white text-lg font-bold">2</span>
    </div>
    <h2 className="text-2xl font-bold text-white">Payment Method *</h2>
  </div>

  <div className="space-y-4">
    {/* Stripe */}
    <motion.label 
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`flex items-center p-4 rounded-2xl cursor-pointer transition-all duration-300 border-2 ${
        selectedPayment === 'stripe'
          ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-cyan-500 shadow-2xl'
          : 'bg-white/5 border-cyan-500/30 hover:border-cyan-500 hover:bg-cyan-500/10'
      }`}
    >
      <input
        type="radio"
        name="payment"
        value="stripe"
        checked={selectedPayment === 'stripe'}
        onChange={(e) => setSelectedPayment(e.target.value)}
        className="w-5 h-5 text-cyan-500 focus:ring-cyan-500"
      />
      <div className="ml-4 flex items-center gap-4">
        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center overflow-hidden p-2 border border-gray-300">
          <img
            src="/images/stripe.png"
            alt="Stripe"
            className="w-full h-full object-contain"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextElementSibling.style.display = 'flex';
            }}
          />
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center text-white font-bold text-xs hidden">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>
        <div>
          <span className="font-bold text-white">Credit/Debit Card</span>
          <p className="text-cyan-200 text-sm">Secure payment via Stripe</p>
        </div>
      </div>
    </motion.label>

    {/* Khalti */}
    <motion.label 
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`flex items-center p-4 rounded-2xl cursor-pointer transition-all duration-300 border-2 ${
        selectedPayment === 'khalti'
          ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500 shadow-2xl'
          : 'bg-white/5 border-purple-500/30 hover:border-purple-500 hover:bg-purple-500/10'
      }`}
    >
      <input
        type="radio"
        name="payment"
        value="khalti"
        checked={selectedPayment === 'khalti'}
        onChange={(e) => setSelectedPayment(e.target.value)}
        className="w-5 h-5 text-purple-500 focus:ring-purple-500"
      />
      <div className="ml-4 flex items-center gap-4">
        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center overflow-hidden p-2 border border-gray-300">
          <img
            src="/images/khalti.png"
            alt="Khalti"
            className="w-full h-full object-contain"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextElementSibling.style.display = 'flex';
            }}
          />
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white font-bold text-xs hidden">
            <Smartphone className="w-6 h-6" />
          </div>
        </div>
        <div>
          <span className="font-bold text-white">Khalti Wallet</span>
          <p className="text-purple-200 text-sm">Fast and secure mobile payment</p>
        </div>
      </div>
    </motion.label>

    {/* eSewa */}
    <motion.label 
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`flex items-center p-4 rounded-2xl cursor-pointer transition-all duration-300 border-2 ${
        selectedPayment === 'esewa'
          ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500 shadow-2xl'
          : 'bg-white/5 border-green-500/30 hover:border-green-500 hover:bg-green-500/10'
      }`}
    >
      <input
        type="radio"
        name="payment"
        value="esewa"
        checked={selectedPayment === 'esewa'}
        onChange={(e) => setSelectedPayment(e.target.value)}
        className="w-5 h-5 text-green-500 focus:ring-green-500"
      />
      <div className="ml-4 flex items-center gap-4">
        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center overflow-hidden p-2 border border-gray-300">
          <img
            src="/images/esewa.png"
            alt="eSewa"
            className="w-full h-full object-contain"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextElementSibling.style.display = 'flex';
            }}
          />
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center text-white font-bold text-xs hidden">
            <Wallet className="w-6 h-6" />
          </div>
        </div>
        <div>
          <span className="font-bold text-white">eSewa Wallet</span>
          <p className="text-green-200 text-sm">Popular digital wallet in Nepal</p>
        </div>
      </div>
    </motion.label>

    {/* Cash on Delivery */}
    <motion.label 
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`flex items-center p-4 rounded-2xl cursor-pointer transition-all duration-300 border-2 ${
        selectedPayment === 'cod'
          ? 'bg-gradient-to-r from-orange-500/20 to-red-500/20 border-orange-500 shadow-2xl'
          : 'bg-white/5 border-orange-500/30 hover:border-orange-500 hover:bg-orange-500/10'
      }`}
    >
      <input
        type="radio"
        name="payment"
        value="cod"
        checked={selectedPayment === 'cod'}
        onChange={(e) => setSelectedPayment(e.target.value)}
        className="w-5 h-5 text-orange-500 focus:ring-orange-500"
      />
      <div className="ml-4 flex items-center gap-4">
        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center overflow-hidden p-2 border border-gray-300">
          <img
            src="/images/cod.png"
            alt="Cash on Delivery"
            className="w-full h-full object-contain"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextElementSibling.style.display = 'flex';
            }}
          />
          <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center text-white font-bold text-xs hidden">
            <Package className="w-6 h-6" />
          </div>
        </div>
        <div>
          <span className="font-bold text-white">Cash on Delivery</span>
          <p className="text-orange-200 text-sm">Pay when you receive your order</p>
        </div>
      </div>
    </motion.label>
  </div>
</motion.div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="space-y-6">
            <motion.div 
              className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-cyan-500/20 shadow-2xl sticky top-6"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
            >
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mr-4">
                  <span className="text-white text-lg font-bold">3</span>
                </div>
                <h2 className="text-2xl font-bold text-white">Order Summary</h2>
              </div>

              {/* Promo Code Section */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-cyan-300 mb-2">
                  Promo Code
                  {availablePromos.length > 0 && (
                    <span className="text-xs text-green-400 ml-2">
                      ({availablePromos.length} available)
                    </span>
                  )}
                </label>
                <div className="relative">
                  <div className="flex gap-2">
                    <input
                      ref={promoInputRef}
                      type="text"
                      value={promoCode}
                      onChange={handlePromoInputChange}
                      onFocus={handlePromoInputFocus}
                      placeholder="Enter promo code"
                      className="flex-1 px-4 py-3 bg-white/5 border border-cyan-500/30 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors text-white placeholder-gray-400"
                      disabled={applyingPromo || appliedPromo}
                    />
                    {appliedPromo ? (
                      <motion.button
                        onClick={removePromoCode}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:from-red-600 hover:to-pink-600 transition-all duration-300 shadow-lg"
                      >
                        Remove
                      </motion.button>
                    ) : (
                      <motion.button
                        onClick={() => applyPromoCode()}
                        disabled={applyingPromo || !promoCode.trim()}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg"
                      >
                        {applyingPromo ? (
                          <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                        ) : (
                          'Apply'
                        )}
                      </motion.button>
                    )}
                  </div>

                  {/* Promo Code Dropdown */}
                  {showPromoDropdown && availablePromos.length > 0 && !appliedPromo && (
                    <motion.div 
                      ref={promoDropdownRef}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute z-50 w-full mt-2 bg-gray-800 border border-cyan-500/30 rounded-2xl shadow-2xl max-h-60 overflow-y-auto backdrop-blur-md"
                    >
                      <div className="p-4 border-b border-cyan-500/20 bg-gradient-to-r from-purple-500/20 to-pink-500/20 sticky top-0">
                        <p className="text-sm font-bold text-cyan-300 uppercase tracking-wide">AVAILABLE PROMO CODES</p>
                        <p className="text-xs text-cyan-200 mt-1">Applicable to your cart items • Only one can be applied</p>
                      </div>
                      <div className="max-h-48 overflow-y-auto">
                        {availablePromos.map((promo, index) => (
                          <motion.div
                            key={index}
                            whileHover={{ scale: 1.02 }}
                            className="p-4 hover:bg-white/5 cursor-pointer border-b border-cyan-500/10 last:border-b-0 transition-colors duration-200"
                            onClick={() => handlePromoItemClick(promo.code)}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="font-bold text-cyan-400 text-lg">{promo.code}</span>
                                  <span className={`text-xs px-3 py-1 rounded-full ${
                                    promo.discount_type === 'percentage' ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' :
                                    promo.discount_type === 'fixed' ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white' :
                                    'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                                  }`}>
                                    {promo.discount_type === 'percentage' ? `${promo.discount_value}% OFF` : 
                                     promo.discount_type === 'fixed' ? `Rs. ${promo.discount_value} OFF` : 
                                     'FREE SHIPPING'}
                                  </span>
                                  {getCategoryBadge(promo)}
                                </div>
                                <p className="text-cyan-100 text-sm mb-2">{promo.description}</p>
                                <div className="flex flex-wrap gap-2 text-xs text-cyan-300">
                                  {promo.min_order_amount > 0 && (
                                    <span>Min. order: Rs. {promo.min_order_amount}</span>
                                  )}
                                  {promo.max_discount_amount && (
                                    <span>Max discount: Rs. {promo.max_discount_amount}</span>
                                  )}
                                  {promo.valid_until && (
                                    <span>Valid until: {new Date(promo.valid_until).toLocaleDateString()}</span>
                                  )}
                                </div>
                              </div>
                              <button className="text-cyan-400 hover:text-cyan-300 text-sm font-medium bg-cyan-500/20 hover:bg-cyan-500/30 px-3 py-1 rounded-lg transition-colors border border-cyan-500/30">
                                Apply
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
                {appliedPromo && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-3 p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30 rounded-2xl"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-300 font-bold flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          {appliedPromo.code} Applied
                        </p>
                        <p className="text-green-200 text-sm mt-1">
                          {appliedPromo.description}
                        </p>
                      </div>
                      <span className="text-green-300 font-bold text-xl">
                        - Rs. {discount.toFixed(2)}
                      </span>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Order Items */}
              <div className="space-y-4 mb-6 max-h-80 overflow-y-auto custom-scrollbar">
                {cartItems.map((item, index) => {
                  const product = item.product || item;
                  const price = parseFloat(product.price || 0);
                  const itemTotal = price * item.quantity;

                  return (
                    <motion.div 
                      key={index} 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between py-4 border-b border-cyan-500/20"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center overflow-hidden border border-cyan-500/30">
                          <img
                            src={product.image_url || 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500'}
                            alt={product.name}
                            className="w-14 h-14 object-cover rounded-xl"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500';
                            }}
                          />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white text-sm line-clamp-2">{product.name}</h3>
                          <p className="text-cyan-300 text-xs">Qty: {item.quantity}</p>
                          <p className="text-cyan-400 text-sm font-bold">Rs. {price.toFixed(2)}</p>
                        </div>
                      </div>
                      <span className="font-bold text-white text-lg">Rs. {itemTotal.toFixed(2)}</span>
                    </motion.div>
                  );
                })}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-cyan-200">
                  <span>Subtotal ({cartSummary.itemCount} items)</span>
                  <span className="font-semibold">Rs. {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-cyan-200">
                  <span>Shipping</span>
                  <span className="font-semibold">Rs. {shipping.toFixed(2)}</span>
                </div>
                <div className="text-xs text-cyan-300 -mt-2 text-right">
                  <em>Rs. 50 delivery charge all over Nepal</em>
                </div>
                
                {discount > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex justify-between text-green-300 bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-3 rounded-xl border border-green-400/30"
                  >
                    <span className="font-bold">Discount Applied</span>
                    <span className="font-bold text-lg">- Rs. {discount.toFixed(2)}</span>
                  </motion.div>
                )}
                
                <div className="border-t border-cyan-500/30 pt-4">
                  <div className="flex justify-between text-xl font-bold">
                    <span className="text-white">Total Amount</span>
                    <span className="text-cyan-400 text-2xl">Rs. {total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Security Badge */}
              <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30 rounded-2xl p-4 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center">
                    <Lock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-green-300">Secure Checkout</p>
                    <p className="text-green-200 text-sm">Your payment information is encrypted and secure</p>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <motion.button
                onClick={handlePayment}
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02, y: loading ? 0 : -2 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-4"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    <span>Complete Order</span>
                    <span className="text-cyan-100">•</span>
                    <span>Rs. {total.toFixed(2)}</span>
                  </>
                )}
              </motion.button>

              <p className="text-xs text-cyan-300 text-center mt-4">
                By completing your purchase, you agree to our{' '}
                <a href="/terms" className="text-cyan-400 hover:text-cyan-300 font-medium underline">Terms of Service</a>
                {' '}and{' '}
                <a href="/privacy" className="text-cyan-400 hover:text-cyan-300 font-medium underline">Privacy Policy</a>
              </p>
            </motion.div>

            {/* Back to Cart */}
            <motion.button
              onClick={() => navigate('/cart')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-white/10 hover:bg-white/20 text-white py-3 px-6 rounded-xl font-medium transition-all duration-300 border border-cyan-500/30 flex items-center justify-center gap-3"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Cart
            </motion.button>
          </div>
        </div>
      </div>

      <SupportWidget />
    </div>
  );
};

export default CheckoutPage;