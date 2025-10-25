const Order = require('../models/orderModel');
const Cart = require('../models/cartModel');

// Create new order
const createOrder = async (req, res) => {
  try {
    const { payment_method, shipping_address, items, totalAmount } = req.body;
    const user_id = req.user.id;

    console.log('🛒 Creating order for user:', user_id);
    console.log('📦 Order items:', items);
    console.log('💰 Total amount:', totalAmount);

    // Validate cart items
    if (!items || items.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Cart is empty. Please add items to cart before checkout.' 
      });
    }

    // Calculate total amount if not provided
    const calculatedTotal = totalAmount || items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);

    // Create order
    const orderResult = await Order.create({
      user_id,
      total_amount: calculatedTotal,
      payment_method: payment_method || 'cod',
      shipping_address: shipping_address
    });

    const orderId = orderResult.insertId;

    // Create order items
    const orderItems = items.map(item => ({
      product_id: item.productId || item.id,
      quantity: item.quantity,
      price: item.price
    }));

    await Order.createOrderItems(orderId, orderItems);

    // Clear user's cart after order creation
    try {
      await Cart.clearCart(user_id);
      console.log('✅ Cart cleared after order creation');
    } catch (cartError) {
      console.error('⚠️ Could not clear cart:', cartError);
      // Don't fail the order if cart clearing fails
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: {
        id: orderId,
        total_amount: calculatedTotal,
        items: orderItems
      }
    });

  } catch (error) {
    console.error('❌ Create order error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error creating order: ' + error.message 
    });
  }
};

// Get user's orders
const getUserOrders = async (req, res) => {
  try {
    const user_id = req.user.id;
    const orders = await Order.findByUserId(user_id);
    
    res.json({
      success: true,
      orders: orders
    });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching orders' 
    });
  }
};

// Get single order
const getOrderById = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: 'Order not found' 
      });
    }

    // Check if user owns the order or is admin
    if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to view this order' 
      });
    }

    res.json({
      success: true,
      order: order
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching order' 
    });
  }
};

// Get all orders (Admin only)
const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;
    
    const result = await Order.findAllWithPagination(limit, offset, status);
    
    res.json({
      success: true,
      orders: result.orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(result.total / limit),
        totalOrders: result.total,
        hasNext: page < Math.ceil(result.total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching orders' 
    });
  }
};

// Update order status (Admin only) - FIXED: Enhanced status update
const updateOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status, statusType = 'order' } = req.body;

    console.log(`🔄 Updating ${statusType} status for order ${orderId} to ${status}`);

    if (statusType === 'order') {
      const validStatuses = ['pending', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ 
          success: false,
          message: 'Invalid order status. Must be one of: ' + validStatuses.join(', ') 
        });
      }

      const result = await Order.updateStatus(orderId, status);
      
      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Order not found or no changes made'
        });
      }
      
      console.log(`✅ Order ${orderId} status updated to ${status}`);
      
    } else if (statusType === 'payment') {
      const validStatuses = ['pending', 'completed', 'failed', 'refunded'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ 
          success: false,
          message: 'Invalid payment status. Must be one of: ' + validStatuses.join(', ') 
        });
      }

      const result = await Order.updatePaymentStatus(orderId, status);
      
      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Order not found or no changes made'
        });
      }
      
      console.log(`✅ Order ${orderId} payment status updated to ${status}`);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid status type. Must be "order" or "payment"'
      });
    }
    
    res.json({ 
      success: true,
      message: `${statusType.charAt(0).toUpperCase() + statusType.slice(1)} status updated successfully` 
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error updating order status: ' + error.message 
    });
  }
};

// Get sales statistics (Admin only)
const getSalesStats = async (req, res) => {
  try {
    const stats = await Order.getSalesStats();
    res.json({
      success: true,
      stats: stats
    });
  } catch (error) {
    console.error('Get sales stats error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching sales statistics' 
    });
  }
};

// Get order analytics for admin dashboard
const getOrderAnalytics = async (req, res) => {
  try {
    const analytics = await Order.getOrderAnalytics();
    res.json({
      success: true,
      analytics: analytics
    });
  } catch (error) {
    console.error('Get order analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order analytics'
    });
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  getSalesStats,
  getOrderAnalytics
};