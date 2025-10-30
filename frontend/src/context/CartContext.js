import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext.js';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const { isAuthenticated, user } = useAuth();

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // Enhanced API response handler
  const handleApiResponse = async (response) => {
    const text = await response.text();
    let data;
    
    try {
      data = text ? JSON.parse(text) : {};
    } catch (error) {
      console.error('Failed to parse API response:', error);
      data = { message: 'Invalid response from server' };
    }

    const isSuccess = response.ok && (data.success === true || data.success === undefined);
    
    return {
      success: isSuccess,
      data: data,
      status: response.status,
      statusText: response.statusText
    };
  };

  // Enhanced retry logic
  const executeWithRetry = async (operation, maxRetries = 3) => {
    let lastError;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        console.log(`Operation attempt ${attempt} failed:`, error);
        
        const isRetryableError = 
          error.message?.includes('timeout') ||
          error.message?.includes('network') ||
          !error.response;
        
        if (isRetryableError && attempt < maxRetries) {
          console.log(`Retrying operation, attempt ${attempt + 1}`);
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        } else {
          throw error;
        }
      }
    }
    throw lastError;
  };

  // Force cart refresh
  const forceRefreshCart = useCallback(() => {
    setLastUpdate(Date.now());
  }, []);

  // Optimized fetchCart
  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCartItems([]);
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/cart`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        cache: 'no-cache'
      });

      const result = await handleApiResponse(response);
      console.log('🛒 Cart API Response:', result);

      if (result.success) {
        let items = [];
        const data = result.data;
        
        if (Array.isArray(data.items)) {
          items = data.items;
        } else if (Array.isArray(data.cartItems)) {
          items = data.cartItems;
        } else if (Array.isArray(data)) {
          items = data;
        }
        
        console.log('✅ Setting cart items:', items.length, 'items');
        setCartItems(items);
      } else {
        console.error('❌ Failed to fetch cart:', result.status, result.data);
        setCartItems([]);
      }
    } catch (error) {
      console.error('❌ Error fetching cart:', error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, API_BASE_URL, lastUpdate]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // UPDATED: Enhanced addToCart method with offer support
  const addToCart = async (product, quantity = 1) => {
    if (!isAuthenticated) {
      return { success: false, error: 'Please login to add items to cart' };
    }

    return executeWithRetry(async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Handle special offer quantities - FIXED FOR OFFERS PAGE
        let finalQuantity = product.quantity || quantity;
        
        // For BOGO offers from offers page, ensure we add 2 items
        if (product.offer_type === 'Bogo' && product.offer_id) {
          finalQuantity = 2; // Force 2 items for BOGO deals
        }

        const cartData = {
          productId: product.id || product.product_id,
          quantity: finalQuantity
        };

        // Include offer information if available (from offers page)
        if (product.offer_id) {
          cartData.offer_id = product.offer_id;
          cartData.offer_type = product.offer_type;
        }

        console.log('🛒 Adding to cart with data:', cartData);

        const response = await fetch(`${API_BASE_URL}/api/cart/add`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(cartData)
        });

        const result = await handleApiResponse(response);
        console.log('➕ Add to cart response:', result);

        if (result.success) {
          forceRefreshCart();
          return { 
            success: true, 
            message: result.data.message || 'Product added to cart!' 
          };
        } else {
          return { 
            success: false, 
            error: result.data.message || result.data.error || 'Failed to add to cart' 
          };
        }
      } catch (error) {
        console.error('❌ Add to cart error:', error);
        return { 
          success: false, 
          error: 'Network error. Please try again.' 
        };
      }
    });
  };

  // Enhanced updateCartItem
  const updateCartItem = async (productId, quantity, offerId = null) => {
    if (!isAuthenticated) {
      return { success: false, error: 'Please login to update cart' };
    }

    if (quantity < 1) {
      return removeFromCart(productId, offerId);
    }

    const previousItems = [...cartItems];

    // Optimistic update
    setCartItems(prev =>
      prev.map(item =>
        (item.product_id || item.product?.id) === productId && 
        (item.offer_id === offerId)
          ? { ...item, quantity: quantity }
          : item
      )
    );

    return executeWithRetry(async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/cart/update/${productId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ quantity, offer_id: offerId })
        });

        const result = await handleApiResponse(response);
        console.log('✏️ Update cart response:', result);

        if (result.success) {
          forceRefreshCart();
          return { 
            success: true, 
            message: result.data.message || 'Cart updated successfully' 
          };
        } else {
          setCartItems(previousItems);
          return { 
            success: false, 
            error: result.data.message || result.data.error || 'Failed to update cart' 
          };
        }
      } catch (error) {
        console.error('❌ Update cart error:', error);
        setCartItems(previousItems);
        return { 
          success: false, 
          error: 'Network error. Please try again.' 
        };
      }
    });
  };

  // Enhanced removeFromCart
  const removeFromCart = async (productId, offerId = null) => {
    if (!isAuthenticated) {
      return { success: false, error: 'Please login to remove items' };
    }

    const removedItem = cartItems.find(item => 
      (item.product_id || item.product?.id) === productId &&
      item.offer_id === offerId
    );
    const previousItems = [...cartItems];
    
    // Optimistic update
    setCartItems(prev =>
      prev.filter(item => 
        !((item.product_id || item.product?.id) === productId && 
        item.offer_id === offerId)
      )
    );

    return executeWithRetry(async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/cart/remove/${productId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ offer_id: offerId })
        });

        const result = await handleApiResponse(response);
        console.log('🗑️ Remove from cart response:', result);

        if (result.success) {
          forceRefreshCart();
          return { 
            success: true, 
            message: result.data.message || 'Item removed from cart' 
          };
        } else {
          setCartItems(previousItems);
          return { 
            success: false, 
            error: result.data.message || result.data.error || 'Failed to remove item' 
          };
        }
      } catch (error) {
        console.error('❌ Remove from cart error:', error);
        setCartItems(previousItems);
        return { 
          success: false, 
          error: 'Network error. Please try again.' 
        };
      }
    });
  };

  // Enhanced clearCart - used after successful payment
  const clearCart = async () => {
    if (!isAuthenticated) {
      return { success: false, error: 'Please login to clear cart' };
    }

    const previousItems = [...cartItems];
    
    // Optimistic update
    setCartItems([]);

    return executeWithRetry(async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/cart/clear`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const result = await handleApiResponse(response);
        console.log('🧹 Clear cart response:', result);

        if (result.success) {
          forceRefreshCart();
          return { 
            success: true, 
            message: result.data.message || 'Cart cleared successfully' 
          };
        } else {
          setCartItems(previousItems);
          return { 
            success: false, 
            error: result.data.message || result.data.error || 'Failed to clear cart' 
          };
        }
      } catch (error) {
        console.error('❌ Clear cart error:', error);
        setCartItems(previousItems);
        return { 
          success: false, 
          error: 'Network error. Please try again.' 
        };
      }
    });
  };

  // Cart calculations - UPDATED to use final_price for offers
  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      // Use final_price for offer items, otherwise use regular price
      const price = parseFloat(item.final_price || item.product?.price || item.price || 0);
      return total + (price * item.quantity);
    }, 0);
  };

  const getCartItemsCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  const isCartEmpty = () => {
    return cartItems.length === 0;
  };

  const getCartCount = () => {
    return getCartItemsCount();
  };

  // Format cart items for checkout according to database schema
  const getCartItemsForCheckout = () => {
    return cartItems.map(item => ({
      id: item.product_id || item.product?.id || item.id,
      name: item.product?.name || item.name,
      price: parseFloat(item.final_price || item.product?.price || item.price || 0),
      quantity: item.quantity,
      image_url: item.product?.image_url || item.image_url,
      description: item.product?.description || item.description,
      category: item.product?.category || item.category,
      offer_id: item.offer_id,
      offer_type: item.offer_type,
      has_offer: item.has_offer
    }));
  };

  // Get cart summary for order creation - UPDATED with Rs. 50 shipping
  const getCartSummary = () => {
    const subtotal = getCartTotal();
    const shipping = subtotal > 0 ? 50 : 0; // Fixed Rs. 50 shipping for Nepal
    const total = subtotal + shipping;
    
    return {
      subtotal: subtotal.toFixed(2),
      shipping: shipping.toFixed(2),
      total: total.toFixed(2),
      items: getCartItemsForCheckout(),
      itemCount: getCartItemsCount()
    };
  };

  // Get cart item by product ID and offer ID
  const getCartItem = (productId, offerId = null) => {
    return cartItems.find(item => 
      (item.product_id || item.product?.id) === productId &&
      item.offer_id === offerId
    );
  };

  // Check if product is in cart
  const isProductInCart = (productId, offerId = null) => {
    return cartItems.some(item => 
      (item.product_id || item.product?.id) === productId &&
      item.offer_id === offerId
    );
  };

  // Get product quantity in cart
  const getProductQuantity = (productId, offerId = null) => {
    const item = cartItems.find(item => 
      (item.product_id || item.product?.id) === productId &&
      item.offer_id === offerId
    );
    return item ? item.quantity : 0;
  };

  // Calculate total savings if products have original prices
  const getTotalSavings = () => {
    return cartItems.reduce((savings, item) => {
      const currentPrice = parseFloat(item.final_price || item.product?.price || item.price || 0);
      const originalPrice = parseFloat(item.product?.original_price || item.original_price || currentPrice);
      return savings + ((originalPrice - currentPrice) * item.quantity);
    }, 0);
  };

  // Get cart items grouped by category
  const getCartItemsByCategory = () => {
    const grouped = {};
    cartItems.forEach(item => {
      const category = item.product?.category || item.category || 'Uncategorized';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(item);
    });
    return grouped;
  };

  // Validate cart items (check if products are still available)
  const validateCart = async () => {
    if (!isAuthenticated || cartItems.length === 0) {
      return { valid: true, items: [] };
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/cart/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await handleApiResponse(response);
      
      if (result.success) {
        return result.data;
      } else {
        return { valid: false, items: [], error: result.data.message };
      }
    } catch (error) {
      console.error('Cart validation error:', error);
      return { valid: false, items: [], error: 'Failed to validate cart' };
    }
  };

  // Merge local cart with server cart after login
  const mergeCarts = async (localCartItems) => {
    if (!isAuthenticated || localCartItems.length === 0) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/cart/merge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ items: localCartItems })
      });

      const result = await handleApiResponse(response);
      
      if (result.success) {
        forceRefreshCart();
        return { success: true, merged: result.data.merged || 0 };
      } else {
        return { success: false, error: result.data.message };
      }
    } catch (error) {
      console.error('Cart merge error:', error);
      return { success: false, error: 'Failed to merge carts' };
    }
  };

  // Export cart data (for sharing, backup, etc.)
  const exportCartData = () => {
    return {
      items: cartItems.map(item => ({
        productId: item.product_id || item.product?.id,
        name: item.product?.name || item.name,
        price: item.final_price || item.product?.price || item.price,
        original_price: item.product?.original_price || item.original_price,
        quantity: item.quantity,
        image: item.product?.image_url || item.image_url,
        category: item.product?.category || item.category,
        offer_id: item.offer_id,
        offer_type: item.offer_type,
        has_offer: item.has_offer
      })),
      summary: getCartSummary(),
      exportedAt: new Date().toISOString()
    };
  };

  const value = {
    // State
    cartItems,
    loading,
    
    // Core operations
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    
    // Calculations
    getCartTotal,
    getCartItemsCount,
    getCartCount,
    isCartEmpty,
    getCartItemsForCheckout,
    getCartSummary,
    
    // Enhanced features
    getCartItem,
    isProductInCart,
    getProductQuantity,
    getTotalSavings,
    getCartItemsByCategory,
    validateCart,
    mergeCarts,
    exportCartData,
    
    // Utilities
    refreshCart: fetchCart,
    forceRefreshCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};