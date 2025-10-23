import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext.js';
import { useAuth } from '../context/AuthContext.js';
import { Link, useNavigate } from 'react-router-dom';
import { Toast } from '../components/Toast.js';
import ConfirmationModal from '../components/ConfirmationModel.js';
import SupportWidget from '../components/SupportWidget.js';

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
  
  // ✅ State for confirmation modals
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);

  useEffect(() => {
    // Only refresh if cart is empty but user is authenticated
    if (user && cartItems.length === 0) {
      refreshCart();
    }
  }, [user, cartItems.length, refreshCart]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: 'success' }), 3000);
  };

  const handleQuantityChange = async (productId, newQuantity) => {
    if (!user) {
      showToast('Please login to update cart', 'error');
      return;
    }

    console.log('Updating quantity:', productId, newQuantity);
    setUpdatingItem(productId);
    
    try {
      const result = await updateCartItem(productId, newQuantity);
      console.log('Update result:', result);
      
      // ✅ Check the actual success status from the result
      if (result.success) {
        showToast(result.message || 'Cart updated successfully', 'success');
      } else {
        showToast(result.error || 'Failed to update cart', 'error');
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      showToast('Error updating quantity. Please try again.', 'error');
    } finally {
      setUpdatingItem(null);
    }
  };

  // ✅ Updated remove item handler with custom modal
  const handleRemoveClick = (productId, productName) => {
    setItemToRemove({ id: productId, name: productName });
    setShowRemoveModal(true);
  };

  const handleRemoveConfirm = async () => {
    if (!itemToRemove) return;

    console.log('Removing item:', itemToRemove.id);
    setRemovingItem(itemToRemove.id);
    setShowRemoveModal(false);
    
    try {
      const result = await removeFromCart(itemToRemove.id);
      console.log('Remove result:', result);
      
      if (result.success) {
        showToast(result.message || 'Item removed from cart', 'success');
      } else {
        showToast(result.error || 'Failed to remove item', 'error');
      }
    } catch (error) {
      console.error('Error removing item:', error);
      showToast('Error removing item. Please try again.', 'error');
    } finally {
      setRemovingItem(null);
      setItemToRemove(null);
    }
  };

  // ✅ Updated clear cart handler with custom modal
  const handleClearClick = () => {
    setShowClearModal(true);
  };

  const handleClearConfirm = async () => {
    setShowClearModal(false);

    console.log('Clearing cart');
    
    try {
      const result = await clearCart();
      console.log('Clear cart result:', result);
      
      if (result.success) {
        showToast(result.message || 'Cart cleared successfully', 'success');
      } else {
        showToast(result.error || 'Failed to clear cart', 'error');
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      showToast('Error clearing cart. Please try again.', 'error');
    }
  };

  const incrementQuantity = (item) => {
    const productId = item.product_id || item.product?.id || item.id;
    handleQuantityChange(productId, item.quantity + 1);
  };

  const decrementQuantity = (item) => {
    if (item.quantity > 1) {
      const productId = item.product_id || item.product?.id || item.id;
      handleQuantityChange(productId, item.quantity - 1);
    }
  };

  const handleCheckout = () => {
    if (isCartEmpty()) {
      showToast('Your cart is empty', 'error');
      return;
    }
    navigate('/checkout');
  };

  // ✅ Helper function to get product data safely
  const getProductData = (item) => {
    return {
      id: item.product_id || item.product?.id || item.id,
      name: item.product?.name || item.name || 'Unknown Product',
      price: item.product?.price || item.price || 0,
      category: item.product?.category || item.category || 'Uncategorized',
      image_url: item.product?.image_url || item.image_url || '/api/placeholder/80/80'
    };
  };

  if (loading && cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading your cart...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Please Login</h2>
            <p className="text-gray-600 mb-8">You need to be logged in to view your cart.</p>
            <Link
              to="/login"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
            >
              Login to Continue
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Your Shopping Cart</h1>
          <p className="text-gray-600">
            {isCartEmpty() ? 'Your cart is empty' : `You have ${cartItems.length} item(s) in your cart`}
          </p>
        </div>

        {/* Toast Notification */}
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ message: '', type: 'success' })} 
        />

        {/* ✅ Remove Item Confirmation Modal */}
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

        {/* ✅ Clear Cart Confirmation Modal */}
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
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
            <div className="text-6xl mb-4">🛒</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Your cart is empty</h3>
            <p className="text-gray-600 mb-8">Start shopping to add items to your cart!</p>
            <Link
              to="/products"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Cart Items */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {cartItems.map((item, index) => {
                const product = getProductData(item);
                const productId = product.id;
                const quantity = item.quantity;
                const price = parseFloat(product.price);
                const total = price * quantity;

                return (
                  <div
                    key={`${productId}-${index}`}
                    className={`flex flex-col sm:flex-row items-center p-6 ${
                      index !== cartItems.length - 1 ? 'border-b border-gray-200' : ''
                    } transition-all duration-200 hover:bg-gray-50`}
                  >
                    {/* Product Image */}
                    <div className="flex-shrink-0 w-20 h-20 mb-4 sm:mb-0 sm:mr-6">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500';
                        }}
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 text-center sm:text-left mb-4 sm:mb-0">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {product.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-2">
                        {product.category}
                      </p>
                      <p className="text-lg font-bold text-blue-600">
                        Rs. {price.toFixed(2)}
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-3 mb-4 sm:mb-0">
                      <button
                        onClick={() => decrementQuantity(item)}
                        disabled={updatingItem === productId || quantity <= 1}
                        className="w-8 h-8 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        −
                      </button>
                      
                      <span className="w-12 text-center font-medium text-gray-900">
                        {updatingItem === productId ? (
                          <div className="animate-spin h-4 w-4 border border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                        ) : (
                          quantity
                        )}
                      </span>
                      
                      <button
                        onClick={() => incrementQuantity(item)}
                        disabled={updatingItem === productId}
                        className="w-8 h-8 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        +
                      </button>
                    </div>

                    {/* Total Price */}
                    <div className="text-center sm:text-right mb-4 sm:mb-0 sm:ml-6">
                      <p className="text-lg font-bold text-gray-900">
                        Rs. {total.toFixed(2)}
                      </p>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemoveClick(productId, product.name)}
                      disabled={removingItem === productId || updatingItem === productId}
                      className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors p-2 hover:bg-red-50 rounded-lg"
                      title="Remove item"
                    >
                      {removingItem === productId ? (
                        <div className="animate-spin h-5 w-5 border border-red-600 border-t-transparent rounded-full"></div>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Cart Summary */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xl font-semibold text-gray-900">Total:</span>
                <span className="text-2xl font-bold text-blue-600">
                  Rs. {getCartTotal().toFixed(2)}
                </span>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleClearClick}
                  disabled={loading}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Clear Cart
                </button>
                
                <button
                  onClick={handleCheckout}
                  disabled={loading || isCartEmpty()}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Proceed to Checkout
                </button>
              </div>
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