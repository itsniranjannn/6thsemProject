const PromoCode = require('../models/promoModel');

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

// Get all promo codes
const getPromoCodes = async (req, res) => {
  try {
    const promoCodes = await PromoCode.findAll();
    res.json(promoCodes);
  } catch (error) {
    console.error('Get promo codes error:', error);
    res.status(500).json({ message: 'Error fetching promo codes' });
  }
};

// Get single promo code
const getPromoCodeById = async (req, res) => {
  try {
    const promoCode = await PromoCode.findById(req.params.id);
    if (promoCode) {
      res.json(promoCode);
    } else {
      res.status(404).json({ message: 'Promo code not found' });
    }
  } catch (error) {
    console.error('Get promo code error:', error);
    res.status(500).json({ message: 'Error fetching promo code' });
  }
};

// Create promo code (Admin only)
const createPromoCode = async (req, res) => {
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
      is_active,
      categories,
      apply_to_all_categories
    } = req.body;
    
    // Validate required fields
    if (!code || !discount_type || !discount_value) {
      return res.status(400).json({ 
        message: 'Code, discount type, and discount value are required' 
      });
    }

    // Validate discount type
    if (!['percentage', 'fixed'].includes(discount_type)) {
      return res.status(400).json({ 
        message: 'Discount type must be either "percentage" or "fixed"' 
      });
    }

    // Validate discount value
    if (discount_type === 'percentage' && (discount_value < 0 || discount_value > 100)) {
      return res.status(400).json({ 
        message: 'Percentage discount must be between 0 and 100' 
      });
    }

    if (discount_type === 'fixed' && discount_value < 0) {
      return res.status(400).json({ 
        message: 'Fixed discount must be positive' 
      });
    }

    const categoriesArray = normalizePromoCategories(categories, apply_to_all_categories);

    const result = await PromoCode.create({
      code: code.toUpperCase(),
      description: description || '',
      discount_type,
      discount_value,
      min_order_amount: min_order_amount || 0,
      max_uses: max_uses || null,
      valid_from: valid_from || new Date().toISOString(),
      valid_until: valid_until || null,
      is_active: is_active !== undefined ? is_active : true,
      categories: categoriesArray
    });
    
    res.status(201).json({ 
      message: 'Promo code created successfully', 
      promoCodeId: result.insertId 
    });
  } catch (error) {
    console.error('Create promo code error:', error);
    res.status(400).json({ message: 'Error creating promo code' });
  }
};

// Update promo code (Admin only)
const updatePromoCode = async (req, res) => {
  try {
    await PromoCode.update(req.params.id, req.body);
    res.json({ message: 'Promo code updated successfully' });
  } catch (error) {
    console.error('Update promo code error:', error);
    res.status(400).json({ message: 'Error updating promo code' });
  }
};

// Delete promo code (Admin only)
const deletePromoCode = async (req, res) => {
  try {
    await PromoCode.delete(req.params.id);
    res.json({ message: 'Promo code deleted successfully' });
  } catch (error) {
    console.error('Delete promo code error:', error);
    res.status(500).json({ message: 'Error deleting promo code' });
  }
};

// Validate promo code
const validatePromoCode = async (req, res) => {
  try {
    const { code, totalAmount, categories, cartItems = [] } = req.body;
    
    if (!code || !totalAmount) {
      return res.status(400).json({ 
        success: false,
        message: 'Promo code and total amount are required' 
      });
    }

    let categoriesArray = [];
    if (categories) {
      try {
        categoriesArray = Array.isArray(categories) ? categories : JSON.parse(categories);
      } catch (e) {
        console.error('Error parsing categories:', e);
      }
    }

    const normalizedCartItems = Array.isArray(cartItems)
      ? cartItems.map((item) => ({
          category: item.category || null,
          quantity: item.quantity,
          price: item.price
        }))
      : [];

    const validation = await PromoCode.validatePromoCode(
      code,
      parseFloat(totalAmount),
      categoriesArray,
      normalizedCartItems
    );
    
    if (validation.valid) {
      // ✅ FIXED: Ensure discount is returned as a number
      const discountAmount = parseFloat(validation.discountAmount) || 0;
      const finalAmount = parseFloat(validation.finalAmount) || 0;
      
      res.json({
        success: true,
        promo: validation.promo,
        discount: discountAmount, // ✅ Now a number, not string
        finalAmount: finalAmount,
        breakdown: validation.breakdown || null
      });
    } else {
      res.json({
        success: false,
        message: validation.message
      });
    }
  } catch (error) {
    console.error('Validate promo code error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error validating promo code' 
    });
  }
};

// Get active promo codes
const getActivePromoCodes = async (req, res) => {
  try {
    const promoCodes = await PromoCode.getActivePromoCodes();
    res.json(promoCodes);
  } catch (error) {
    console.error('Get active promo codes error:', error);
    res.status(500).json({ message: 'Error fetching active promo codes' });
  }
};

// Get available promo codes for checkout
const getAvailablePromoCodes = async (req, res) => {
  try {
    const { totalAmount, categories } = req.query;
    
    if (!totalAmount) {
      return res.status(400).json({ 
        success: false,
        message: 'Total amount is required' 
      });
    }

    let categoriesArray = [];
    if (categories) {
      try {
        categoriesArray = JSON.parse(categories);
      } catch (e) {
        console.error('Error parsing categories:', e);
      }
    }

    const promoCodes = await PromoCode.getAvailablePromoCodes(
      parseFloat(totalAmount), 
      categoriesArray
    );
    
    res.json({
      success: true,
      promos: promoCodes
    });
  } catch (error) {
    console.error('Get available promo codes error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching available promo codes' 
    });
  }
};

const recordPromoUsage = async (promoCodeId, userId, orderId) => {
  const db = require('../config/db');
  if (!promoCodeId || !userId || !orderId) return;
  await db.execute(
    `INSERT INTO order_promo_codes (promo_code_id, user_id, order_id, used_at)
     VALUES (?, ?, ?, NOW())`,
    [promoCodeId, userId, orderId]
  );
};

module.exports = {
  getPromoCodes,
  getPromoCodeById,
  createPromoCode,
  updatePromoCode,
  deletePromoCode,
  validatePromoCode,
  getActivePromoCodes,
  getAvailablePromoCodes,
  recordPromoUsage
};
