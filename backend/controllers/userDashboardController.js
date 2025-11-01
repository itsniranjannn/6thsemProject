const User = require('../models/userModel');
const Order = require('../models/orderModel');
const Payment = require('../models/paymentModel');
const db = require('../config/db');

// Get user dashboard statistics
const getUserDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's orders count by status
    const [orderStats] = await db.execute(`
      SELECT 
        COUNT(*) as total_orders,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_orders,
        SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed_orders,
        SUM(CASE WHEN status = 'shipped' THEN 1 ELSE 0 END) as shipped_orders,
        SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered_orders,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_orders,
        SUM(total_amount) as total_spent
      FROM orders 
      WHERE user_id = ?
    `, [userId]);

    // Get recent orders
    const [recentOrders] = await db.execute(`
      SELECT o.*, 
             COUNT(oi.id) as item_count,
             SUM(oi.quantity) as total_items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.user_id = ?
      GROUP BY o.id
      ORDER BY o.created_at DESC
      LIMIT 5
    `, [userId]);

    // Get payment methods used
    const [paymentMethods] = await db.execute(`
      SELECT payment_method, COUNT(*) as usage_count
      FROM payments 
      WHERE order_id IN (SELECT id FROM orders WHERE user_id = ?)
      GROUP BY payment_method
    `, [userId]);

    res.json({
      success: true,
      stats: {
        totalOrders: orderStats[0]?.total_orders || 0,
        pendingOrders: orderStats[0]?.pending_orders || 0,
        confirmedOrders: orderStats[0]?.confirmed_orders || 0,
        shippedOrders: orderStats[0]?.shipped_orders || 0,
        deliveredOrders: orderStats[0]?.delivered_orders || 0,
        cancelledOrders: orderStats[0]?.cancelled_orders || 0,
        totalSpent: orderStats[0]?.total_spent || 0,
        recentOrders: recentOrders,
        paymentMethods: paymentMethods,
        successRate: orderStats[0]?.total_orders > 0 ? 
          Math.round(((orderStats[0]?.delivered_orders || 0) / orderStats[0]?.total_orders) * 100) : 100
      }
    });
  } catch (error) {
    console.error('Get user dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics'
    });
  }
};

// Update user profile with enhanced fields
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, phone, address, city, country } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required'
      });
    }

    // Check if email is already taken by another user
    const [existingUser] = await db.execute(
      'SELECT id FROM users WHERE email = ? AND id != ?',
      [email, userId]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email is already taken by another user'
      });
    }

    // Update user profile with enhanced fields
    await db.execute(
      'UPDATE users SET name = ?, email = ?, phone = ?, address = ?, city = ?, country = ? WHERE id = ?',
      [name, email, phone || null, address || null, city || null, country || 'Nepal', userId]
    );

    // Get updated user data
    const [updatedUser] = await db.execute(
      'SELECT id, name, email, phone, address, city, country, role, email_verified, created_at FROM users WHERE id = ?',
      [userId]
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser[0]
    });
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile'
    });
  }
};

// Cancel user order with automatic refund
const cancelUserOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const orderId = req.params.id;

    // Get order details
    const [orders] = await db.execute(`
      SELECT o.*, p.payment_status, p.transaction_id, p.amount as paid_amount
      FROM orders o
      LEFT JOIN payments p ON o.id = p.order_id
      WHERE o.id = ? AND o.user_id = ?
    `, [orderId, userId]);

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or access denied'
      });
    }

    const order = orders[0];

    // Check if order can be cancelled
    if (order.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Order is already cancelled'
      });
    }

    if (order.status === 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel delivered order'
      });
    }

    if (order.status === 'shipped') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel shipped order. Please contact support.'
      });
    }

    // Start transaction
    await db.execute('START TRANSACTION');

    try {
      // Update order status to cancelled
      await db.execute(
        'UPDATE orders SET status = "cancelled" WHERE id = ?',
        [orderId]
      );

      // If payment was completed, mark as refunded and set amount to 0
      if (order.payment_status === 'completed' && order.paid_amount > 0) {
        await db.execute(
          'UPDATE payments SET payment_status = "refunded", amount = 0 WHERE order_id = ?',
          [orderId]
        );

        // Update order payment status as well
        await db.execute(
          'UPDATE orders SET payment_status = "refunded" WHERE id = ?',
          [orderId]
        );

        // Restore stock for cancelled order items
        const [orderItems] = await db.execute(
          'SELECT product_id, quantity FROM order_items WHERE order_id = ?',
          [orderId]
        );

        for (const item of orderItems) {
          await db.execute(
            'UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?',
            [item.quantity, item.product_id]
          );
        }
      }

      await db.execute('COMMIT');

      res.json({
        success: true,
        message: 'Order cancelled successfully. Payment has been refunded.',
        orderId: orderId
      });

    } catch (transactionError) {
      await db.execute('ROLLBACK');
      throw transactionError;
    }

  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling order'
    });
  }
};

// Get user's detailed order history
const getUserOrderHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT o.*, 
             p.payment_method,
             p.payment_status as payment_status_detail,
             p.transaction_id,
             p.amount as paid_amount,
             COUNT(oi.id) as item_count,
             SUM(oi.quantity) as total_items
      FROM orders o
      LEFT JOIN payments p ON o.id = p.order_id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.user_id = ?
    `;

    const params = [userId];

    if (status && status !== 'all') {
      query += ' AND o.status = ?';
      params.push(status);
    }

    query += ` GROUP BY o.id ORDER BY o.created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const [orders] = await db.execute(query, params);

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM orders WHERE user_id = ?';
    const countParams = [userId];

    if (status && status !== 'all') {
      countQuery += ' AND status = ?';
      countParams.push(status);
    }

    const [totalResult] = await db.execute(countQuery, countParams);
    const total = totalResult[0].total;

    // Get order items for each order
    for (let order of orders) {
      const [items] = await db.execute(`
        SELECT oi.*, p.name as product_name, p.image_url
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `, [order.id]);

      order.items = items;
    }

    res.json({
      success: true,
      orders: orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalOrders: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get user order history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order history'
    });
  }
};

// Get single order with full details
const getOrderDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    const orderId = req.params.id;

    const [orders] = await db.execute(`
      SELECT o.*, 
             p.payment_method,
             p.payment_status as payment_status_detail,
             p.transaction_id,
             p.amount as paid_amount,
             p.payment_data,
             p.created_at as payment_date
      FROM orders o
      LEFT JOIN payments p ON o.id = p.order_id
      WHERE o.id = ? AND o.user_id = ?
    `, [orderId, userId]);

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const order = orders[0];

    // Get order items
    const [items] = await db.execute(`
      SELECT oi.*, 
             p.name as product_name, 
             p.description as product_description,
             p.image_url,
             p.category
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `, [orderId]);

    order.items = items;

    // Get order timeline/status history
    const [timeline] = await db.execute(`
      SELECT 'ordered' as status, created_at as date FROM orders WHERE id = ?
      UNION ALL
      SELECT 'confirmed' as status, updated_at as date FROM orders WHERE id = ? AND status = 'confirmed'
      UNION ALL
      SELECT 'shipped' as status, updated_at as date FROM orders WHERE id = ? AND status = 'shipped'
      UNION ALL
      SELECT 'delivered' as status, updated_at as date FROM orders WHERE id = ? AND status = 'delivered'
      ORDER BY date
    `, [orderId, orderId, orderId, orderId]);

    order.timeline = timeline;

    res.json({
      success: true,
      order: order
    });
  } catch (error) {
    console.error('Get order details error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order details'
    });
  }
};

module.exports = {
  getUserDashboardStats,
  updateUserProfile,
  cancelUserOrder,
  getUserOrderHistory,
  getOrderDetails
};