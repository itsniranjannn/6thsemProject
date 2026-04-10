const express = require('express');
const db = require('../config/db');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

const normalizePromoCategories = (categories, applyToAllCategories = false) => {
  if (applyToAllCategories) return null;
  if (categories === null || categories === undefined) return null;

  if (Array.isArray(categories)) {
    const cleaned = categories.filter(Boolean);
    return cleaned.length > 0 ? cleaned : null;
  }

  if (typeof categories === 'string' && categories.trim() !== '') {
    try {
      const parsed = JSON.parse(categories);
      if (Array.isArray(parsed)) {
        const cleaned = parsed.filter(Boolean);
        return cleaned.length > 0 ? cleaned : null;
      }
    } catch (error) {
      return null;
    }
  }

  return null;
};

const isSupportedPromoDiscountType = (discountType) => {
  return ['percentage', 'fixed', 'free_shipping'].includes(discountType);
};

const normalizePromoDiscountValue = (discountType, discountValue) => {
  if (discountType === 'free_shipping') return 0;
  if (discountValue === undefined || discountValue === null || discountValue === '') return null;
  const parsed = parseFloat(discountValue);
  return Number.isFinite(parsed) ? parsed : null;
};

const getRangeSqlFilter = (range = 'today') => {
  const normalizedRange = String(range || 'today').toLowerCase();
  switch (normalizedRange) {
    case 'week':
    case 'weekly':
      return 'DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 6 DAY) AND DATE(created_at) <= CURDATE()';
    case 'month':
    case 'monthly':
      return 'YEAR(created_at) = YEAR(CURDATE()) AND MONTH(created_at) = MONTH(CURDATE())';
    case 'year':
      return 'YEAR(created_at) = YEAR(CURDATE())';
    case 'today':
    default:
      return 'DATE(created_at) = CURDATE()';
  }
};

const getPreviousRangeSqlFilter = (range = 'today') => {
  const normalizedRange = String(range || 'today').toLowerCase();
  switch (normalizedRange) {
    case 'week':
    case 'weekly':
      return 'DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 13 DAY) AND DATE(created_at) < DATE_SUB(CURDATE(), INTERVAL 6 DAY)';
    case 'month':
    case 'monthly':
      return 'YEAR(created_at) = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)) AND MONTH(created_at) = MONTH(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))';
    case 'year':
      return 'YEAR(created_at) = YEAR(CURDATE()) - 1';
    case 'today':
    default:
      return 'DATE(created_at) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)';
  }
};

const calculateGrowthRate = (currentValue, previousValue) => {
  const current = parseFloat(currentValue || 0);
  const previous = parseFloat(previousValue || 0);
  if (previous <= 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

// Get all users - FIXED: Using 'name' instead of 'username'
router.get('/users', protect, admin, async (req, res) => {
  try {
    const [users] = await db.execute(`
      SELECT id, name, email, role, created_at 
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

// Get all orders with user details - FIXED: Using 'name' instead of 'username'
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
          AND oi.product_id IS NOT NULL
          AND oi.quantity > 0
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

// Update order status with automatic synchronization
router.put('/orders/:id/status', protect, admin, async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status, statusType } = req.body;

    let updateQuery, updateValue;
    let additionalUpdates = [];
    let additionalValues = [];
    
    if (statusType === 'payment') {
      updateQuery = 'UPDATE orders SET payment_status = ?';
      updateValue = status;
      
      // Automatic order status synchronization based on payment status
      if (status === 'completed') {
        additionalUpdates.push('status = ?');
        additionalValues.push('confirmed');
      } else if (status === 'failed') {
        additionalUpdates.push('status = ?');
        additionalValues.push('pending');
      } else if (status === 'refunded') {
        additionalUpdates.push('status = ?');
        additionalValues.push('cancelled');
      } else if (status === 'pending') {
        additionalUpdates.push('status = ?');
        additionalValues.push('pending');
      }
    } else {
      updateQuery = 'UPDATE orders SET status = ?';
      updateValue = status;
    }

    // Build the final query
    if (additionalUpdates.length > 0) {
      updateQuery += ', ' + additionalUpdates.join(', ');
    }
    
    updateQuery += ' WHERE id = ?';
    
    const allValues = [updateValue, ...additionalValues, orderId];
    const [result] = await db.execute(updateQuery, allValues);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Get updated order for response
    const [updatedOrder] = await db.execute(`
      SELECT o.*, u.name as user_name, u.email as user_email 
      FROM orders o 
      LEFT JOIN users u ON o.user_id = u.id 
      WHERE o.id = ?
    `, [orderId]);

    res.json({ 
      success: true, 
      message: `${statusType === 'payment' ? 'Payment' : 'Order'} status updated successfully`,
      order: updatedOrder[0] 
    });
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
    const requestedRange = String(req.query.range || 'today').toLowerCase();
    const rangeAliases = { weekly: 'week', monthly: 'month' };
    const range = rangeAliases[requestedRange] || requestedRange;
    const rangeFilter = getRangeSqlFilter(range);
    const previousRangeFilter = getPreviousRangeSqlFilter(range);

    const [periodRevenueResult] = await db.execute(
      `SELECT COALESCE(SUM(total_amount), 0) as total_revenue
       FROM orders
       WHERE payment_status = 'completed'
       AND ${rangeFilter}`
    );

    const [periodOrdersResult] = await db.execute(
      `SELECT COUNT(*) as total_orders
       FROM orders
       WHERE ${rangeFilter}`
    );

    const [periodUsersResult] = await db.execute(
      `SELECT COUNT(*) as total_users
       FROM users
       WHERE ${rangeFilter}`
    );

    const [previousRevenueResult] = await db.execute(
      `SELECT COALESCE(SUM(total_amount), 0) as total_revenue
       FROM orders
       WHERE payment_status = 'completed'
       AND ${previousRangeFilter}`
    );

    const [previousOrdersResult] = await db.execute(
      `SELECT COUNT(*) as total_orders
       FROM orders
       WHERE ${previousRangeFilter}`
    );

    const [previousUsersResult] = await db.execute(
      `SELECT COUNT(*) as total_users
       FROM users
       WHERE ${previousRangeFilter}`
    );

    const [productsResult] = await db.execute('SELECT COUNT(*) as total_products FROM products');

    const [lowStockResult] = await db.execute(`
      SELECT COUNT(*) as low_stock
      FROM products
      WHERE stock_quantity <= 10
    `);

    const [pendingOrdersResult] = await db.execute(`
      SELECT COUNT(*) as pending_orders
      FROM orders
      WHERE status = 'pending'
    `);

    const [paymentMethodStats] = await db.execute(
      `SELECT
         payment_method,
         COUNT(*) as count,
         COALESCE(SUM(total_amount), 0) as total_amount
       FROM orders
       WHERE payment_status = 'completed'
       AND ${rangeFilter}
       GROUP BY payment_method
       ORDER BY total_amount DESC`
    );

    const [orderStatusStats] = await db.execute(
      `SELECT
         status,
         COUNT(*) as count,
         COALESCE(SUM(total_amount), 0) as total_amount
       FROM orders
       WHERE ${rangeFilter}
       GROUP BY status
       ORDER BY count DESC`
    );

    const [topProducts] = await db.execute(
      `SELECT
         p.id,
         p.name,
         COALESCE(NULLIF(TRIM(p.category), ''), 'General') as category,
         p.image_url,
         COALESCE(AVG(r.rating), 0) as avg_rating,
         COALESCE(COUNT(DISTINCT r.id), 0) as review_count,
         COALESCE(SUM(oi.quantity), 0) as units_sold,
          COALESCE(SUM(oi.quantity * oi.price), 0) as revenue
        FROM order_items oi
        JOIN orders o ON o.id = oi.order_id
        JOIN products p ON p.id = oi.product_id
        LEFT JOIN reviews r ON r.product_id = p.id
        WHERE ${rangeFilter.replace(/created_at/g, 'o.created_at')}
        GROUP BY p.id, p.name, p.category, p.image_url
        ORDER BY units_sold DESC, avg_rating DESC, review_count DESC, revenue DESC
        LIMIT 4`
    );

    const [recentOrders] = await db.execute(
      `SELECT
         o.id,
         o.total_amount,
         o.status,
         o.payment_method,
         o.payment_status,
         o.created_at,
         u.name as user_name,
         u.email as user_email
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       ORDER BY o.created_at DESC
       LIMIT 10`
    );

    for (const order of recentOrders) {
      const [items] = await db.execute(
        `SELECT
           oi.product_id,
           oi.quantity,
           oi.price,
           p.name,
           COALESCE(NULLIF(TRIM(p.category), ''), 'General') as category,
            p.image_url
          FROM order_items oi
         LEFT JOIN products p ON p.id = oi.product_id
         WHERE oi.order_id = ?
         ORDER BY oi.id ASC`,
        [order.id]
      );
      order.items = items || [];
    }

    const periodRevenue = parseFloat(periodRevenueResult[0]?.total_revenue) || 0;
    const periodOrders = parseInt(periodOrdersResult[0]?.total_orders || 0, 10);
    const periodUsers = parseInt(periodUsersResult[0]?.total_users || 0, 10);
    const previousRevenue = parseFloat(previousRevenueResult[0]?.total_revenue) || 0;
    const previousOrders = parseInt(previousOrdersResult[0]?.total_orders || 0, 10);
    const previousUsers = parseInt(previousUsersResult[0]?.total_users || 0, 10);
    const conversionRate = periodUsers > 0 ? (periodOrders / periodUsers) * 100 : 0;

    res.json({
      success: true,
      stats: {
        range,
        rangeStart: null,
        rangeEnd: null,
        totalRevenue: periodRevenue,
        totalOrders: periodOrders,
        totalProducts: productsResult[0]?.total_products || 0,
        totalUsers: periodUsers,
        growth: {
          revenue: calculateGrowthRate(periodRevenue, previousRevenue),
          orders: calculateGrowthRate(periodOrders, previousOrders),
          users: calculateGrowthRate(periodUsers, previousUsers)
        },
        conversionRate,
        lowStockProducts: lowStockResult[0]?.low_stock || 0,
        pendingOrders: pendingOrdersResult[0]?.pending_orders || 0,
        paymentAnalytics: {
          paymentMethodStats: paymentMethodStats || [],
          orderStatusStats: orderStatusStats || []
        },
        report: {
          topProducts: topProducts || [],
          recentOrders: recentOrders || []
        },
        rangeStart: null,
        rangeEnd: null
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
      categories,
      apply_to_all_categories
    } = req.body;

    if (!code || !discount_type) {
      return res.status(400).json({ 
        success: false, 
        message: 'Code and discount type are required' 
      });
    }

    if (!isSupportedPromoDiscountType(discount_type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid discount type'
      });
    }

    const normalizedDiscountValue = normalizePromoDiscountValue(discount_type, discount_value);
    if (normalizedDiscountValue === null) {
      return res.status(400).json({
        success: false,
        message: 'Discount value is required for this discount type'
      });
    }

    if (discount_type === 'percentage' && (normalizedDiscountValue < 0 || normalizedDiscountValue > 100)) {
      return res.status(400).json({
        success: false,
        message: 'Percentage discount must be between 0 and 100'
      });
    }

    if (discount_type === 'fixed' && normalizedDiscountValue < 0) {
      return res.status(400).json({
        success: false,
        message: 'Fixed discount must be zero or greater'
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

    const normalizedCategories = normalizePromoCategories(categories, apply_to_all_categories);
    if (!apply_to_all_categories && (!normalizedCategories || normalizedCategories.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'Please select at least one category'
      });
    }
    const normalizedValidUntil = valid_until || null;

    const [result] = await db.execute(
      `INSERT INTO promo_codes 
       (code, description, discount_type, discount_value, min_order_amount, usage_limit, max_discount_amount, valid_from, valid_until, is_active, categories) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        code.toUpperCase(),
        description || '',
        discount_type,
        normalizedDiscountValue,
        parseFloat(min_order_amount || 0),
        usage_limit ? parseInt(usage_limit) : null,
        max_discount_amount ? parseFloat(max_discount_amount) : null,
        valid_from || new Date(),
        normalizedValidUntil,
        is_active,
        normalizedCategories ? JSON.stringify(normalizedCategories) : null
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
      categories,
      apply_to_all_categories
    } = req.body;

    if (!code || !discount_type) {
      return res.status(400).json({
        success: false,
        message: 'Code and discount type are required'
      });
    }

    if (!isSupportedPromoDiscountType(discount_type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid discount type'
      });
    }

    const normalizedDiscountValue = normalizePromoDiscountValue(discount_type, discount_value);
    if (normalizedDiscountValue === null) {
      return res.status(400).json({
        success: false,
        message: 'Discount value is required for this discount type'
      });
    }

    if (discount_type === 'percentage' && (normalizedDiscountValue < 0 || normalizedDiscountValue > 100)) {
      return res.status(400).json({
        success: false,
        message: 'Percentage discount must be between 0 and 100'
      });
    }

    if (discount_type === 'fixed' && normalizedDiscountValue < 0) {
      return res.status(400).json({
        success: false,
        message: 'Fixed discount must be zero or greater'
      });
    }

    const normalizedCategories = normalizePromoCategories(categories, apply_to_all_categories);
    if (!apply_to_all_categories && (!normalizedCategories || normalizedCategories.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'Please select at least one category'
      });
    }
    const normalizedValidUntil = valid_until || null;

    const [result] = await db.execute(
      `UPDATE promo_codes SET 
        code = ?, description = ?, discount_type = ?, discount_value = ?, min_order_amount = ?, 
        usage_limit = ?, max_discount_amount = ?, valid_from = ?, valid_until = ?, is_active = ?, categories = ?
       WHERE id = ?`,
      [
        code.toUpperCase(),
        description || '',
        discount_type,
        normalizedDiscountValue,
        parseFloat(min_order_amount || 0),
        usage_limit ? parseInt(usage_limit) : null,
        max_discount_amount ? parseFloat(max_discount_amount) : null,
        valid_from,
        normalizedValidUntil,
        is_active,
        normalizedCategories ? JSON.stringify(normalizedCategories) : null,
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
    res.status(500).json({ success: false, message: 'Error fetching offers' });
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

// Get notifications for users (public endpoint)
router.get('/user-notifications', protect, async (req, res) => {
  try {
    const [notifications] = await db.execute(`
      SELECT * FROM notifications 
      WHERE (target_users = 'all' OR JSON_CONTAINS(user_ids, ?))
      AND (expires_at IS NULL OR expires_at > NOW())
      ORDER BY created_at DESC
      LIMIT 20
    `, [JSON.stringify([req.user.id])]);

    res.json({
      success: true,
      notifications: notifications || []
    });
  } catch (error) {
    console.error('Get user notifications error:', error);
    res.status(500).json({ success: false, message: 'Error fetching notifications' });
  }
});

module.exports = router;
