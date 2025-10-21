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

  // Enhanced addToCart
  const addToCart = async (product, quantity = 1) => {
    if (!isAuthenticated) {
      return { success: false, error: 'Please login to add items to cart' };
    }

    return executeWithRetry(async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/cart/add`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            productId: product.id,
            quantity: quantity
          })
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
  const updateCartItem = async (productId, quantity) => {
    if (!isAuthenticated) {
      return { success: false, error: 'Please login to update cart' };
    }

    if (quantity < 1) {
      return removeFromCart(productId);
    }

    const previousItems = [...cartItems];

    // Optimistic update
    setCartItems(prev =>
      prev.map(item =>
        (item.product_id || item.product?.id) === productId
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
          body: JSON.stringify({ quantity })
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
  const removeFromCart = async (productId) => {
    if (!isAuthenticated) {
      return { success: false, error: 'Please login to remove items' };
    }

    const removedItem = cartItems.find(item => 
      (item.product_id || item.product?.id) === productId
    );
    const previousItems = [...cartItems];
    
    // Optimistic update
    setCartItems(prev =>
      prev.filter(item => (item.product_id || item.product?.id) !== productId)
    );

    return executeWithRetry(async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/cart/remove/${productId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
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

  // Cart calculations
  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = parseFloat(item.product?.price || item.price || 0);
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
      price: parseFloat(item.product?.price || item.price || 0),
      quantity: item.quantity,
      image_url: item.product?.image_url || item.image_url,
      description: item.product?.description || item.description
    }));
  };

  // Get cart summary for order creation
  const getCartSummary = () => {
    const subtotal = getCartTotal();
    const shipping = subtotal > 0 ? 100 : 0; // Fixed shipping for Nepal
    const total = subtotal + shipping;
    
    return {
      subtotal: subtotal.toFixed(2),
      shipping: shipping.toFixed(2),
      total: total.toFixed(2),
      items: getCartItemsForCheckout(),
      itemCount: getCartItemsCount()
    };
  };

  const value = {
    cartItems,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartItemsCount,
    getCartCount,
    isCartEmpty,
    getCartItemsForCheckout,
    getCartSummary,
    loading,
    refreshCart: fetchCart,
    forceRefreshCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};