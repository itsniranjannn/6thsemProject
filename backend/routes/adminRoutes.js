const express = require('express');
const db = require('../config/db');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// Get all users
router.get('/users', protect, admin, async (req, res) => {
  try {
    const [users] = await db.execute(`
      SELECT id, username as name, email, role, created_at 
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
      SELECT o.*, u.username as user_name, u.email as user_email 
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
    const { status, statusType } = req.body;

    let updateQuery, updateValue;
    
    if (statusType === 'payment') {
      updateQuery = 'UPDATE orders SET payment_status = ? WHERE id = ?';
      updateValue = status;
    } else {
      updateQuery = 'UPDATE orders SET order_status = ? WHERE id = ?';
      updateValue = status;
    }

    const [result] = await db.execute(updateQuery, [updateValue, orderId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, message: `${statusType === 'payment' ? 'Payment' : 'Order'} status updated successfully` });
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

// Create product
router.post('/products', protect, admin, async (req, res) => {
  try {
    const { 
      name, 
      description, 
      price, 
      category, 
      image_url, 
      image_urls, 
      stock_quantity, 
      is_featured, 
      is_new, 
      discount_percentage, 
      tags 
    } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, price, and category are required' 
      });
    }

    const [result] = await db.execute(
      `INSERT INTO products 
       (name, description, price, category, image_url, image_urls, stock_quantity, is_featured, is_new, discount_percentage, tags) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name, 
        description || '', 
        parseFloat(price), 
        category, 
        image_url || '',
        image_urls ? JSON.stringify(image_urls) : null,
        parseInt(stock_quantity) || 0,
        is_featured ? 1 : 0,
        is_new ? 1 : 0,
        parseFloat(discount_percentage) || 0,
        tags ? JSON.stringify(tags) : null
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
      image_url, 
      image_urls, 
      stock_quantity, 
      is_featured, 
      is_new, 
      discount_percentage, 
      tags 
    } = req.body;

    const [result] = await db.execute(
      `UPDATE products SET 
        name = ?, description = ?, price = ?, category = ?, image_url = ?, image_urls = ?, 
        stock_quantity = ?, is_featured = ?, is_new = ?, discount_percentage = ?, tags = ?
       WHERE id = ?`,
      [
        name, 
        description, 
        parseFloat(price), 
        category, 
        image_url || '',
        image_urls ? JSON.stringify(image_urls) : null,
        parseInt(stock_quantity) || 0,
        is_featured ? 1 : 0,
        is_new ? 1 : 0,
        parseFloat(discount_percentage) || 0,
        tags ? JSON.stringify(tags) : null,
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

// Update product status
router.put('/products/:id/status', protect, admin, async (req, res) => {
  try {
    const productId = req.params.id;
    const { is_featured, is_new } = req.body;

    const updates = [];
    const values = [];

    if (is_featured !== undefined) {
      updates.push('is_featured = ?');
      values.push(is_featured ? 1 : 0);
    }

    if (is_new !== undefined) {
      updates.push('is_new = ?');
      values.push(is_new ? 1 : 0);
    }

    if (updates.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No valid fields to update' 
      });
    }

    values.push(productId);

    const [result] = await db.execute(
      `UPDATE products SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ 
      success: true, 
      message: 'Product status updated successfully' 
    });
  } catch (error) {
    console.error('Update product status error:', error);
    res.status(500).json({ success: false, message: 'Error updating product status' });
  }
});

// Dashboard statistics
router.get('/stats', protect, admin, async (req, res) => {
  try {
    // Total revenue from paid orders
    const [revenueResult] = await db.execute(`
      SELECT SUM(total_amount) as total_revenue 
      FROM orders 
      WHERE payment_status = 'paid'
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
      WHERE order_status = 'pending'
    `);

    // Payment method breakdown
    const [paymentMethodStats] = await db.execute(`
      SELECT 
        payment_method,
        COUNT(*) as count,
        SUM(total_amount) as total_amount
      FROM orders 
      WHERE payment_status = 'paid'
      GROUP BY payment_method
    `);

    // Order status breakdown
    const [orderStatusStats] = await db.execute(`
      SELECT 
        order_status as status,
        COUNT(*) as count,
        SUM(total_amount) as total_amount
      FROM orders 
      GROUP BY order_status
    `);

    res.json({
      success: true,
      stats: {
        totalRevenue: parseFloat(revenueResult[0]?.total_revenue) || 0,
        totalOrders: ordersResult[0]?.total_orders || 0,
        totalProducts: productsResult[0]?.total_products || 0,
        totalUsers: usersResult[0]?.total_users || 0,
        todayOrders: todayOrdersResult[0]?.today_orders || 0,
        lowStockProducts: lowStockResult[0]?.low_stock || 0,
        pendingOrders: pendingOrdersResult[0]?.pending_orders || 0,
        paymentAnalytics: {
          paymentMethodStats: paymentMethodStats || [],
          orderStatusStats: orderStatusStats || []
        }
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ success: false, message: 'Error fetching dashboard statistics' });
  }
});

// Upload product image
router.post('/products/upload', protect, admin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const imageUrl = `${process.env.BACKEND_URL || 'http://localhost:5000'}/uploads/${req.file.filename}`;
    
    res.json({
      success: true,
      message: 'Image uploaded successfully',
      imageUrl: imageUrl
    });
  } catch (error) {
    console.error('Upload image error:', error);
    res.status(500).json({ success: false, message: 'Error uploading image' });
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
      usage_limit,
      max_discount_amount,
      valid_from,
      valid_until,
      is_active = true,
      categories
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
       (code, description, discount_type, discount_value, min_order_amount, usage_limit, max_discount_amount, valid_from, valid_until, is_active, categories) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        code.toUpperCase(),
        description || '',
        discount_type,
        parseFloat(discount_value),
        parseFloat(min_order_amount || 0),
        usage_limit ? parseInt(usage_limit) : null,
        max_discount_amount ? parseFloat(max_discount_amount) : null,
        valid_from || new Date(),
        valid_until,
        is_active,
        categories && categories.length > 0 ? JSON.stringify(categories) : null
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
    const {
      code,
      description,
      discount_type,
      discount_value,
      min_order_amount,
      usage_limit,
      max_discount_amount,
      valid_from,
      valid_until,
      is_active,
      categories
    } = req.body;

    const [result] = await db.execute(
      `UPDATE promo_codes SET 
        code = ?, description = ?, discount_type = ?, discount_value = ?, min_order_amount = ?, 
        usage_limit = ?, max_discount_amount = ?, valid_from = ?, valid_until = ?, is_active = ?, categories = ?
       WHERE id = ?`,
      [
        code.toUpperCase(),
        description || '',
        discount_type,
        parseFloat(discount_value),
        parseFloat(min_order_amount || 0),
        usage_limit ? parseInt(usage_limit) : null,
        max_discount_amount ? parseFloat(max_discount_amount) : null,
        valid_from,
        valid_until,
        is_active,
        categories && categories.length > 0 ? JSON.stringify(categories) : null,
        promoId
      ]
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

// Offer Management
router.get('/offers', protect, admin, async (req, res) => {
  try {
    // Check if product_offers table exists
    const [tableCheck] = await db.execute(`
      SELECT COUNT(*) as table_exists 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() AND table_name = 'product_offers'
    `);

    if (tableCheck[0].table_exists === 0) {
      return res.json({
        success: true,
        offers: []
      });
    }

    const [offers] = await db.execute(`
      SELECT o.*, p.name as product_name 
      FROM product_offers o 
      LEFT JOIN products p ON o.product_id = p.id 
      ORDER BY o.created_at DESC
    `);

    res.json({
      success: true,
      offers: offers || []
    });
  } catch (error) {
    console.error('Get offers error:', error);
    res.json({
      success: true,
      offers: []
    });
  }
});

// Create offer
router.post('/offers', protect, admin, async (req, res) => {
  try {
    const {
      product_id,
      offer_type,
      discount_percentage,
      discount_amount,
      min_quantity,
      max_quantity,
      valid_from,
      valid_until,
      is_active = true,
      description
    } = req.body;

    if (!product_id || !offer_type) {
      return res.status(400).json({ 
        success: false, 
        message: 'Product ID and offer type are required' 
      });
    }

    const [result] = await db.execute(
      `INSERT INTO product_offers 
       (product_id, offer_type, discount_percentage, discount_amount, min_quantity, max_quantity, valid_from, valid_until, is_active, description) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        product_id,
        offer_type,
        discount_percentage,
        discount_amount,
        min_quantity,
        max_quantity,
        valid_from,
        valid_until,
        is_active,
        description
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Offer created successfully',
      offerId: result.insertId
    });
  } catch (error) {
    console.error('Create offer error:', error);
    res.status(500).json({ success: false, message: 'Error creating offer' });
  }
});

// Update offer
router.put('/offers/:id', protect, admin, async (req, res) => {
  try {
    const offerId = req.params.id;
    const {
      product_id,
      offer_type,
      discount_percentage,
      discount_amount,
      min_quantity,
      max_quantity,
      valid_from,
      valid_until,
      is_active,
      description
    } = req.body;

    const [result] = await db.execute(
      `UPDATE product_offers SET 
        product_id = ?, offer_type = ?, discount_percentage = ?, discount_amount = ?, 
        min_quantity = ?, max_quantity = ?, valid_from = ?, valid_until = ?, 
        is_active = ?, description = ?
       WHERE id = ?`,
      [
        product_id,
        offer_type,
        discount_percentage,
        discount_amount,
        min_quantity,
        max_quantity,
        valid_from,
        valid_until,
        is_active,
        description,
        offerId
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }

    res.json({ success: true, message: 'Offer updated successfully' });
  } catch (error) {
    console.error('Update offer error:', error);
    res.status(500).json({ success: false, message: 'Error updating offer' });
  }
});

// Delete offer
router.delete('/offers/:id', protect, admin, async (req, res) => {
  try {
    const offerId = req.params.id;

    const [result] = await db.execute('DELETE FROM product_offers WHERE id = ?', [offerId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }

    res.json({ success: true, message: 'Offer deleted successfully' });
  } catch (error) {
    console.error('Delete offer error:', error);
    res.status(500).json({ success: false, message: 'Error deleting offer' });
  }
});

// Notifications Management
router.get('/notifications', protect, admin, async (req, res) => {
  try {
    const [notifications] = await db.execute(`
      SELECT * FROM notifications 
      ORDER BY created_at DESC
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
      type = 'system',
      image_url,
      expires_at
    } = req.body;

    if (!title || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Title and message are required' 
      });
    }

    const [result] = await db.execute(
      `INSERT INTO notifications 
       (title, message, type, image_url, expires_at, created_by) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        title,
        message,
        type,
        image_url,
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

module.exports = router;