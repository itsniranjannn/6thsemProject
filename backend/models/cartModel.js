// backend/models/cartModel.js - CLEAN VERSION (remove duplicates)
const db = require('../config/db');

class Cart {
  // ✅ Get cart items (with offers)
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
          p.category,
          po.id as offer_id,
          po.offer_type,
          po.discount_percentage,
          po.discount_amount,
          po.min_quantity,
          po.max_quantity
         FROM cart c 
         JOIN products p ON c.product_id = p.id 
         LEFT JOIN product_offers po ON c.offer_id = po.id AND po.is_active = 1 
           AND po.valid_from <= NOW() 
           AND (po.valid_until IS NULL OR po.valid_until >= NOW())
         WHERE c.user_id = ?`,
        [userId]
      );

      // Calculate final prices based on offers
      const processedRows = rows.map(item => {
        let finalPrice = parseFloat(item.price);
        let originalPrice = parseFloat(item.price);
        let quantity = item.quantity;

        if (item.offer_id) {
          // Apply offer calculations
          const offerCalculation = this.calculateOfferPrice(
            originalPrice,
            quantity,
            item
          );
          finalPrice = offerCalculation.finalPrice;
          quantity = offerCalculation.quantity;
        }

        return {
          ...item,
          original_price: originalPrice,
          final_price: finalPrice,
          quantity: quantity,
          has_offer: !!item.offer_id,
          offer_type: item.offer_type
        };
      });

      console.log(`🛒 Retrieved ${processedRows.length} cart items for user ${userId}`);
      return processedRows;
    } catch (error) {
      console.error('❌ Get cart items error:', error);
      throw error;
    }
  }

  // ✅ FIXED: Offer price calculation logic
  static calculateOfferPrice(originalPrice, quantity, offer) {
    let finalPrice = parseFloat(originalPrice);
    let finalQuantity = parseInt(quantity);

    switch (offer.offer_type) {
      case 'Bogo':
        // For BOGO: Buy 1 Get 1 Free - charge for 1 item but give 2
        if (finalQuantity === 1) {
          finalQuantity = 2; // Automatically give 2 items for BOGO
          finalPrice = originalPrice; // Charge for only 1
        } else {
          // For multiple quantities, apply BOGO logic
          const paidQuantity = Math.ceil(finalQuantity / 2);
          finalPrice = (originalPrice * paidQuantity) / finalQuantity;
        }
        break;

      case 'flat_discount':
        if (offer.discount_amount) {
          finalPrice = Math.max(0, originalPrice - parseFloat(offer.discount_amount));
        }
        break;

      default:
        // Handle percentage discounts and other types
        if (offer.discount_percentage && parseFloat(offer.discount_percentage) > 0) {
          finalPrice = originalPrice * (1 - parseFloat(offer.discount_percentage) / 100);
        } else if (offer.discount_amount && parseFloat(offer.discount_amount) > 0) {
          finalPrice = Math.max(0, originalPrice - parseFloat(offer.discount_amount));
        }
    }

    return {
      finalPrice: parseFloat(finalPrice.toFixed(2)),
      quantity: finalQuantity
    };
  }

  // ✅ Add to cart (with optional offerId)
  static async addToCart(userId, productId, quantity = 1, offerId = null) {
    try {
      // Check if item already exists in cart with same offer
      const [existing] = await db.execute(
        'SELECT * FROM cart WHERE user_id = ? AND product_id = ? AND (offer_id <=> ?)',
        [userId, productId, offerId]
      );

      if (existing.length > 0) {
        // Update quantity if exists
        const [result] = await db.execute(
          'UPDATE cart SET quantity = quantity + ? WHERE user_id = ? AND product_id = ? AND (offer_id <=> ?)',
          [quantity, userId, productId, offerId]
        );
        console.log(`➕ Updated cart item quantity for user ${userId}, product ${productId}, offer ${offerId}`);
        return result;
      } else {
        // Add new item
        const [result] = await db.execute(
          'INSERT INTO cart (user_id, product_id, quantity, offer_id) VALUES (?, ?, ?, ?)',
          [userId, productId, quantity, offerId]
        );
        console.log(`🆕 Added new cart item for user ${userId}, product ${productId}, offer ${offerId}`);
        return result;
      }
    } catch (error) {
      console.error('❌ Add to cart error:', error);
      throw error;
    }
  }

  // ✅ Update quantity
  static async updateCartItem(userId, productId, quantity) {
    try {
      if (quantity <= 0) {
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

  // ✅ Remove from cart
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

  // ✅ Clear cart
  static async clearCart(userId) {
    try {
      const [result] = await db.execute(
        'DELETE FROM cart WHERE user_id = ?',
        [userId]
      );
      console.log(`🧹 Cleared cart for user ${userId}, removed ${result.affectedRows} items`);
      return result;
    } catch (error) {
      console.error('❌ Clear cart error:', error);
      throw error;
    }
  }

  // ✅ Cart total (includes offers)
  static async getCartTotal(userId) {
    try {
      const items = await this.getCartItems(userId);
      const total = items.reduce((sum, item) => {
        const price = parseFloat(item.final_price || item.price);
        return sum + (price * item.quantity);
      }, 0);

      console.log(`💰 Cart total for user ${userId}: Rs. ${total.toFixed(2)}`);
      return total;
    } catch (error) {
      console.error('❌ Get cart total error:', error);
      throw error;
    }
  }

  // ✅ Count total items
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

  // ✅ Stock check before checkout
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