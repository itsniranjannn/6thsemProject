const db = require('../config/db');

class PromoCode {
  static parseCategories(rawCategories) {
    if (!rawCategories) return [];
    if (Array.isArray(rawCategories)) return rawCategories.filter(Boolean);
    if (typeof rawCategories === 'string') {
      try {
        const parsed = JSON.parse(rawCategories);
        return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
      } catch (error) {
        return [];
      }
    }
    return [];
  }

  static normalizePromoType(discountType) {
    return ['percentage', 'fixed', 'free_shipping'].includes(discountType)
      ? discountType
      : 'fixed';
  }

  // Create new promo code
  static async create(promoData) {
    try {
      const { 
        code, 
        description, 
        discount_type, 
        discount_value, 
        min_order_amount, 
        max_uses,
        usage_limit,
        max_discount_amount,
        valid_from, 
        valid_until, 
        is_active,
        categories
      } = promoData;
      
      const normalizedUsageLimit = usage_limit ?? max_uses ?? null;

      const [result] = await db.execute(
        `INSERT INTO promo_codes (code, description, discount_type, discount_value, min_order_amount, usage_limit, max_discount_amount, valid_from, valid_until, is_active, categories) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          code,
          description,
          discount_type,
          discount_value,
          min_order_amount,
          normalizedUsageLimit,
          max_discount_amount || null,
          valid_from,
          valid_until,
          is_active !== undefined ? is_active : true,
          Array.isArray(categories) && categories.length > 0 ? JSON.stringify(categories) : null
        ]
      );
      
      console.log(`✅ Created new promo code: ${code} (ID: ${result.insertId})`);
      return { id: result.insertId, ...promoData };
    } catch (error) {
      console.error('❌ Promo code creation error:', error);
      throw error;
    }
  }

  // Get all promo codes
  static async findAll() {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM promo_codes ORDER BY created_at DESC'
      );
      console.log(`✅ Retrieved ${rows.length} promo codes`);
      return rows;
    } catch (error) {
      console.error('❌ Get promo codes error:', error);
      throw error;
    }
  }

  // Get promo code by ID
  static async findById(promoId) {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM promo_codes WHERE id = ?',
        [promoId]
      );
      
      if (rows.length === 0) {
        console.log(`❌ Promo code not found: ${promoId}`);
        return null;
      }
      
      console.log(`✅ Found promo code: ${rows[0].code}`);
      return rows[0];
    } catch (error) {
      console.error('❌ Promo code find by ID error:', error);
      throw error;
    }
  }

  // Get promo code by code
  static async findByCode(code) {
    try {
      const normalizedCode = String(code || '').trim().toUpperCase();
      if (!normalizedCode) return null;

      const [rows] = await db.execute(
        `SELECT * FROM promo_codes 
         WHERE UPPER(code) = ?
         AND is_active = true
         AND valid_from <= NOW()
         AND (valid_until IS NULL OR valid_until >= NOW())
         LIMIT 1`,
        [normalizedCode]
      );
      
      if (rows.length === 0) {
        return null;
      }
      
      const promo = rows[0];

      console.log(`✅ Found valid promo code: ${normalizedCode}`);
      return promo;
    } catch (error) {
      console.error('❌ Promo code find by code error:', error);
      throw error;
    }
  }

  // Update promo code
  static async update(promoId, updateData) {
    try {
      const fields = [];
      const values = [];
      
      Object.keys(updateData).forEach(key => {
        fields.push(`${key} = ?`);
        values.push(updateData[key]);
      });
      
      values.push(promoId);
      
      const [result] = await db.execute(
        `UPDATE promo_codes SET ${fields.join(', ')} WHERE id = ?`,
        values
      );
      
      if (result.affectedRows === 0) {
        throw new Error('Promo code not found');
      }
      
      console.log(`✅ Updated promo code ${promoId}`);
      return true;
    } catch (error) {
      console.error('❌ Promo code update error:', error);
      throw error;
    }
  }

  // Delete promo code
  static async delete(promoId) {
    try {
      const [result] = await db.execute(
        'DELETE FROM promo_codes WHERE id = ?',
        [promoId]
      );
      
      if (result.affectedRows === 0) {
        throw new Error('Promo code not found');
      }
      
      console.log(`🗑️ Deleted promo code ${promoId}`);
      return true;
    } catch (error) {
      console.error('❌ Promo code delete error:', error);
      throw error;
    }
  }

  // Validate promo code
  static async validatePromoCode(code, orderAmount, cartCategories = [], cartItems = []) {
    try {
      const promo = await this.findByCode(code);
      
      if (!promo) {
        return { valid: false, message: 'Invalid promo code' };
      }
      
      const promoCategories = this.parseCategories(promo.categories);
      const hasCategoryRestriction = promoCategories.length > 0;

      const normalizedItems = Array.isArray(cartItems)
        ? cartItems
            .map((item) => ({
              category: item.category || null,
              quantity: Math.max(0, parseInt(item.quantity, 10) || 0),
              price: Math.max(0, parseFloat(item.price || 0))
            }))
            .filter((item) => item.quantity > 0 && item.price >= 0)
        : [];

      const eligibleItems = normalizedItems.filter((item) => {
        if (!hasCategoryRestriction) return true;
        return item.category && promoCategories.includes(item.category);
      });

      const eligibleSubtotal =
        normalizedItems.length > 0
          ? eligibleItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
          : parseFloat(orderAmount) || 0;

      const ineligibleSubtotal = Math.max(0, (parseFloat(orderAmount) || 0) - eligibleSubtotal);
      const eligibleItemCount = eligibleItems.reduce((sum, item) => sum + item.quantity, 0);

      if (hasCategoryRestriction && normalizedItems.length > 0 && eligibleItemCount === 0) {
        return {
          valid: false,
          message: `This promo code is only valid for: ${promoCategories.join(', ')}`
        };
      }

      const minimumValidationAmount = hasCategoryRestriction ? eligibleSubtotal : (parseFloat(orderAmount) || 0);
      if (minimumValidationAmount < (parseFloat(promo.min_order_amount) || 0)) {
        return {
          valid: false,
          message: `Minimum order amount of Rs. ${promo.min_order_amount} required`
        };
      }
      
      // Check usage limit
      const usageLimit = promo.max_uses || promo.usage_limit;
      if (usageLimit) {
        const [usageCount] = await db.execute(
          'SELECT COUNT(*) as count FROM promo_usage WHERE promo_code_id = ?',
          [promo.id]
        );
        
        if (usageCount[0].count >= usageLimit) {
          return { valid: false, message: 'Promo code usage limit exceeded' };
        }
      }
      
      // Calculate discount
      let discountAmount = 0;
      const promoType = this.normalizePromoType(promo.discount_type);
      if (promoType === 'free_shipping') {
        discountAmount = 0;
      } else if (promoType === 'percentage') {
        discountAmount = (eligibleSubtotal * promo.discount_value) / 100;
        if (promo.max_discount_amount) {
          discountAmount = Math.min(discountAmount, parseFloat(promo.max_discount_amount) || discountAmount);
        }
      } else {
        discountAmount = parseFloat(promo.discount_value) || 0;
      }

      discountAmount = Math.min(discountAmount, eligibleSubtotal);
      
      return {
        valid: true,
        promo: promo,
        discountAmount: discountAmount,
        finalAmount: Math.max(0, (parseFloat(orderAmount) || 0) - discountAmount),
        breakdown: {
          eligibleSubtotal,
          ineligibleSubtotal,
          eligibleItemCount,
          appliesToAllCategories: !hasCategoryRestriction,
          categories: hasCategoryRestriction ? promoCategories : [],
          isFreeShipping: promoType === 'free_shipping'
        }
      };
    } catch (error) {
      console.error('❌ Promo code validation error:', error);
      throw error;
    }
  }

  // Get active promo codes
  static async getActivePromoCodes() {
    try {
      const [rows] = await db.execute(
        `SELECT * FROM promo_codes 
         WHERE is_active = true 
         AND valid_from <= NOW() 
         AND (valid_until IS NULL OR valid_until >= NOW()) 
         ORDER BY created_at DESC`
      );
      console.log(`✅ Retrieved ${rows.length} active promo codes`);
      return rows;
    } catch (error) {
      console.error('❌ Get active promo codes error:', error);
      throw error;
    }
  }

  // Get available promo codes for checkout
  static async getAvailablePromoCodes(totalAmount, categories = []) {
    try {
      // First, get all active promo codes that meet the minimum order amount
      let query = `
        SELECT * FROM promo_codes 
        WHERE is_active = true 
        AND valid_from <= NOW() 
        AND (valid_until IS NULL OR valid_until >= NOW())
        AND min_order_amount <= ?
        ORDER BY created_at DESC
      `;
      
      const [rows] = await db.execute(query, [totalAmount]);
      
      // Process the results and filter by categories on the application side
      const processedRows = rows.map(row => {
        let promoCategories = [];
        if (row.categories) {
          try {
            promoCategories = JSON.parse(row.categories);
          } catch (e) {
            promoCategories = [];
          }
        }
        return {
          ...row,
          categories: promoCategories
        };
      });
      
      // Filter by categories if provided
      let filteredRows = processedRows;
      if (categories && categories.length > 0) {
        filteredRows = processedRows.filter(promo => {
          // If promo has no category restrictions, it's applicable to all
          if (!promo.categories || promo.categories.length === 0) {
            return true;
          }
          
          // If promo has category restrictions, check if any cart category matches
          return categories.some(cartCategory => 
            promo.categories.includes(cartCategory)
          );
        });
      }
      
      console.log(`✅ Retrieved ${filteredRows.length} available promo codes for amount ${totalAmount}`);
      return filteredRows;
    } catch (error) {
      console.error('❌ Get available promo codes error:', error);
      throw error;
    }
  }
}

module.exports = PromoCode;
