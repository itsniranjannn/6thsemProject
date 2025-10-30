// backend/controllers/cartController.js - COMPLETE FIXED VERSION
const Cart = require('../models/cartModel');

// Get cart items
const getCart = async (req, res) => {
  try {
    const cartItems = await Cart.getCartItems(req.user.id);
    const total = await Cart.getCartTotal(req.user.id);
    
    res.json({
      success: true,
      items: cartItems,
      total: parseFloat(total.toFixed(2)),
      itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0)
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching cart' 
    });
  }
};

// Add to cart - UPDATED to handle offers properly
const addToCart = async (req, res) => {
  try {
    const { productId, quantity, offer_id, offer_type } = req.body;
    
    if (!productId) {
      return res.status(400).json({ 
        success: false,
        message: 'Product ID is required' 
      });
    }

    // For BOGO offers from offers page, ensure quantity is 2
    let finalQuantity = quantity || 1;
    if (offer_type === 'Bogo' && offer_id) {
      finalQuantity = 2; // Force 2 items for BOGO deals
    }

    await Cart.addToCart(req.user.id, productId, finalQuantity, offer_id || null);
    
    // Return updated cart
    const cartItems = await Cart.getCartItems(req.user.id);
    const total = await Cart.getCartTotal(req.user.id);
    
    res.json({
      success: true,
      message: 'Product added to cart',
      items: cartItems,
      total: parseFloat(total.toFixed(2)),
      itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0)
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(400).json({ 
      success: false,
      message: 'Error adding product to cart' 
    });
  }
};

// Update cart item quantity
const updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity, offer_id } = req.body;

    if (quantity === undefined) {
      return res.status(400).json({ 
        success: false,
        message: 'Quantity is required' 
      });
    }

    await Cart.updateCartItem(req.user.id, productId, quantity, offer_id || null);
    
    // Return updated cart
    const cartItems = await Cart.getCartItems(req.user.id);
    const total = await Cart.getCartTotal(req.user.id);
    
    res.json({
      success: true,
      message: 'Cart updated successfully',
      items: cartItems,
      total: parseFloat(total.toFixed(2)),
      itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0)
    });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(400).json({ 
      success: false,
      message: 'Error updating cart' 
    });
  }
};

// Remove from cart
const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const { offer_id } = req.body;
    
    await Cart.removeFromCart(req.user.id, productId, offer_id || null);
    
    // Return updated cart
    const cartItems = await Cart.getCartItems(req.user.id);
    const total = await Cart.getCartTotal(req.user.id);
    
    res.json({
      success: true,
      message: 'Product removed from cart',
      items: cartItems,
      total: parseFloat(total.toFixed(2)),
      itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0)
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(400).json({ 
      success: false,
      message: 'Error removing product from cart' 
    });
  }
};

// Clear cart
const clearCart = async (req, res) => {
  try {
    await Cart.clearCart(req.user.id);
    res.json({ 
      success: true,
      message: 'Cart cleared successfully',
      items: [],
      total: 0,
      itemCount: 0
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(400).json({ 
      success: false,
      message: 'Error clearing cart' 
    });
  }
};

// Validate cart items
const validateCart = async (req, res) => {
  try {
    const result = await Cart.checkStockAvailability(req.user.id);
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Validate cart error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error validating cart' 
    });
  }
};

// Merge carts
const mergeCarts = async (req, res) => {
  try {
    const { items } = req.body;
    // Implementation for merging local and server carts
    let mergedCount = 0;
    
    if (items && Array.isArray(items)) {
      for (const item of items) {
        try {
          await Cart.addToCart(
            req.user.id, 
            item.productId, 
            item.quantity, 
            item.offer_id || null
          );
          mergedCount++;
        } catch (error) {
          console.error('Error merging item:', error);
        }
      }
    }
    
    res.json({ 
      success: true, 
      merged: mergedCount 
    });
  } catch (error) {
    console.error('Merge cart error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error merging carts' 
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  validateCart,
  mergeCarts
};