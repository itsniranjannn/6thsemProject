const db = require('../config/db');

class Order {
  // ✅ FIXED: Create new order with proper error handling
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
        tracking_number = null,
        estimated_delivery = null,
        promo_code = null
      } = orderData;
      
      console.log('🛒 Creating order with data:', { 
        user_id, total_amount, payment_method, status 
      });

      // Convert shipping_address to JSON string if it's an object
      const shippingAddressJson = typeof shipping_address === 'object' 
        ? JSON.stringify(shipping_address) 
        : (shipping_address || '');

      const [result] = await db.execute(
        `INSERT INTO orders 
         (user_id, total_amount, subtotal, shipping_fee, payment_method, payment_status, shipping_address, status, tracking_number, estimated_delivery, promo_code) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          user_id, 
          parseFloat(total_amount), 
          parseFloat(subtotal), 
          parseFloat(shipping_fee), 
          payment_method, 
          payment_status, 
          shippingAddressJson, 
          status, 
          tracking_number, 
          estimated_delivery, 
          promo_code
        ]
      );
      
      console.log('✅ Order created with ID:', result.insertId);
      return { 
        id: result.insertId, 
        ...orderData,
        insertId: result.insertId // Add this for compatibility
      };
    } catch (error) {
      console.error('❌ Order creation error:', error);
      throw new Error(`Failed to create order: ${error.message}`);
    }
  }

  // ✅ FIXED: Add order item with better validation
  static async addOrderItem(itemData) {
    try {
      const { order_id, product_id, quantity, price } = itemData;
      
      console.log(`📦 Adding order item:`, { order_id, product_id, quantity, price });

      const [result] = await db.execute(
        `INSERT INTO order_items (order_id, product_id, quantity, price) 
         VALUES (?, ?, ?, ?)`,
        [order_id, product_id, quantity, parseFloat(price)]
      );
      
      console.log(`✅ Order item added for order ${order_id}, product ${product_id}`);
      return result.insertId;
    } catch (error) {
      console.error('❌ Order item creation error:', error);
      throw new Error(`Failed to add order item: ${error.message}`);
    }
  }

  // ✅ FIXED: Create multiple order items with transaction support
  static async createOrderItems(orderId, items) {
    let connection;
    try {
      // Get a connection for transaction
      connection = await db.getConnection();
      await connection.beginTransaction();

      console.log(`🛒 Creating ${items.length} order items for order ${orderId}`);

      for (const item of items) {
        const productId = item.product_id || item.id;
        const quantity = item.quantity;
        const price = parseFloat(item.price);

        if (!productId || !quantity || !price) {
          throw new Error(`Invalid item data: ${JSON.stringify(item)}`);
        }

        await connection.execute(
          `INSERT INTO order_items (order_id, product_id, quantity, price) 
           VALUES (?, ?, ?, ?)`,
          [orderId, productId, quantity, price]
        );
      }

      await connection.commit();
      console.log(`✅ All order items created for order ${orderId}`);
    } catch (error) {
      if (connection) {
        await connection.rollback();
      }
      console.error('❌ Create order items error:', error);
      throw new Error(`Failed to create order items: ${error.message}`);
    } finally {
      if (connection) {
        connection.release();
      }
    }
  }

  // ✅ FIXED: Update order with proper field handling
  static async update(orderId, updateData) {
    try {
      const fields = [];
      const values = [];
      
      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined && updateData[key] !== null) {
          // Handle shipping_address conversion to JSON
          if (key === 'shipping_address' && typeof updateData[key] === 'object') {
            fields.push(`${key} = ?`);
            values.push(JSON.stringify(updateData[key]));
          } else {
            fields.push(`${key} = ?`);
            values.push(updateData[key]);
          }
        }
      });
      
      if (fields.length === 0) {
        console.log('⚠️ No fields to update for order:', orderId);
        return false;
      }
      
      values.push(orderId);
      
      const [result] = await db.execute(
        `UPDATE orders SET ${fields.join(', ')} WHERE id = ?`,
        values
      );
      
      console.log(`✅ Order ${orderId} updated:`, updateData);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('❌ Order update error:', error);
      throw new Error(`Failed to update order: ${error.message}`);
    }
  }

  // ✅ FIXED: Update order status
  static async updateStatus(orderId, status) {
    try {
      const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
      if (!validStatuses.includes(status)) {
        throw new Error(`Invalid status: ${status}. Must be one of: ${validStatuses.join(', ')}`);
      }

      const [result] = await db.execute(
        `UPDATE orders SET status = ? WHERE id = ?`,
        [status, orderId]
      );
      
      console.log(`✅ Order ${orderId} status updated to: ${status}`);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('❌ Update order status error:', error);
      throw new Error(`Failed to update order status: ${error.message}`);
    }
  }

  // ✅ FIXED: Update payment status
  static async updatePaymentStatus(orderId, paymentStatus) {
    try {
      const validStatuses = ['pending', 'completed', 'failed', 'refunded'];
      if (!validStatuses.includes(paymentStatus)) {
        throw new Error(`Invalid payment status: ${paymentStatus}. Must be one of: ${validStatuses.join(', ')}`);
      }

      const [result] = await db.execute(
        `UPDATE orders SET payment_status = ? WHERE id = ?`,
        [paymentStatus, orderId]
      );
      
      console.log(`✅ Order ${orderId} payment status updated to: ${paymentStatus}`);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('❌ Update payment status error:', error);
      throw new Error(`Failed to update payment status: ${error.message}`);
    }
  }

  // ✅ FIXED: Find order by ID with full details
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
      
      if (rows.length === 0) {
        console.log(`❌ Order not found: ${orderId}`);
        return null;
      }
      
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
        total_amount: parseFloat(rows[0].total_amount || 0),
        subtotal: parseFloat(rows[0].subtotal || 0),
        shipping_fee: parseFloat(rows[0].shipping_fee || 0),
        status: rows[0].status,
        payment_method: rows[0].payment_method,
        payment_status: rows[0].payment_status,
        tracking_number: rows[0].tracking_number,
        estimated_delivery: rows[0].estimated_delivery,
        promo_code: rows[0].promo_code,
        shipping_address: shippingAddress,
        created_at: rows[0].created_at,
        items: rows.filter(row => row.product_id).map(row => ({
          id: row.item_id,
          product_id: row.product_id,
          product_name: row.product_name,
          product_image: row.product_image,
          product_category: row.product_category,
          quantity: row.quantity,
          price: parseFloat(row.price || 0),
          total: parseFloat(row.price || 0) * row.quantity
        }))
      };
      
      console.log(`✅ Found order ${orderId} with ${order.items.length} items`);
      return order;
    } catch (error) {
      console.error('❌ Find order by ID error:', error);
      throw new Error(`Failed to find order: ${error.message}`);
    }
  }

  // ✅ FIXED: Find orders by user ID
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
          total_amount: parseFloat(row.total_amount || 0),
          subtotal: parseFloat(row.subtotal || 0),
          shipping_fee: parseFloat(row.shipping_fee || 0),
          status: row.status,
          payment_method: row.payment_method,
          payment_status: row.payment_status,
          tracking_number: row.tracking_number,
          estimated_delivery: row.estimated_delivery,
          promo_code: row.promo_code,
          shipping_address: shippingAddress,
          item_count: row.item_count,
          total_items: row.total_items,
          created_at: row.created_at
        };
      });
      
      console.log(`✅ Found ${orders.length} orders for user ${userId}`);
      return orders;
    } catch (error) {
      console.error('❌ Find orders by user ID error:', error);
      throw new Error(`Failed to find user orders: ${error.message}`);
    }
  }

  // ✅ FIXED: Get all orders (admin)
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
          total_amount: parseFloat(row.total_amount || 0),
          subtotal: parseFloat(row.subtotal || 0),
          shipping_fee: parseFloat(row.shipping_fee || 0),
          status: row.status,
          payment_method: row.payment_method,
          payment_status: row.payment_status,
          tracking_number: row.tracking_number,
          estimated_delivery: row.estimated_delivery,
          promo_code: row.promo_code,
          shipping_address: shippingAddress,
          item_count: row.item_count,
          total_items: row.total_items,
          created_at: row.created_at
        };
      });
      
      console.log(`✅ Found ${orders.length} total orders`);
      return orders;
    } catch (error) {
      console.error('❌ Find all orders error:', error);
      throw new Error(`Failed to find all orders: ${error.message}`);
    }
  }

  // ✅ FIXED: Get order items for a specific order
  static async getOrderItems(orderId) {
    try {
      const [rows] = await db.execute(
        `SELECT 
          oi.*,
          p.name as product_name,
          p.image_url as product_image,
          p.category as product_category
         FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = ?`,
        [orderId]
      );
      
      const items = rows.map(row => ({
        id: row.id,
        product_id: row.product_id,
        product_name: row.product_name,
        product_image: row.product_image,
        product_category: row.product_category,
        quantity: row.quantity,
        price: parseFloat(row.price || 0),
        total: parseFloat(row.price || 0) * row.quantity
      }));
      
      console.log(`✅ Found ${items.length} items for order ${orderId}`);
      return items;
    } catch (error) {
      console.error('❌ Get order items error:', error);
      throw new Error(`Failed to get order items: ${error.message}`);
    }
  }

  // ✅ FIXED: Check if user owns order
  static async userOwnsOrder(orderId, userId) {
    try {
      const [rows] = await db.execute(
        `SELECT id FROM orders WHERE id = ? AND user_id = ?`,
        [orderId, userId]
      );
      
      return rows.length > 0;
    } catch (error) {
      console.error('❌ Check order ownership error:', error);
      throw new Error(`Failed to check order ownership: ${error.message}`);
    }
  }

  // ✅ FIXED: Get recent orders for dashboard
  static async getRecentOrders(limit = 10) {
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
         GROUP BY o.id
         ORDER BY o.created_at DESC
         LIMIT ?`,
        [limit]
      );
      
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
          total_amount: parseFloat(row.total_amount || 0),
          status: row.status,
          payment_method: row.payment_method,
          payment_status: row.payment_status,
          shipping_address: shippingAddress,
          item_count: row.item_count,
          created_at: row.created_at
        };
      });
      
      return orders;
    } catch (error) {
      console.error('❌ Get recent orders error:', error);
      throw new Error(`Failed to get recent orders: ${error.message}`);
    }
  }

  // ✅ FIXED: Simple sales statistics
  static async getSalesStats() {
    try {
      const [rows] = await db.execute(`
        SELECT 
          COUNT(*) as total_orders,
          SUM(total_amount) as total_revenue,
          AVG(total_amount) as avg_order_value,
          COUNT(DISTINCT user_id) as total_customers,
          SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as completed_orders,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_orders,
          SUM(CASE WHEN payment_status = 'completed' THEN 1 ELSE 0 END) as paid_orders
        FROM orders
        WHERE status != 'cancelled'
      `);
      
      const stats = rows[0] || {};
      
      // Calculate additional metrics
      stats.completion_rate = stats.total_orders > 0 ? 
        (stats.completed_orders / stats.total_orders * 100).toFixed(2) : 0;
      stats.payment_success_rate = stats.total_orders > 0 ? 
        (stats.paid_orders / stats.total_orders * 100).toFixed(2) : 0;
      
      console.log('✅ Sales stats calculated:', stats);
      return stats;
    } catch (error) {
      console.error('❌ Get sales stats error:', error);
      throw new Error(`Failed to get sales stats: ${error.message}`);
    }
  }

  // ✅ FIXED: Cancel order
  static async cancelOrder(orderId, reason = 'Customer request') {
    let connection;
    try {
      connection = await db.getConnection();
      await connection.beginTransaction();

      // Get order items to restore stock
      const [items] = await connection.execute(
        `SELECT product_id, quantity FROM order_items WHERE order_id = ?`,
        [orderId]
      );

      // Restore stock for each item
      for (const item of items) {
        await connection.execute(
          `UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?`,
          [item.quantity, item.product_id]
        );
      }

      // Update order status
      const [result] = await connection.execute(
        `UPDATE orders SET status = 'cancelled', payment_status = 'refunded' WHERE id = ?`,
        [orderId]
      );

      await connection.commit();
      console.log(`✅ Order ${orderId} cancelled and stock restored`);
      return result.affectedRows > 0;
    } catch (error) {
      if (connection) {
        await connection.rollback();
      }
      console.error('❌ Cancel order error:', error);
      throw new Error(`Failed to cancel order: ${error.message}`);
    } finally {
      if (connection) {
        connection.release();
      }
    }
  }

  // ✅ FIXED: Get orders by status
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
          total_amount: parseFloat(row.total_amount || 0),
          subtotal: parseFloat(row.subtotal || 0),
          shipping_fee: parseFloat(row.shipping_fee || 0),
          status: row.status,
          payment_method: row.payment_method,
          payment_status: row.payment_status,
          tracking_number: row.tracking_number,
          estimated_delivery: row.estimated_delivery,
          promo_code: row.promo_code,
          shipping_address: shippingAddress,
          item_count: row.item_count,
          created_at: row.created_at
        };
      });
      
      console.log(`✅ Found ${orders.length} orders with status: ${status}`);
      return orders;
    } catch (error) {
      console.error('❌ Find orders by status error:', error);
      throw new Error(`Failed to find orders by status: ${error.message}`);
    }
  }
}

module.exports = Order;