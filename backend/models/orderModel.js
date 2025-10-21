const db = require('../config/db');

class Order {
  // Create new order
  static async create(orderData) {
    try {
      const { 
        user_id, 
        total_amount, 
        subtotal = total_amount, 
        shipping_fee = 0, 
        payment_method, 
        payment_status = 'pending', 
        shipping_address, 
        status = 'pending',
        tracking_number,
        estimated_delivery
      } = orderData;
      
      // Convert shipping_address to JSON string if it's an object
      const shippingAddressJson = typeof shipping_address === 'object' 
        ? JSON.stringify(shipping_address) 
        : shipping_address;

      const [result] = await db.execute(
        `INSERT INTO orders (user_id, total_amount, subtotal, shipping_fee, payment_method, payment_status, shipping_address, status, tracking_number, estimated_delivery) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [user_id, total_amount, subtotal, shipping_fee, payment_method, payment_status, shippingAddressJson, status, tracking_number, estimated_delivery]
      );
      
      console.log('✅ Order created with ID:', result.insertId);
      return { id: result.insertId, ...orderData };
    } catch (error) {
      console.error('❌ Order creation error:', error);
      throw error;
    }
  }

  // Add order item
  static async addOrderItem(itemData) {
    try {
      const { order_id, product_id, quantity, price } = itemData;
      
      const [result] = await db.execute(
        `INSERT INTO order_items (order_id, product_id, quantity, price) 
         VALUES (?, ?, ?, ?)`,
        [order_id, product_id, quantity, price]
      );
      
      console.log(`✅ Order item added for order ${order_id}, product ${product_id}`);
      return result.insertId;
    } catch (error) {
      console.error('❌ Order item creation error:', error);
      throw error;
    }
  }

  // Create multiple order items
  static async createOrderItems(orderId, items) {
    try {
      for (const item of items) {
        await this.addOrderItem({
          order_id: orderId,
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price
        });
      }
      console.log(`✅ All order items created for order ${orderId}`);
    } catch (error) {
      console.error('❌ Create order items error:', error);
      throw error;
    }
  }

  // Update order
  static async update(orderId, updateData) {
    try {
      const fields = [];
      const values = [];
      
      Object.keys(updateData).forEach(key => {
        // Handle shipping_address conversion to JSON
        if (key === 'shipping_address' && typeof updateData[key] === 'object') {
          fields.push(`${key} = ?`);
          values.push(JSON.stringify(updateData[key]));
        } else {
          fields.push(`${key} = ?`);
          values.push(updateData[key]);
        }
      });
      
      values.push(orderId);
      
      const [result] = await db.execute(
        `UPDATE orders SET ${fields.join(', ')} WHERE id = ?`,
        values
      );
      
      console.log(`✅ Order ${orderId} updated:`, updateData);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('❌ Order update error:', error);
      throw error;
    }
  }

  // Update order status
  static async updateStatus(orderId, status) {
    try {
      const [result] = await db.execute(
        `UPDATE orders SET status = ? WHERE id = ?`,
        [status, orderId]
      );
      
      console.log(`✅ Order ${orderId} status updated to: ${status}`);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('❌ Update order status error:', error);
      throw error;
    }
  }

  // Update payment status
  static async updatePaymentStatus(orderId, paymentStatus) {
    try {
      const [result] = await db.execute(
        `UPDATE orders SET payment_status = ? WHERE id = ?`,
        [paymentStatus, orderId]
      );
      
      console.log(`✅ Order ${orderId} payment status updated to: ${paymentStatus}`);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('❌ Update payment status error:', error);
      throw error;
    }
  }

  // Find order by ID with full details
  static async findById(orderId) {
    try {
      const [rows] = await db.execute(
        `SELECT 
          o.*,
          u.name as user_name,
          u.email as user_email,
          oi.id as item_id,
          oi.product_id,
          oi.quantity,
          oi.price,
          p.name as product_name,
          p.image_url as product_image,
          p.category as product_category
         FROM orders o
         LEFT JOIN users u ON o.user_id = u.id
         LEFT JOIN order_items oi ON o.id = oi.order_id
         LEFT JOIN products p ON oi.product_id = p.id
         WHERE o.id = ?`,
        [orderId]
      );
      
      if (rows.length === 0) return null;
      
      // Parse shipping address safely
      let shippingAddress = {};
      try {
        shippingAddress = rows[0].shipping_address 
          ? JSON.parse(rows[0].shipping_address)
          : {};
      } catch (parseError) {
        console.warn('⚠️ Could not parse shipping address:', parseError);
        shippingAddress = { address: rows[0].shipping_address || '' };
      }
      
      // Group order data with items
      const order = {
        id: rows[0].id,
        user_id: rows[0].user_id,
        user_name: rows[0].user_name,
        user_email: rows[0].user_email,
        total_amount: parseFloat(rows[0].total_amount),
        subtotal: parseFloat(rows[0].subtotal),
        shipping_fee: parseFloat(rows[0].shipping_fee),
        status: rows[0].status,
        payment_method: rows[0].payment_method,
        payment_status: rows[0].payment_status,
        tracking_number: rows[0].tracking_number,
        estimated_delivery: rows[0].estimated_delivery,
        shipping_address: shippingAddress,
        created_at: rows[0].created_at,
        items: rows.filter(row => row.product_id).map(row => ({
          id: row.item_id,
          product_id: row.product_id,
          product_name: row.product_name,
          product_image: row.product_image,
          product_category: row.product_category,
          quantity: row.quantity,
          price: parseFloat(row.price),
          total: parseFloat(row.price) * row.quantity
        }))
      };
      
      return order;
    } catch (error) {
      console.error('❌ Find order by ID error:', error);
      throw error;
    }
  }

  // Find orders by user ID
  static async findByUserId(userId) {
    try {
      const [rows] = await db.execute(
        `SELECT 
          o.*,
          COUNT(oi.id) as item_count,
          SUM(oi.quantity) as total_items
         FROM orders o
         LEFT JOIN order_items oi ON o.id = oi.order_id
         WHERE o.user_id = ?
         GROUP BY o.id
         ORDER BY o.created_at DESC`,
        [userId]
      );
      
      // Parse shipping address for each order
      const orders = rows.map(row => {
        let shippingAddress = {};
        try {
          shippingAddress = row.shipping_address 
            ? JSON.parse(row.shipping_address)
            : {};
        } catch (parseError) {
          shippingAddress = { address: row.shipping_address || '' };
        }
        
        return {
          id: row.id,
          user_id: row.user_id,
          total_amount: parseFloat(row.total_amount),
          subtotal: parseFloat(row.subtotal),
          shipping_fee: parseFloat(row.shipping_fee),
          status: row.status,
          payment_method: row.payment_method,
          payment_status: row.payment_status,
          tracking_number: row.tracking_number,
          estimated_delivery: row.estimated_delivery,
          shipping_address: shippingAddress,
          item_count: row.item_count,
          total_items: row.total_items,
          created_at: row.created_at
        };
      });
      
      return orders;
    } catch (error) {
      console.error('❌ Find orders by user ID error:', error);
      throw error;
    }
  }

  // Get all orders (admin)
  static async findAll(limit = 50, offset = 0) {
    try {
      const [rows] = await db.execute(
        `SELECT 
          o.*,
          u.name as user_name,
          u.email as user_email,
          COUNT(oi.id) as item_count,
          SUM(oi.quantity) as total_items
         FROM orders o
         JOIN users u ON o.user_id = u.id
         LEFT JOIN order_items oi ON o.id = oi.order_id
         GROUP BY o.id
         ORDER BY o.created_at DESC
         LIMIT ? OFFSET ?`,
        [limit, offset]
      );
      
      // Parse shipping address for each order
      const orders = rows.map(row => {
        let shippingAddress = {};
        try {
          shippingAddress = row.shipping_address 
            ? JSON.parse(row.shipping_address)
            : {};
        } catch (parseError) {
          shippingAddress = { address: row.shipping_address || '' };
        }
        
        return {
          id: row.id,
          user_id: row.user_id,
          user_name: row.user_name,
          user_email: row.user_email,
          total_amount: parseFloat(row.total_amount),
          subtotal: parseFloat(row.subtotal),
          shipping_fee: parseFloat(row.shipping_fee),
          status: row.status,
          payment_method: row.payment_method,
          payment_status: row.payment_status,
          tracking_number: row.tracking_number,
          estimated_delivery: row.estimated_delivery,
          shipping_address: shippingAddress,
          item_count: row.item_count,
          total_items: row.total_items,
          created_at: row.created_at
        };
      });
      
      return orders;
    } catch (error) {
      console.error('❌ Find all orders error:', error);
      throw error;
    }
  }

  // Get orders by status
  static async findByStatus(status, limit = 50, offset = 0) {
    try {
      const [rows] = await db.execute(
        `SELECT 
          o.*,
          u.name as user_name,
          u.email as user_email,
          COUNT(oi.id) as item_count
         FROM orders o
         JOIN users u ON o.user_id = u.id
         LEFT JOIN order_items oi ON o.id = oi.order_id
         WHERE o.status = ?
         GROUP BY o.id
         ORDER BY o.created_at DESC
         LIMIT ? OFFSET ?`,
        [status, limit, offset]
      );
      
      const orders = rows.map(row => ({
        id: row.id,
        user_id: row.user_id,
        user_name: row.user_name,
        user_email: row.user_email,
        total_amount: parseFloat(row.total_amount),
        subtotal: parseFloat(row.subtotal),
        shipping_fee: parseFloat(row.shipping_fee),
        status: row.status,
        payment_method: row.payment_method,
        payment_status: row.payment_status,
        tracking_number: row.tracking_number,
        estimated_delivery: row.estimated_delivery,
        shipping_address: JSON.parse(row.shipping_address || '{}'),
        item_count: row.item_count,
        created_at: row.created_at
      }));
      
      return orders;
    } catch (error) {
      console.error('❌ Find orders by status error:', error);
      throw error;
    }
  }

  // Get orders by payment status
  static async findByPaymentStatus(paymentStatus, limit = 50, offset = 0) {
    try {
      const [rows] = await db.execute(
        `SELECT 
          o.*,
          u.name as user_name,
          u.email as user_email,
          COUNT(oi.id) as item_count
         FROM orders o
         JOIN users u ON o.user_id = u.id
         LEFT JOIN order_items oi ON o.id = oi.order_id
         WHERE o.payment_status = ?
         GROUP BY o.id
         ORDER BY o.created_at DESC
         LIMIT ? OFFSET ?`,
        [paymentStatus, limit, offset]
      );
      
      const orders = rows.map(row => ({
        id: row.id,
        user_id: row.user_id,
        user_name: row.user_name,
        user_email: row.user_email,
        total_amount: parseFloat(row.total_amount),
        subtotal: parseFloat(row.subtotal),
        shipping_fee: parseFloat(row.shipping_fee),
        status: row.status,
        payment_method: row.payment_method,
        payment_status: row.payment_status,
        tracking_number: row.tracking_number,
        estimated_delivery: row.estimated_delivery,
        shipping_address: JSON.parse(row.shipping_address || '{}'),
        item_count: row.item_count,
        created_at: row.created_at
      }));
      
      return orders;
    } catch (error) {
      console.error('❌ Find orders by payment status error:', error);
      throw error;
    }
  }

  // Get sales statistics
  static async getSalesStats(timeRange = 'all') {
    try {
      let dateFilter = '';
      const params = [];
      
      switch (timeRange) {
        case 'today':
          dateFilter = 'WHERE DATE(o.created_at) = CURDATE()';
          break;
        case 'week':
          dateFilter = 'WHERE o.created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)';
          break;
        case 'month':
          dateFilter = 'WHERE o.created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)';
          break;
        case 'year':
          dateFilter = 'WHERE o.created_at >= DATE_SUB(CURDATE(), INTERVAL 365 DAY)';
          break;
        default:
          dateFilter = '';
      }
      
      const [rows] = await db.execute(`
        SELECT 
          COUNT(*) as total_orders,
          SUM(o.total_amount) as total_revenue,
          AVG(o.total_amount) as avg_order_value,
          COUNT(DISTINCT o.user_id) as total_customers,
          SUM(CASE WHEN o.status = 'delivered' THEN 1 ELSE 0 END) as completed_orders,
          SUM(CASE WHEN o.status = 'pending' THEN 1 ELSE 0 END) as pending_orders,
          SUM(CASE WHEN o.status = 'processing' THEN 1 ELSE 0 END) as processing_orders,
          SUM(CASE WHEN o.status = 'shipped' THEN 1 ELSE 0 END) as shipped_orders,
          SUM(CASE WHEN o.payment_status = 'completed' THEN 1 ELSE 0 END) as paid_orders,
          SUM(CASE WHEN o.payment_status = 'pending' THEN 1 ELSE 0 END) as pending_payments
        FROM orders o
        ${dateFilter}
      `, params);
      
      const stats = rows[0] || {};
      
      // Calculate additional metrics
      stats.completion_rate = stats.total_orders > 0 ? 
        (stats.completed_orders / stats.total_orders * 100).toFixed(2) : 0;
      stats.payment_success_rate = stats.total_orders > 0 ? 
        (stats.paid_orders / stats.total_orders * 100).toFixed(2) : 0;
      
      return stats;
    } catch (error) {
      console.error('❌ Get sales stats error:', error);
      throw error;
    }
  }

  // Get revenue by date range
  static async getRevenueByDateRange(startDate, endDate) {
    try {
      const [rows] = await db.execute(`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as order_count,
          SUM(total_amount) as daily_revenue,
          AVG(total_amount) as avg_order_value
        FROM orders 
        WHERE created_at BETWEEN ? AND ?
        AND status != 'cancelled'
        GROUP BY DATE(created_at)
        ORDER BY date
      `, [startDate, endDate]);
      
      return rows;
    } catch (error) {
      console.error('❌ Get revenue by date range error:', error);
      throw error;
    }
  }

  // Get popular products from orders
  static async getPopularProducts(limit = 10) {
    try {
      const [rows] = await db.execute(`
        SELECT 
          p.id,
          p.name,
          p.category,
          p.image_url,
          SUM(oi.quantity) as total_sold,
          SUM(oi.quantity * oi.price) as total_revenue,
          COUNT(DISTINCT o.id) as order_count
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        JOIN orders o ON oi.order_id = o.id
        WHERE o.status != 'cancelled'
        GROUP BY p.id, p.name, p.category, p.image_url
        ORDER BY total_sold DESC
        LIMIT ?
      `, [limit]);
      
      return rows;
    } catch (error) {
      console.error('❌ Get popular products error:', error);
      throw error;
    }
  }

  // Delete order (admin only)
  static async delete(orderId) {
    try {
      // Start transaction
      await db.execute('START TRANSACTION');
      
      // Delete order items first
      await db.execute('DELETE FROM order_items WHERE order_id = ?', [orderId]);
      
      // Delete payments
      await db.execute('DELETE FROM payments WHERE order_id = ?', [orderId]);
      
      // Delete the order
      const [result] = await db.execute('DELETE FROM orders WHERE id = ?', [orderId]);
      
      // Commit transaction
      await db.execute('COMMIT');
      
      console.log(`✅ Order ${orderId} deleted successfully`);
      return result.affectedRows > 0;
    } catch (error) {
      // Rollback transaction on error
      await db.execute('ROLLBACK');
      console.error('❌ Delete order error:', error);
      throw error;
    }
  }

  // Get order count by status
  static async getOrderCounts() {
    try {
      const [rows] = await db.execute(`
        SELECT 
          status,
          COUNT(*) as count
        FROM orders 
        GROUP BY status
      `);
      
      const counts = {
        total: 0,
        pending: 0,
        processing: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0
      };
      
      rows.forEach(row => {
        counts[row.status] = row.count;
        counts.total += row.count;
      });
      
      return counts;
    } catch (error) {
      console.error('❌ Get order counts error:', error);
      throw error;
    }
  }

  // Search orders
  static async searchOrders(query, limit = 50, offset = 0) {
    try {
      const searchQuery = `%${query}%`;
      const [rows] = await db.execute(
        `SELECT 
          o.*,
          u.name as user_name,
          u.email as user_email,
          COUNT(oi.id) as item_count
         FROM orders o
         JOIN users u ON o.user_id = u.id
         LEFT JOIN order_items oi ON o.id = oi.order_id
         WHERE o.id LIKE ? 
            OR u.name LIKE ? 
            OR u.email LIKE ?
            OR o.tracking_number LIKE ?
         GROUP BY o.id
         ORDER BY o.created_at DESC
         LIMIT ? OFFSET ?`,
        [searchQuery, searchQuery, searchQuery, searchQuery, limit, offset]
      );
      
      const orders = rows.map(row => ({
        id: row.id,
        user_id: row.user_id,
        user_name: row.user_name,
        user_email: row.user_email,
        total_amount: parseFloat(row.total_amount),
        subtotal: parseFloat(row.subtotal),
        shipping_fee: parseFloat(row.shipping_fee),
        status: row.status,
        payment_method: row.payment_method,
        payment_status: row.payment_status,
        tracking_number: row.tracking_number,
        estimated_delivery: row.estimated_delivery,
        shipping_address: JSON.parse(row.shipping_address || '{}'),
        item_count: row.item_count,
        created_at: row.created_at
      }));
      
      return orders;
    } catch (error) {
      console.error('❌ Search orders error:', error);
      throw error;
    }
  }
}

module.exports = Order;