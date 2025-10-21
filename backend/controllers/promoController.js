const db = require('../config/db');

// Validate promo code
const validatePromoCode = async (req, res) => {
  try {
    const { code, totalAmount, cartItems = [] } = req.body;
    const userId = req.user.id;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Promo code is required'
      });
    }

    // Find active promo code
    const [promos] = await db.execute(
      `SELECT * FROM promo_codes 
       WHERE code = ? AND is_active = TRUE 
       AND (valid_until IS NULL OR valid_until >= NOW())
       AND (usage_limit IS NULL OR used_count < usage_limit)`,
      [code.toUpperCase()]
    );

    if (promos.length === 0) {
      return res.json({
        success: false,
        message: 'Invalid or expired promo code'
      });
    }

    const promo = promos[0];

    // Check minimum order amount
    if (totalAmount < promo.min_order_amount) {
      return res.json({
        success: false,
        message: `Minimum order amount of Rs. ${promo.min_order_amount} required`
      });
    }

    // Check category restrictions
    if (promo.categories) {
      const categories = JSON.parse(promo.categories);
      const cartCategories = cartItems.map(item => item.category);
      const hasMatchingCategory = cartCategories.some(category => 
        categories.includes(category)
      );
      
      if (!hasMatchingCategory) {
        return res.json({
          success: false,
          message: 'Promo code not applicable for selected items'
        });
      }
    }

    // Check if user has already used this code (for single-use codes)
    if (promo.usage_limit === 1) {
      const [usage] = await db.execute(
        `SELECT * FROM promo_usage 
         WHERE promo_code_id = ? AND user_id = ?`,
        [promo.id, userId]
      );

      if (usage.length > 0) {
        return res.json({
          success: false,
          message: 'You have already used this promo code'
        });
      }
    }

    // Calculate discount
    let discount = 0;
    let description = promo.description;

    switch (promo.discount_type) {
      case 'percentage':
        discount = (totalAmount * promo.discount_value) / 100;
        if (promo.max_discount_amount && discount > promo.max_discount_amount) {
          discount = promo.max_discount_amount;
        }
        description = `${promo.discount_value}% off - Rs. ${discount.toFixed(2)} discount`;
        break;

      case 'fixed':
        discount = Math.min(promo.discount_value, totalAmount);
        description = `Rs. ${promo.discount_value} off`;
        break;

      case 'free_shipping':
        discount = 50; // Fixed shipping charge
        description = 'Free shipping applied';
        break;
    }

    res.json({
      success: true,
      discount: parseFloat(discount.toFixed(2)),
      promo: {
        id: promo.id,
        code: promo.code,
        description: description,
        discount_type: promo.discount_type,
        original_value: promo.discount_value
      }
    });

  } catch (error) {
    console.error('Promo validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error validating promo code'
    });
  }
};

// Get available promo codes for user
const getAvailablePromoCodes = async (req, res) => {
  try {
    const userId = req.user.id;
    const { totalAmount = 0 } = req.query;

    const [promos] = await db.execute(
      `SELECT pc.*, 
              (pu.user_id IS NOT NULL) as is_used,
              (pc.usage_limit = 1 AND pu.user_id IS NOT NULL) as cannot_use_again
       FROM promo_codes pc
       LEFT JOIN promo_usage pu ON pc.id = pu.promo_code_id AND pu.user_id = ?
       WHERE pc.is_active = TRUE 
       AND (pc.valid_until IS NULL OR pc.valid_until >= NOW())
       AND (pc.usage_limit IS NULL OR pc.used_count < pc.usage_limit)
       AND pc.min_order_amount <= ?
       ORDER BY pc.discount_value DESC`,
      [userId, parseFloat(totalAmount)]
    );

    const availablePromos = promos.filter(promo => !promo.cannot_use_again);

    res.json({
      success: true,
      promos: availablePromos.map(promo => ({
        code: promo.code,
        description: promo.description,
        discount_type: promo.discount_type,
        discount_value: promo.discount_value,
        min_order_amount: promo.min_order_amount,
        max_discount_amount: promo.max_discount_amount,
        categories: promo.categories ? JSON.parse(promo.categories) : null,
        valid_until: promo.valid_until
      }))
    });

  } catch (error) {
    console.error('Get promos error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching promo codes'
    });
  }
};

// Record promo code usage
const recordPromoUsage = async (promoCodeId, userId, orderId) => {
  try {
    await db.execute(
      'INSERT INTO promo_usage (promo_code_id, user_id, order_id) VALUES (?, ?, ?)',
      [promoCodeId, userId, orderId]
    );

    // Update usage count
    await db.execute(
      'UPDATE promo_codes SET used_count = used_count + 1 WHERE id = ?',
      [promoCodeId]
    );
  } catch (error) {
    console.error('Record promo usage error:', error);
  }
};

module.exports = {
  validatePromoCode,
  getAvailablePromoCodes,
  recordPromoUsage
};