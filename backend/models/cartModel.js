// backend/models/cartModel.js - COMPLETE FIXED VERSION
const db = require('../config/db');

class Cart {
  // ✅ Get cart items (with offers) - FIXED BOGO CALCULATION
  static async getCartItems(userId) {
    try {
      const [rows] = await db.execute(
        `SELECT 
          c.*, 
          p.id as product_id,
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
        let hasOffer = false;
        let displayQuantity = quantity;
        let unitPrice = finalPrice;

        // Apply offer calculations only if offer_id exists
        if (item.offer_id) {
          hasOffer = true;
          const offerCalculation = this.calculateOfferPrice(
            originalPrice,
            quantity,
            item
          );
          finalPrice = offerCalculation.finalPrice;
          quantity = offerCalculation.quantity;
          displayQuantity = offerCalculation.displayQuantity;
          unitPrice = offerCalculation.unitPrice;
        }

        return {
          ...item,
          original_price: originalPrice,
          final_price: finalPrice,
          unit_price: unitPrice,
          quantity: quantity,
          display_quantity: displayQuantity,
          has_offer: hasOffer,
          offer_type: item.offer_type,
          // Include offer details for frontend display
          discount_percentage: item.discount_percentage,
          discount_amount: item.discount_amount
        };
      });

      console.log(`🛒 Retrieved ${processedRows.length} cart items for user ${userId}`);
      return processedRows;
    } catch (error) {
      console.error('❌ Get cart items error:', error);
      throw error;
    }
  }

  // ✅ FIXED: PROPER BOGO CALCULATION - Charge for 1 but show 2 items
  static calculateOfferPrice(originalPrice, quantity, offer) {
    let finalPrice = parseFloat(originalPrice);
    let finalQuantity = parseInt(quantity);
    let displayQuantity = finalQuantity;
    let unitPrice = finalPrice;

    console.log('🔧 Calculating offer price:', {
      originalPrice,
      quantity,
      offerType: offer.offer_type,
      discountPercentage: offer.discount_percentage,
      discountAmount: offer.discount_amount
    });

    switch (offer.offer_type) {
      case 'Bogo':
        // ✅ FIXED BOGO LOGIC: Buy 1 Get 1 Free
        // For BOGO: Display 2 items but charge for only 1
        if (finalQuantity >= 1) {
          // Calculate how many paid items (every 2 items, pay for 1)
          const paidItems = Math.ceil(finalQuantity / 2);
          finalPrice = originalPrice * paidItems;
          unitPrice = finalPrice / finalQuantity; // Average price per item
          displayQuantity = finalQuantity; // Show actual quantity in cart
          
          console.log('🎁 BOGO Calculation:', {
            originalQuantity: finalQuantity,
            paidItems,
            finalPrice,
            unitPrice,
            displayQuantity
          });
        }
        break;

      case 'flat_discount':
        if (offer.discount_amount) {
          finalPrice = Math.max(0, originalPrice - parseFloat(offer.discount_amount));
          unitPrice = finalPrice;
        }
        break;

      case 'percentage_discount':
        if (offer.discount_percentage && parseFloat(offer.discount_percentage) > 0) {
          finalPrice = originalPrice * (1 - parseFloat(offer.discount_percentage) / 100);
          unitPrice = finalPrice;
        }
        break;

      default:
        // Handle other discount types
        if (offer.discount_percentage && parseFloat(offer.discount_percentage) > 0) {
          finalPrice = originalPrice * (1 - parseFloat(offer.discount_percentage) / 100);
          unitPrice = finalPrice;
        } else if (offer.discount_amount && parseFloat(offer.discount_amount) > 0) {
          finalPrice = Math.max(0, originalPrice - parseFloat(offer.discount_amount));
          unitPrice = finalPrice;
        }
    }

    console.log('💰 Final calculated price:', {
      finalPrice,
      finalQuantity,
      displayQuantity,
      unitPrice
    });

    return {
      finalPrice: parseFloat(finalPrice.toFixed(2)),
      quantity: finalQuantity,
      displayQuantity: displayQuantity,
      unitPrice: parseFloat(unitPrice.toFixed(2))
    };
  }

  // ✅ Add to cart (with optional offerId)
  static async addToCart(userId, productId, quantity = 1, offerId = null) {
    try {
      console.log('➕ Adding to cart:', { userId, productId, quantity, offerId });

      // Check if item already exists in cart with same offer
      const [existing] = await db.execute(
        'SELECT * FROM cart WHERE user_id = ? AND product_id = ? AND (offer_id <=> ?)',
        [userId, productId, offerId]
      );

      if (existing.length > 0) {
        // Update quantity if exists
        const newQuantity = existing[0].quantity + quantity;
        const [result] = await db.execute(
          'UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ? AND (offer_id <=> ?)',
          [newQuantity, userId, productId, offerId]
        );
        console.log(`➕ Updated cart item quantity for user ${userId}, product ${productId}, offer ${offerId} to ${newQuantity}`);
        return result;
      } else {
        // Add new item
        const [result] = await db.execute(
          'INSERT INTO cart (user_id, product_id, quantity, offer_id) VALUES (?, ?, ?, ?)',
          [userId, productId, quantity, offerId]
        );
        console.log(`🆕 Added new cart item for user ${userId}, product ${productId}, offer ${offerId}, quantity ${quantity}`);
        return result;
      }
    } catch (error) {
      console.error('❌ Add to cart error:', error);
      throw error;
    }
  }

  // ✅ Update quantity - UPDATED with offer handling
  static async updateCartItem(userId, productId, quantity, offerId = null) {
    try {
      if (quantity <= 0) {
        return await this.removeFromCart(userId, productId, offerId);
      }

      const [result] = await db.execute(
        'UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ? AND (offer_id <=> ?)',
        [quantity, userId, productId, offerId]
      );
      console.log(`✏️ Updated cart item for user ${userId}, product ${productId}, offer ${offerId} to quantity ${quantity}`);
      return result;
    } catch (error) {
      console.error('❌ Update cart item error:', error);
      throw error;
    }
  }

  // ✅ Remove from cart - UPDATED with offer handling
  static async removeFromCart(userId, productId, offerId = null) {
    try {
      const [result] = await db.execute(
        'DELETE FROM cart WHERE user_id = ? AND product_id = ? AND (offer_id <=> ?)',
        [userId, productId, offerId]
      );
      console.log(`🗑️ Removed cart item for user ${userId}, product ${productId}, offer ${offerId}`);
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

  // ✅ Cart total (includes offers) - FIXED
  static async getCartTotal(userId) {
    try {
      const items = await this.getCartItems(userId);
      const total = items.reduce((sum, item) => {
        // Use final_price if available (for offers), otherwise use regular price
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

  // ✅ Get cart item by product and offer
  static async getCartItem(userId, productId, offerId = null) {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM cart WHERE user_id = ? AND product_id = ? AND (offer_id <=> ?)',
        [userId, productId, offerId]
      );
      return rows[0] || null;
    } catch (error) {
      console.error('❌ Get cart item error:', error);
      throw error;
    }
  }

  // ✅ Validate cart items (stock, prices, etc.)
  static async validateCartItems(userId) {
    try {
      const items = await this.getCartItems(userId);
      const validationResults = {
        valid: true,
        issues: [],
        items: items.map(item => ({
          productId: item.product_id,
          name: item.name,
          quantity: item.quantity,
          price: item.final_price || item.price,
          originalPrice: item.original_price,
          hasOffer: item.has_offer,
          offerType: item.offer_type,
          stockAvailable: item.stock_quantity >= item.quantity,
          stockQuantity: item.stock_quantity
        }))
      };

      // Check for stock issues
      items.forEach(item => {
        if (item.quantity > item.stock_quantity) {
          validationResults.valid = false;
          validationResults.issues.push({
            type: 'stock',
            productId: item.product_id,
            productName: item.name,
            requested: item.quantity,
            available: item.stock_quantity,
            message: `Only ${item.stock_quantity} items available for ${item.name}`
          });
        }
      });

      return validationResults;
    } catch (error) {
      console.error('❌ Validate cart items error:', error);
      throw error;
    }
  }

  // ✅ Get cart summary for checkout
  static async getCartSummary(userId) {
    try {
      const items = await this.getCartItems(userId);
      const subtotal = items.reduce((sum, item) => {
        const price = parseFloat(item.final_price || item.price);
        return sum + (price * item.quantity);
      }, 0);

      const shipping = subtotal > 0 ? 50 : 0; // Fixed Rs. 50 shipping
      const total = subtotal + shipping;

      const savings = items.reduce((sum, item) => {
        if (item.has_offer) {
          const originalTotal = parseFloat(item.original_price) * item.quantity;
          const finalTotal = parseFloat(item.final_price) * item.quantity;
          return sum + (originalTotal - finalTotal);
        }
        return sum;
      }, 0);

      return {
        subtotal: parseFloat(subtotal.toFixed(2)),
        shipping: parseFloat(shipping.toFixed(2)),
        total: parseFloat(total.toFixed(2)),
        savings: parseFloat(savings.toFixed(2)),
        itemCount: items.reduce((count, item) => count + item.quantity, 0),
        items: items.map(item => ({
          productId: item.product_id,
          name: item.name,
          quantity: item.quantity,
          price: parseFloat(item.final_price || item.price),
          originalPrice: parseFloat(item.original_price),
          hasOffer: item.has_offer,
          offerType: item.offer_type,
          imageUrl: item.image_url,
          category: item.category
        }))
      };
    } catch (error) {
      console.error('❌ Get cart summary error:', error);
      throw error;
    }
  }

  // ✅ Check if product is in cart (with offer)
  static async isProductInCart(userId, productId, offerId = null) {
    try {
      const [rows] = await db.execute(
        'SELECT COUNT(*) as count FROM cart WHERE user_id = ? AND product_id = ? AND (offer_id <=> ?)',
        [userId, productId, offerId]
      );
      return rows[0].count > 0;
    } catch (error) {
      console.error('❌ Check product in cart error:', error);
      throw error;
    }
  }

  // ✅ Get product quantity in cart
  static async getProductQuantity(userId, productId, offerId = null) {
    try {
      const [rows] = await db.execute(
        'SELECT quantity FROM cart WHERE user_id = ? AND product_id = ? AND (offer_id <=> ?)',
        [userId, productId, offerId]
      );
      return rows.length > 0 ? rows[0].quantity : 0;
    } catch (error) {
      console.error('❌ Get product quantity error:', error);
      throw error;
    }
  }

  // ✅ Merge guest cart with user cart after login
  static async mergeCarts(userId, guestCartItems) {
    try {
      let mergedCount = 0;
      
      for (const item of guestCartItems) {
        try {
          const existingItem = await this.getCartItem(userId, item.productId, item.offerId || null);
          
          if (existingItem) {
            // Update quantity if item exists
            await this.updateCartItem(
              userId, 
              item.productId, 
              existingItem.quantity + item.quantity, 
              item.offerId || null
            );
          } else {
            // Add new item
            await this.addToCart(
              userId, 
              item.productId, 
              item.quantity, 
              item.offerId || null
            );
          }
          mergedCount++;
        } catch (error) {
          console.error('Error merging cart item:', error);
        }
      }
      
      console.log(`🔄 Merged ${mergedCount} items from guest cart for user ${userId}`);
      return mergedCount;
    } catch (error) {
      console.error('❌ Merge carts error:', error);
      throw error;
    }
  }

  // ✅ Get cart items count by category
  static async getCartItemsByCategory(userId) {
    try {
      const items = await this.getCartItems(userId);
      const categories = {};
      
      items.forEach(item => {
        const category = item.category || 'Uncategorized';
        if (!categories[category]) {
          categories[category] = {
            count: 0,
            items: [],
            total: 0
          };
        }
        
        const itemTotal = parseFloat(item.final_price || item.price) * item.quantity;
        categories[category].count += item.quantity;
        categories[category].total += itemTotal;
        categories[category].items.push({
          productId: item.product_id,
          name: item.name,
          quantity: item.quantity,
          price: parseFloat(item.final_price || item.price),
          total: itemTotal
        });
      });
      
      return categories;
    } catch (error) {
      console.error('❌ Get cart items by category error:', error);
      throw error;
    }
  }

  // ✅ Remove expired offer items from cart
  static async removeExpiredOfferItems(userId) {
    try {
      const [result] = await db.execute(
        `DELETE c FROM cart c
         JOIN product_offers po ON c.offer_id = po.id
         WHERE c.user_id = ? AND (
           po.is_active = 0 OR 
           po.valid_until < NOW() OR
           (po.valid_from > NOW() AND po.valid_from IS NOT NULL)
         )`,
        [userId]
      );
      
      if (result.affectedRows > 0) {
        console.log(`🗑️ Removed ${result.affectedRows} expired offer items from cart for user ${userId}`);
      }
      
      return result.affectedRows;
    } catch (error) {
      console.error('❌ Remove expired offer items error:', error);
      throw error;
    }
  }

  // ✅ Check if cart has any offer items
  static async hasOfferItems(userId) {
    try {
      const [rows] = await db.execute(
        'SELECT COUNT(*) as count FROM cart WHERE user_id = ? AND offer_id IS NOT NULL',
        [userId]
      );
      return rows[0].count > 0;
    } catch (error) {
      console.error('❌ Check offer items error:', error);
      throw error;
    }
  }

  // ✅ Get offer items count
  static async getOfferItemsCount(userId) {
    try {
      const [rows] = await db.execute(
        'SELECT COUNT(*) as count FROM cart WHERE user_id = ? AND offer_id IS NOT NULL',
        [userId]
      );
      return rows[0].count;
    } catch (error) {
      console.error('❌ Get offer items count error:', error);
      throw error;
    }
  }
}

module.exports = Cart;