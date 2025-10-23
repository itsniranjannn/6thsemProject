const db = require('../config/db');

class PromoCode {
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
        valid_from, 
        valid_until, 
        is_active 
      } = promoData;
      
      const [result] = await db.execute(
        `INSERT INTO promo_codes (code, description, discount_type, discount_value, min_order_amount, max_uses, valid_from, valid_until, is_active) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          code,
          description,
          discount_type,
          discount_value,
          min_order_amount,
          max_uses,
          valid_from,
          valid_until,
          is_active !== undefined ? is_active : true
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
      const [rows] = await db.execute(
        'SELECT * FROM promo_codes WHERE code = ? AND is_active = true',
        [code]
      );
      
      if (rows.length === 0) {
        return null;
      }
      
      const promo = rows[0];
      
      // Check if promo code is still valid
      const now = new Date();
      const validFrom = new Date(promo.valid_from);
      const validUntil = new Date(promo.valid_until);
      
      if (now < validFrom || now > validUntil) {
        return null;
      }
      
      console.log(`✅ Found valid promo code: ${code}`);
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
  static async validatePromoCode(code, orderAmount) {
    try {
      const promo = await this.findByCode(code);
      
      if (!promo) {
        return { valid: false, message: 'Invalid promo code' };
      }
      
      // Check minimum order amount
      if (orderAmount < promo.min_order_amount) {
        return { 
          valid: false, 
          message: `Minimum order amount of Rs. ${promo.min_order_amount} required` 
        };
      }
      
      // Check usage limit
      if (promo.max_uses) {
        const [usageCount] = await db.execute(
          'SELECT COUNT(*) as count FROM order_promo_codes WHERE promo_code_id = ?',
          [promo.id]
        );
        
        if (usageCount[0].count >= promo.max_uses) {
          return { valid: false, message: 'Promo code usage limit exceeded' };
        }
      }
      
      // Calculate discount
      let discountAmount = 0;
      if (promo.discount_type === 'percentage') {
        discountAmount = (orderAmount * promo.discount_value) / 100;
      } else {
        discountAmount = promo.discount_value;
      }
      
      return {
        valid: true,
        promo: promo,
        discountAmount: discountAmount,
        finalAmount: Math.max(0, orderAmount - discountAmount)
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
         AND valid_until >= NOW() 
         ORDER BY created_at DESC`
      );
      console.log(`✅ Retrieved ${rows.length} active promo codes`);
      return rows;
    } catch (error) {
      console.error('❌ Get active promo codes error:', error);
      throw error;
    }
  }
}

module.exports = PromoCode;
