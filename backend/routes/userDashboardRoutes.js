const express = require('express');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Get user dashboard statistics
router.get('/dashboard/stats', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const db = require('../config/db');
    
    console.log(`📊 Fetching dashboard stats for user ${userId}`);

    // Get total orders with proper error handling
    const [orders] = await db.execute(
      'SELECT * FROM orders WHERE user_id = ?',
      [userId]
    );

    console.log(`✅ Found ${orders ? orders.length : 0} orders for user ${userId}`);

    const totalOrders = orders || [];
    const totalOrdersCount = totalOrders.length;

    // Get orders by status with safe array methods
    const pendingOrders = totalOrders.filter(order => order.status === 'pending').length;
    const confirmedOrders = totalOrders.filter(order => order.status === 'confirmed').length;
    const shippedOrders = totalOrders.filter(order => order.status === 'shipped').length;
    const deliveredOrders = totalOrders.filter(order => order.status === 'delivered').length;
    const cancelledOrders = totalOrders.filter(order => order.status === 'cancelled').length;

    // Calculate total spent safely
    const totalSpent = totalOrders.reduce((sum, order) => {
      if (order.payment_status === 'completed' && order.status !== 'cancelled') {
        return sum + parseFloat(order.total_amount || 0);
      }
      return sum;
    }, 0);

    // Calculate success rate
    const successfulOrders = deliveredOrders;
    const successRate = totalOrdersCount > 0 ? Math.round((successfulOrders / totalOrdersCount) * 100) : 0;

    res.json({
      success: true,
      stats: {
        totalOrders: totalOrdersCount,
        pendingOrders,
        confirmedOrders,
        shippedOrders,
        deliveredOrders,
        cancelledOrders,
        totalSpent,
        successRate
      }
    });
  } catch (error) {
    console.error('❌ Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics',
      error: error.message
    });
  }
});

// Get user order history with pagination
router.get('/orders/history', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    const db = require('../config/db');

    let query = `
      SELECT o.*, 
             COUNT(oi.id) as item_count,
             SUM(oi.quantity) as total_items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.user_id = ?
    `;

    const queryParams = [userId];

    if (status && status !== 'all') {
      query += ' AND o.status = ?';
      queryParams.push(status);
    }

    query += ' GROUP BY o.id ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
    queryParams.push(parseInt(limit), parseInt(offset));

    const [orders] = await db.execute(query, queryParams);

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM orders WHERE user_id = ?';
    const countParams = [userId];

    if (status && status !== 'all') {
      countQuery += ' AND status = ?';
      countParams.push(status);
    }

    const [countResult] = await db.execute(countQuery, countParams);
    const total = countResult[0].total;

    console.log(`✅ Order history: Found ${orders.length} orders for user ${userId}`);

    res.json({
      success: true,
      orders: orders || [],
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalOrders: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('❌ Order history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order history',
      error: error.message
    });
  }
});

// Get single order details with items
router.get('/orders/:id', protect, async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user.id;

    const db = require('../config/db');
    
    console.log(`🔍 Fetching order details for order ${orderId}, user ${userId}`);

    // Get order details
    const [orders] = await db.execute(`
      SELECT o.*, 
             p.name as product_name,
             p.description as product_description,
             p.image_url as product_image,
             oi.quantity,
             oi.price,
             oi.id as item_id
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE o.id = ? AND o.user_id = ?
    `, [orderId, userId]);

    if (!orders || orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Format order data
    const order = {
      id: orders[0].id,
      user_id: orders[0].user_id,
      total_amount: orders[0].total_amount,
      status: orders[0].status,
      payment_method: orders[0].payment_method,
      payment_status: orders[0].payment_status,
      shipping_address: orders[0].shipping_address,
      tracking_number: orders[0].tracking_number,
      estimated_delivery: orders[0].estimated_delivery,
      subtotal: orders[0].subtotal,
      shipping_fee: orders[0].shipping_fee,
      discount: orders[0].discount,
      created_at: orders[0].created_at,
      items: orders.map(row => ({
        id: row.item_id,
        product_name: row.product_name,
        product_description: row.product_description,
        product_image: row.product_image,
        quantity: row.quantity,
        price: row.price
      })).filter(item => item.id && item.product_name) // Remove null items
    };

    console.log(`✅ Order details retrieved for order ${orderId}`);

    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('❌ Order details error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order details',
      error: error.message
    });
  }
});

// Cancel order and process refund - WORKING VERSION
router.put('/orders/:id/cancel', protect, async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user.id;
    const db = require('../config/db');

    console.log(`🔄 Attempting to cancel order ${orderId} for user ${userId}`);

    // Step 1: Check if order exists and belongs to user
    const [orders] = await db.execute(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [orderId, userId]
    );

    console.log(`🔍 Found ${orders?.length || 0} orders matching criteria`);

    if (!orders || orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or you do not have permission to cancel this order'
      });
    }

    const order = orders[0];
    console.log(`📊 Order details - Status: ${order.status}, Payment Status: ${order.payment_status}`);

    // Step 2: Check if order can be cancelled
    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled at this stage. Current status: ${order.status}. Only pending or confirmed orders can be cancelled.`
      });
    }

    // Step 3: Update order status to 'cancelled' and payment_status to 'refunded'
    console.log(`📝 Updating order ${orderId} status to 'cancelled'`);
    const [orderUpdateResult] = await db.execute(
      'UPDATE orders SET status = "cancelled", payment_status = "refunded" WHERE id = ?',
      [orderId]
    );

    console.log(`✅ Order status updated. Affected rows: ${orderUpdateResult.affectedRows}`);

    // Step 4: Update payment status to 'refunded' and amount to 0
    console.log(`💰 Updating payment for order ${orderId}`);
    const [paymentUpdateResult] = await db.execute(
      'UPDATE payments SET payment_status = "refunded", amount = 0 WHERE order_id = ?',
      [orderId]
    );

    console.log(`✅ Payment updated. Affected rows: ${paymentUpdateResult.affectedRows}`);

    // Step 5: Restore product stock
    console.log(`📦 Restoring stock for order ${orderId}`);
    const [orderItems] = await db.execute(
      'SELECT * FROM order_items WHERE order_id = ?',
      [orderId]
    );

    console.log(`📦 Found ${orderItems.length} order items to restore`);

    for (const item of orderItems) {
      console.log(`📦 Restoring ${item.quantity} units for product ${item.product_id}`);
      await db.execute(
        'UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?',
        [item.quantity, item.product_id]
      );
    }

    console.log(`✅ Order ${orderId} cancelled successfully!`);

    res.json({
      success: true,
      message: 'Order cancelled successfully. Payment has been refunded and product stock restored.'
    });

  } catch (error) {
    console.error('❌ Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling order: ' + error.message,
      error: error.message
    });
  }
});

// Update user profile - FIXED ENDPOINT
router.put('/profile', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, phone, address, city, country } = req.body;

    const db = require('../config/db');

    console.log(`🔄 Updating profile for user ${userId}`, { name, email, phone });

    // Check if email is already taken by another user
    if (email) {
      const [existingUsers] = await db.execute(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, userId]
      );

      if (existingUsers.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Email is already taken by another user'
        });
      }
    }

    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];

    if (name) {
      updateFields.push('name = ?');
      updateValues.push(name);
    }
    if (email) {
      updateFields.push('email = ?');
      updateValues.push(email);
    }
    if (phone !== undefined) {
      updateFields.push('phone = ?');
      updateValues.push(phone);
    }
    if (address !== undefined) {
      updateFields.push('address = ?');
      updateValues.push(address);
    }
    if (city !== undefined) {
      updateFields.push('city = ?');
      updateValues.push(city);
    }
    if (country !== undefined) {
      updateFields.push('country = ?');
      updateValues.push(country);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    updateValues.push(userId);

    const query = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
    const [result] = await db.execute(query, updateValues);

    if (result.affectedRows === 0) {
      return res.status(400).json({
        success: false,
        message: 'No changes made to profile'
      });
    }

    // Get updated user data
    const [users] = await db.execute(
      'SELECT id, name, email, role, email_verified, phone, address, city, country, created_at FROM users WHERE id = ?',
      [userId]
    );

    const updatedUser = users[0];

    console.log(`✅ Profile updated successfully for user ${userId}`);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('❌ Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
});

module.exports = router;