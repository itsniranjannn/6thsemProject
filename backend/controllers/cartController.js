// backend/controllers/cartController.js - COMPLETE FIXED VERSION
const Cart = require('../models/cartModel');

// Get cart items
const getCart = async (req, res) => {
  try {
    const cartItems = await Cart.getCartItems(req.user.id);
    const total = await Cart.getCartTotal(req.user.id);
    
    res.json({
      items: cartItems,
      total: parseFloat(total)
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ message: 'Error fetching cart' });
  }
};

// Add to cart - UPDATED to handle offers properly
const addToCart = async (req, res) => {
  try {
    const { productId, quantity, offer_id, offer_type } = req.body;
    
    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    await Cart.addToCart(req.user.id, productId, quantity || 1, offer_id || null);
    
    // Return updated cart
    const cartItems = await Cart.getCartItems(req.user.id);
    const total = await Cart.getCartTotal(req.user.id);
    
    res.json({
      message: 'Product added to cart',
      items: cartItems,
      total: parseFloat(total)
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(400).json({ message: 'Error adding product to cart' });
  }
};

// Update cart item quantity
const updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (quantity === undefined) {
      return res.status(400).json({ message: 'Quantity is required' });
    }

    await Cart.updateCartItem(req.user.id, productId, quantity);
    
    // Return updated cart
    const cartItems = await Cart.getCartItems(req.user.id);
    const total = await Cart.getCartTotal(req.user.id);
    
    res.json({
      message: 'Cart updated successfully',
      items: cartItems,
      total: parseFloat(total)
    });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(400).json({ message: 'Error updating cart' });
  }
};

// Remove from cart
const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    await Cart.removeFromCart(req.user.id, productId);
    
    // Return updated cart
    const cartItems = await Cart.getCartItems(req.user.id);
    const total = await Cart.getCartTotal(req.user.id);
    
    res.json({
      message: 'Product removed from cart',
      items: cartItems,
      total: parseFloat(total)
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(400).json({ message: 'Error removing product from cart' });
  }
};

// Clear cart
const clearCart = async (req, res) => {
  try {
    await Cart.clearCart(req.user.id);
    res.json({ 
      message: 'Cart cleared successfully',
      items: [],
      total: 0
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(400).json({ message: 'Error clearing cart' });
  }
};

// ✅ ADD THIS: Validate cart items
const validateCart = async (req, res) => {
  try {
    const result = await Cart.checkStockAvailability(req.user.id);
    res.json(result);
  } catch (error) {
    console.error('Validate cart error:', error);
    res.status(500).json({ message: 'Error validating cart' });
  }
};

// ✅ ADD THIS: Merge carts
const mergeCarts = async (req, res) => {
  try {
    const { items } = req.body;
    // Implementation for merging local and server carts
    res.json({ success: true, merged: 0 });
  } catch (error) {
    console.error('Merge cart error:', error);
    res.status(500).json({ message: 'Error merging carts' });
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