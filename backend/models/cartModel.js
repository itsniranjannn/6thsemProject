const db = require('../config/db');

class Cart {
  static async getCartItems(userId) {
    try {
      const [rows] = await db.execute(
        `SELECT 
          c.*, 
          p.name, 
          p.price, 
          p.image_url, 
          p.stock_quantity,
          p.description,
          p.category
         FROM cart c 
         JOIN products p ON c.product_id = p.id 
         WHERE c.user_id = ?`,
        [userId]
      );
      
      console.log(`🛒 Retrieved ${rows.length} cart items for user ${userId}`);
      return rows;
    } catch (error) {
      console.error('❌ Get cart items error:', error);
      throw error;
    }
  }

  static async addToCart(userId, productId, quantity = 1) {
    try {
      // Check if item already exists in cart
      const [existing] = await db.execute(
        'SELECT * FROM cart WHERE user_id = ? AND product_id = ?',
        [userId, productId]
      );

      if (existing.length > 0) {
        // Update quantity if exists
        const [result] = await db.execute(
          'UPDATE cart SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?',
          [quantity, userId, productId]
        );
        console.log(`➕ Updated cart item quantity for user ${userId}, product ${productId}`);
        return result;
      } else {
        // Add new item
        const [result] = await db.execute(
          'INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)',
          [userId, productId, quantity]
        );
        console.log(`🆕 Added new cart item for user ${userId}, product ${productId}`);
        return result;
      }
    } catch (error) {
      console.error('❌ Add to cart error:', error);
      throw error;
    }
  }

  static async updateCartItem(userId, productId, quantity) {
    try {
      if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        return await this.removeFromCart(userId, productId);
      }

      const [result] = await db.execute(
        'UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?',
        [quantity, userId, productId]
      );
      console.log(`✏️ Updated cart item for user ${userId}, product ${productId} to quantity ${quantity}`);
      return result;
    } catch (error) {
      console.error('❌ Update cart item error:', error);
      throw error;
    }
  }

  static async removeFromCart(userId, productId) {
    try {
      const [result] = await db.execute(
        'DELETE FROM cart WHERE user_id = ? AND product_id = ?',
        [userId, productId]
      );
      console.log(`🗑️ Removed cart item for user ${userId}, product ${productId}`);
      return result;
    } catch (error) {
      console.error('❌ Remove from cart error:', error);
      throw error;
    }
  }

  // ✅ FIXED: Enhanced clearCart method
  static async clearCart(userId) {
    try {
      const [result] = await db.execute(
        'DELETE FROM cart WHERE user_id = ?',
        [userId]
      );
      console.log(`🧹🧹 Cleared cart for user ${userId}, removed ${result.affectedRows} items`);
      return result;
    } catch (error) {
      console.error('❌ Clear cart error:', error);
      throw error;
    }
  }

  static async getCartTotal(userId) {
    try {
      const [rows] = await db.execute(
        `SELECT SUM(p.price * c.quantity) as total
         FROM cart c 
         JOIN products p ON c.product_id = p.id 
         WHERE c.user_id = ?`,
        [userId]
      );
      const total = parseFloat(rows[0]?.total || 0);
      console.log(`💰 Cart total for user ${userId}: Rs. ${total.toFixed(2)}`);
      return total;
    } catch (error) {
      console.error('❌ Get cart total error:', error);
      throw error;
    }
  }

  static async getCartItemCount(userId) {
    try {
      const [rows] = await db.execute(
        `SELECT SUM(quantity) as total_items
         FROM cart 
         WHERE user_id = ?`,
        [userId]
      );
      const count = parseInt(rows[0]?.total_items || 0);
      console.log(`🔢 Cart item count for user ${userId}: ${count}`);
      return count;
    } catch (error) {
      console.error('❌ Get cart item count error:', error);
      throw error;
    }
  }

  static async getCartSummary(userId) {
    try {
      const items = await this.getCartItems(userId);
      const total = await this.getCartTotal(userId);
      const itemCount = await this.getCartItemCount(userId);
      
      const summary = {
        items: items,
        total: total,
        itemCount: itemCount,
        shipping: total > 0 ? 50 : 0, // Fixed Rs. 50 shipping
        grandTotal: total > 0 ? total + 50 : 0
      };
      
      console.log(`📊 Cart summary for user ${userId}: ${itemCount} items, Total: Rs. ${total.toFixed(2)}`);
      return summary;
    } catch (error) {
      console.error('❌ Get cart summary error:', error);
      throw error;
    }
  }

  static async checkStockAvailability(userId) {
    try {
      const items = await this.getCartItems(userId);
      const stockIssues = [];

      for (const item of items) {
        if (item.quantity > item.stock_quantity) {
          stockIssues.push({
            productId: item.product_id,
            productName: item.name,
            requested: item.quantity,
            available: item.stock_quantity
          });
        }
      }

      return {
        available: stockIssues.length === 0,
        issues: stockIssues
      };
    } catch (error) {
      console.error('❌ Check stock availability error:', error);
      throw error;
    }
  }
}

module.exports = Cart;