const express = require('express');
const db = require('../config/db');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// Get all users
router.get('/users', protect, admin, async (req, res) => {
  try {
    const [users] = await db.execute(`
      SELECT id, name, email, role, created_at, phone, address 
      FROM users 
      ORDER BY created_at DESC
    `);

    res.json({
      success: true,
      users: users || []
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, message: 'Error fetching users' });
  }
});

// Delete user
router.delete('/users/:id', protect, admin, async (req, res) => {
  try {
    const userId = req.params.id;
    
    if (parseInt(userId) === req.user.id) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
    }

    const [result] = await db.execute('DELETE FROM users WHERE id = ?', [userId]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, message: 'Error deleting user' });
  }
});

// Get all orders with user details
router.get('/orders', protect, admin, async (req, res) => {
  try {
    const [orders] = await db.execute(`
      SELECT o.*, u.name as user_name, u.email as user_email 
      FROM orders o 
      LEFT JOIN users u ON o.user_id = u.id 
      ORDER BY o.created_at DESC
    `);

    // Get order items for each order
    for (let order of orders) {
      const [items] = await db.execute(`
        SELECT oi.*, p.name, p.image_url 
        FROM order_items oi 
        LEFT JOIN products p ON oi.product_id = p.id 
        WHERE oi.order_id = ?
      `, [order.id]);
      order.items = items || [];
    }

    res.json({
      success: true,
      orders: orders || []
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ success: false, message: 'Error fetching orders' });
  }
});

// Update order status
router.put('/orders/:id/status', protect, admin, async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;

    const [result] = await db.execute(
      'UPDATE orders SET status = ? WHERE id = ?',
      [status, orderId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, message: 'Order status updated successfully' });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ success: false, message: 'Error updating order status' });
  }
});

// Get all products
router.get('/products', protect, admin, async (req, res) => {
  try {
    const [products] = await db.execute(`
      SELECT * FROM products ORDER BY created_at DESC
    `);

    res.json({
      success: true,
      products: products || []
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ success: false, message: 'Error fetching products' });
  }
});

// Create product with multiple images
router.post('/products', protect, admin, async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      stock_quantity,
      image_urls,
      tags,
      is_featured = false,
      is_new = false,
      discount_percentage = 0
    } = req.body;

    // Validate required fields
    if (!name || !description || !price || !category || !stock_quantity) {
      return res.status(400).json({ 
        success: false, 
        message: 'All required fields must be provided' 
      });
    }

    // Ensure at least 3 images
    if (!image_urls || image_urls.length < 3) {
      return res.status(400).json({ 
        success: false, 
        message: 'At least 3 images are required' 
      });
    }

    const [result] = await db.execute(
      `INSERT INTO products 
       (name, description, price, category, stock_quantity, image_urls, tags, is_featured, is_new, discount_percentage) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        description,
        parseFloat(price),
        category,
        parseInt(stock_quantity),
        JSON.stringify(image_urls),
        JSON.stringify(tags || []),
        is_featured,
        is_new,
        parseFloat(discount_percentage)
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      productId: result.insertId
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ success: false, message: 'Error creating product' });
  }
});

// Update product
router.put('/products/:id', protect, admin, async (req, res) => {
  try {
    const productId = req.params.id;
    const {
      name,
      description,
      price,
      category,
      stock_quantity,
      image_urls,
      tags,
      is_featured,
      is_new,
      discount_percentage
    } = req.body;

    const [result] = await db.execute(
      `UPDATE products SET 
        name = ?, description = ?, price = ?, category = ?, stock_quantity = ?, 
        image_urls = ?, tags = ?, is_featured = ?, is_new = ?, discount_percentage = ?
       WHERE id = ?`,
      [
        name,
        description,
        parseFloat(price),
        category,
        parseInt(stock_quantity),
        JSON.stringify(image_urls),
        JSON.stringify(tags || []),
        is_featured,
        is_new,
        parseFloat(discount_percentage),
        productId
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, message: 'Product updated successfully' });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ success: false, message: 'Error updating product' });
  }
});

// Delete product
router.delete('/products/:id', protect, admin, async (req, res) => {
  try {
    const productId = req.params.id;

    const [result] = await db.execute('DELETE FROM products WHERE id = ?', [productId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ success: false, message: 'Error deleting product' });
  }
});

// Promo Code Management
router.get('/promo-codes', protect, admin, async (req, res) => {
  try {
    const [promoCodes] = await db.execute(`
      SELECT * FROM promo_codes ORDER BY created_at DESC
    `);

    res.json({
      success: true,
      promoCodes: promoCodes || []
    });
  } catch (error) {
    console.error('Get promo codes error:', error);
    res.status(500).json({ success: false, message: 'Error fetching promo codes' });
  }
});

// Create promo code
router.post('/promo-codes', protect, admin, async (req, res) => {
  try {
    const {
      code,
      description,
      discount_type,
      discount_value,
      min_order_amount,
      max_uses,
      valid_from,
      valid_until,
      is_active = true
    } = req.body;

    if (!code || !discount_type || !discount_value) {
      return res.status(400).json({ 
        success: false, 
        message: 'Code, discount type, and discount value are required' 
      });
    }

    // Check if promo code already exists
    const [existing] = await db.execute('SELECT id FROM promo_codes WHERE code = ?', [code.toUpperCase()]);
    if (existing.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Promo code already exists' 
      });
    }

    const [result] = await db.execute(
      `INSERT INTO promo_codes 
       (code, description, discount_type, discount_value, min_order_amount, max_uses, valid_from, valid_until, is_active) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        code.toUpperCase(),
        description,
        discount_type,
        parseFloat(discount_value),
        parseFloat(min_order_amount || 0),
        max_uses ? parseInt(max_uses) : null,
        valid_from || new Date(),
        valid_until,
        is_active
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Promo code created successfully',
      promoCodeId: result.insertId
    });
  } catch (error) {
    console.error('Create promo code error:', error);
    res.status(500).json({ success: false, message: 'Error creating promo code' });
  }
});

// Update promo code
router.put('/promo-codes/:id', protect, admin, async (req, res) => {
  try {
    const promoId = req.params.id;
    const updates = req.body;

    const fields = [];
    const values = [];
    
    Object.keys(updates).forEach(key => {
      if (key !== 'id') {
        fields.push(`${key} = ?`);
        values.push(updates[key]);
      }
    });
    
    values.push(promoId);

    const [result] = await db.execute(
      `UPDATE promo_codes SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Promo code not found' });
    }

    res.json({ success: true, message: 'Promo code updated successfully' });
  } catch (error) {
    console.error('Update promo code error:', error);
    res.status(500).json({ success: false, message: 'Error updating promo code' });
  }
});

// Delete promo code
router.delete('/promo-codes/:id', protect, admin, async (req, res) => {
  try {
    const promoId = req.params.id;

    const [result] = await db.execute('DELETE FROM promo_codes WHERE id = ?', [promoId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Promo code not found' });
    }

    res.json({ success: true, message: 'Promo code deleted successfully' });
  } catch (error) {
    console.error('Delete promo code error:', error);
    res.status(500).json({ success: false, message: 'Error deleting promo code' });
  }
});

// Notification Management
router.get('/notifications', protect, admin, async (req, res) => {
  try {
    const [notifications] = await db.execute(`
      SELECT * FROM notifications ORDER BY created_at DESC
    `);

    res.json({
      success: true,
      notifications: notifications || []
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ success: false, message: 'Error fetching notifications' });
  }
});

// Create notification
router.post('/notifications', protect, admin, async (req, res) => {
  try {
    const {
      title,
      message,
      type = 'info',
      image_url = null,
      target_users = 'all',
      expires_at = null
    } = req.body;

    if (!title || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Title and message are required' 
      });
    }

    const [result] = await db.execute(
      `INSERT INTO notifications 
       (title, message, type, image_url, target_users, expires_at, created_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        message,
        type,
        image_url,
        target_users,
        expires_at,
        req.user.id
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      notificationId: result.insertId
    });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({ success: false, message: 'Error creating notification' });
  }
});

// Delete notification
router.delete('/notifications/:id', protect, admin, async (req, res) => {
  try {
    const notificationId = req.params.id;

    const [result] = await db.execute('DELETE FROM notifications WHERE id = ?', [notificationId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.json({ success: true, message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ success: false, message: 'Error deleting notification' });
  }
});

// Dashboard statistics
router.get('/stats', protect, admin, async (req, res) => {
  try {
    // Total revenue
    const [revenueResult] = await db.execute(`
      SELECT SUM(total_amount) as total_revenue 
      FROM orders 
      WHERE status IN ('delivered', 'payment_done')
    `);

    // Total orders
    const [ordersResult] = await db.execute('SELECT COUNT(*) as total_orders FROM orders');

    // Total products
    const [productsResult] = await db.execute('SELECT COUNT(*) as total_products FROM products');

    // Total users
    const [usersResult] = await db.execute('SELECT COUNT(*) as total_users FROM users');

    // Today's orders
    const [todayOrdersResult] = await db.execute(`
      SELECT COUNT(*) as today_orders 
      FROM orders 
      WHERE DATE(created_at) = CURDATE()
    `);

    // Low stock products
    const [lowStockResult] = await db.execute(`
      SELECT COUNT(*) as low_stock 
      FROM products 
      WHERE stock_quantity <= 10
    `);

    // Pending orders
    const [pendingOrdersResult] = await db.execute(`
      SELECT COUNT(*) as pending_orders 
      FROM orders 
      WHERE status IN ('payment_required', 'payment_pending', 'processing')
    `);

    res.json({
      success: true,
      stats: {
        totalRevenue: revenueResult[0]?.total_revenue || 0,
        totalOrders: ordersResult[0]?.total_orders || 0,
        totalProducts: productsResult[0]?.total_products || 0,
        totalUsers: usersResult[0]?.total_users || 0,
        todayOrders: todayOrdersResult[0]?.today_orders || 0,
        lowStockProducts: lowStockResult[0]?.low_stock || 0,
        pendingPayments: pendingOrdersResult[0]?.pending_orders || 0
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ success: false, message: 'Error fetching dashboard statistics' });
  }
});

module.exports = router;