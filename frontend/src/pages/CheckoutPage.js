// frontend/src/pages/CheckoutPage.js
import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext.js';
import { useAuth } from '../context/AuthContext.js';
import { useNavigate } from 'react-router-dom';
import { Toast } from '../components/Toast.js';

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

  // Form state
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
      showToast('Your cart is empty', 'error');
      navigate('/cart');
    }
  }, [isCartEmpty, navigate]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: 'success' }), 4000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
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

  const applyPromoCode = async () => {
    if (!promoCode.trim()) {
      showToast('Please enter a promo code', 'error');
      return;
    }

    setApplyingPromo(true);
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      
      const response = await fetch(`${API_BASE_URL}/api/promo/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          code: promoCode,
          totalAmount: getCartTotal()
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setDiscount(result.discount);
          setAppliedPromo(result.promo);
          showToast(`Promo code applied! ${result.discount > 0 ? `Rs. ${result.discount} discount` : 'Free shipping'}`, 'success');
        } else {
          showToast(result.message || 'Invalid promo code', 'error');
        }
      } else {
        showToast('Failed to validate promo code', 'error');
      }
    } catch (error) {
      console.error('Promo code error:', error);
      showToast('Error applying promo code', 'error');
    } finally {
      setApplyingPromo(false);
    }
  };

  const removePromoCode = () => {
    setPromoCode('');
    setDiscount(0);
    setAppliedPromo(null);
    showToast('Promo code removed', 'info');
  };

  const handlePayment = async () => {
    if (!validateForm()) {
      showToast('Please fix the form errors before proceeding', 'error');
      return;
    }

    setLoading(true);

    try {
      const cartSummary = getCartSummary();
      const cartItemsForCheckout = getCartItemsForCheckout();
      
      const orderData = {
        items: cartItemsForCheckout,
        totalAmount: parseFloat(cartSummary.total) - discount,
        subtotal: parseFloat(cartSummary.subtotal),
        shipping: parseFloat(cartSummary.shipping),
        discount: discount,
        promoCode: appliedPromo ? promoCode : null,
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

      console.log('🛒 Processing payment with:', orderData);

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
            discount: orderData.discount
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
            discount: orderData.discount
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
            shippingAddress: orderData.shippingAddress
          };
          break;

        default:
          throw new Error('Invalid payment method');
      }

      console.log(`💰 Sending payment request to: ${paymentEndpoint}`, paymentData);

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
      console.log('✅ Payment response:', result);

      if (result.success) {
        // Handle different payment methods
        if (selectedPayment === 'stripe' && result.sessionUrl) {
          showToast('Redirecting to secure payment...', 'success');
          setTimeout(() => {
            window.location.href = result.sessionUrl;
          }, 1000);
          return;
        
        } else if (selectedPayment === 'khalti' && result.payment_url) {
          showToast('Redirecting to Khalti...', 'success');
          setTimeout(() => {
            window.location.href = result.payment_url;
          }, 1000);
          return;
        
        } else if (selectedPayment === 'esewa' && result.formData) {
          showToast('Redirecting to eSewa...', 'success');
          
          // Submit eSewa form automatically after a brief delay
          setTimeout(() => {
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = result.submit_url;
            form.style.display = 'none';

            Object.keys(result.formData).forEach(key => {
              const input = document.createElement('input');
              input.type = 'hidden';
              input.name = key;
              input.value = result.formData[key];
              form.appendChild(input);
            });

            document.body.appendChild(form);
            console.log('📤 Submitting eSewa form to:', result.submit_url);
            console.log('📋 eSewa form data:', result.formData);
            form.submit();
          }, 1000);
          return;
        
        } else if (selectedPayment === 'cod' || result.redirect_url) {
          // Handle COD and other redirects
          const redirectUrl = result.redirect_url || `/order-success?orderId=${result.orderId}&payment=${selectedPayment}&success=true`;
          
          showToast('Order placed successfully!', 'success');
          
          // Clear cart for successful orders
          await clearCart();
          
          console.log('🔄 Redirecting to:', redirectUrl);
          
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
        showToast(result.message || 'Payment failed. Please try again.', 'error');
      }

    } catch (error) {
      console.error('❌ Payment error:', error);
      showToast(error.message || 'Payment processing failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle successful returns from payment gateways
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentSuccess = urlParams.get('success');
    const orderId = urlParams.get('orderId');
    const paymentMethod = urlParams.get('payment');
    
    if (paymentSuccess === 'true' && orderId) {
      showToast('Payment completed successfully!', 'success');
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
  const shipping = parseFloat(cartSummary.shipping);
  const totalBeforeDiscount = subtotal + shipping;
  const total = totalBeforeDiscount - discount;

  if (isCartEmpty()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Add some amazing products to your cart before checkout.</p>
            <button
              onClick={() => navigate('/products')}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Secure Checkout
          </h1>
          <p className="text-gray-600">Complete your purchase with confidence</p>
        </div>

        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ message: '', type: 'success' })} 
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Forms */}
          <div className="space-y-6">
            {/* Shipping Information */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-sm font-bold">1</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Shipping Information</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      formErrors.fullName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your full name"
                  />
                  {formErrors.fullName && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.fullName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      formErrors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="your@email.com"
                  />
                  {formErrors.email && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      formErrors.address ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Your complete address"
                  />
                  {formErrors.address && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.address}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      formErrors.city ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Your city"
                  />
                  {formErrors.city && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.city}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Postal Code *
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      formErrors.postalCode ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="44600"
                  />
                  {formErrors.postalCode && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.postalCode}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      formErrors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="98XXXXXXXX"
                  />
                  {formErrors.phone && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Delivery Notes (Optional)
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Any special delivery instructions..."
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-sm font-bold">2</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Payment Method *</h2>
              </div>

              <div className="space-y-4">
                {/* Stripe */}
                <label className="flex items-center p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-blue-50">
                  <input
                    type="radio"
                    name="payment"
                    value="stripe"
                    checked={selectedPayment === 'stripe'}
                    onChange={(e) => setSelectedPayment(e.target.value)}
                    className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="ml-4 flex items-center gap-4">
                    <img
                      src="/images/stripe.png"
                      alt="Stripe"
                      className="w-12 h-8 object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                    />
                    <div className="w-12 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded flex items-center justify-center text-white font-bold text-xs hidden">
                      CARD
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900">Credit/Debit Card</span>
                      <p className="text-sm text-gray-500">Secure payment via Stripe</p>
                    </div>
                  </div>
                </label>

                {/* Khalti */}
                <label className="flex items-center p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-purple-500 transition-all duration-200 bg-gray-50 hover:bg-purple-50">
                  <input
                    type="radio"
                    name="payment"
                    value="khalti"
                    checked={selectedPayment === 'khalti'}
                    onChange={(e) => setSelectedPayment(e.target.value)}
                    className="w-5 h-5 text-purple-600 focus:ring-purple-500"
                  />
                  <div className="ml-4 flex items-center gap-4">
                    <img
                      src="/images/khalti.png"
                      alt="Khalti"
                      className="w-12 h-8 object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                    />
                    <div className="w-12 h-8 bg-purple-600 rounded flex items-center justify-center text-white font-bold text-xs hidden">
                      KHT
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900">Khalti Wallet</span>
                      <p className="text-sm text-gray-500">Fast and secure mobile payment</p>
                    </div>
                  </div>
                </label>

                {/* eSewa */}
                <label className="flex items-center p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-green-500 transition-all duration-200 bg-gray-50 hover:bg-green-50">
                  <input
                    type="radio"
                    name="payment"
                    value="esewa"
                    checked={selectedPayment === 'esewa'}
                    onChange={(e) => setSelectedPayment(e.target.value)}
                    className="w-5 h-5 text-green-600 focus:ring-green-500"
                  />
                  <div className="ml-4 flex items-center gap-4">
                    <img
                      src="/images/esewa.png"
                      alt="eSewa"
                      className="w-12 h-8 object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                    />
                    <div className="w-12 h-8 bg-green-600 rounded flex items-center justify-center text-white font-bold text-xs hidden">
                      eSewa
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900">eSewa Wallet</span>
                      <p className="text-sm text-gray-500">Popular digital wallet in Nepal</p>
                    </div>
                  </div>
                </label>

                {/* Cash on Delivery */}
                <label className="flex items-center p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-orange-500 transition-all duration-200 bg-gray-50 hover:bg-orange-50">
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={selectedPayment === 'cod'}
                    onChange={(e) => setSelectedPayment(e.target.value)}
                    className="w-5 h-5 text-orange-600 focus:ring-orange-500"
                  />
                  <div className="ml-4 flex items-center gap-4">
                    <img
                      src="/images/cod.png"
                      alt="Cash on Delivery"
                      className="w-12 h-8 object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                    />
                    <div className="w-12 h-8 bg-orange-500 rounded flex items-center justify-center text-white font-bold text-xs hidden">
                      COD
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900">Cash on Delivery</span>
                      <p className="text-sm text-gray-500">Pay when you receive your order</p>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 sticky top-6">
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-sm font-bold">3</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Order Summary</h2>
              </div>

              {/* Promo Code Section */}
              <div className="mb-6">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    placeholder="Enter promo code"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    disabled={applyingPromo || appliedPromo}
                  />
                  {appliedPromo ? (
                    <button
                      onClick={removePromoCode}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      onClick={applyPromoCode}
                      disabled={applyingPromo || !promoCode.trim()}
                      className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {applyingPromo ? '...' : 'Apply'}
                    </button>
                  )}
                </div>
                {appliedPromo && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-700 text-sm">
                      ✅ {appliedPromo.description || `Promo code applied! Rs. ${discount} discount`}
                    </p>
                  </div>
                )}
              </div>

              {/* Order Items */}
              <div className="space-y-4 mb-6 max-h-80 overflow-y-auto">
                {cartItems.map((item, index) => {
                  const product = item.product || item;
                  const price = parseFloat(product.price || 0);
                  const itemTotal = price * item.quantity;

                  return (
                    <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg flex items-center justify-center overflow-hidden">
                          <img
                            src={product.image_url || 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500'}
                            alt={product.name}
                            className="w-14 h-14 object-cover rounded"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500';
                            }}
                          />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{product.name}</h3>
                          <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                          <p className="text-sm font-medium text-purple-600">Rs. {price.toFixed(2)}</p>
                        </div>
                      </div>
                      <span className="font-bold text-gray-900">Rs. {itemTotal.toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({cartSummary.itemCount} items)</span>
                  <span>Rs. {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>Rs. {shipping.toFixed(2)}</span>
                </div>
                <div className="text-xs text-gray-500 -mt-2">
                  <em>Rs. 50 delivery charge all over Nepal</em>
                </div>
                
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>- Rs. {discount.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Amount</span>
                    <span className="text-purple-600">Rs. {total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Security Badge */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-green-800">Secure Checkout</p>
                    <p className="text-green-600 text-sm">Your payment information is encrypted and secure</p>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-4 px-6 rounded-xl font-bold text-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3 shadow-lg"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <span>Complete Order</span>
                    <span>•</span>
                    <span>Rs. {total.toFixed(2)}</span>
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                By completing your purchase, you agree to our{' '}
                <a href="/terms" className="text-blue-600 hover:underline font-medium">Terms of Service</a>
                {' '}and{' '}
                <a href="/privacy" className="text-blue-600 hover:underline font-medium">Privacy Policy</a>
              </p>
            </div>

            {/* Support Info */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                Need Help?
              </h3>
              <p className="text-gray-600 text-sm mb-3">
                Our support team is here to help with any questions about your order.
              </p>
              <div className="flex gap-3">
                <button className="flex-1 bg-white border border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors">
                  Contact Support
                </button>
                <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors">
                  Live Chat
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;