// backend/controllers/offerController.js - FIXED VERSION
const db = require('../config/db');

// Get all active offers with complete product details
const getActiveOffers = async (req, res) => {
  try {
    console.log('🎯 Fetching active offers...');
    
    const [offers] = await db.execute(`
      SELECT 
        po.*,
        p.id as product_id,
        p.name as product_name,
        p.description,
        p.price,
        p.category,
        p.image_url,
        p.image_urls,
        p.stock_quantity,
        p.tags,
        p.is_featured,
        p.is_new,
        p.created_at as product_created_at
      FROM product_offers po
      JOIN products p ON po.product_id = p.id
      WHERE po.is_active = 1 
        AND po.valid_from <= NOW() 
        AND (po.valid_until IS NULL OR po.valid_until >= NOW())
        AND p.stock_quantity > 0
      ORDER BY 
        CASE 
          WHEN po.offer_type = 'Bogo' THEN 1
          WHEN po.discount_percentage > 0 THEN 2
          WHEN po.discount_amount > 0 THEN 3
          ELSE 4
        END DESC,
        po.created_at DESC
    `);

    console.log(`✅ Found ${offers.length} active offers`);

    // Process offers data
    const processedOffers = offers.map(offer => {
      // Process image URLs
      let imageUrls = [];
      if (offer.image_urls) {
        try {
          const parsed = JSON.parse(offer.image_urls);
          imageUrls = Array.isArray(parsed) ? parsed : [parsed];
        } catch {
          imageUrls = [offer.image_urls];
        }
      }
      
      // Fallback to single image_url
      if (imageUrls.length === 0 && offer.image_url) {
        imageUrls = [offer.image_url];
      }
      
      // Final fallback
      if (imageUrls.length === 0) {
        imageUrls = ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500'];
      }

      // Calculate final price based on offer type
      let finalPrice = parseFloat(offer.price);
      let savings = 0;
      
      if (offer.offer_type === 'Bogo') {
        // For BOGO, final price remains same but user gets 2 items
        savings = parseFloat(offer.price);
      } else if (offer.discount_percentage && parseFloat(offer.discount_percentage) > 0) {
        finalPrice = parseFloat(offer.price) * (1 - parseFloat(offer.discount_percentage) / 100);
        savings = parseFloat(offer.price) - finalPrice;
      } else if (offer.discount_amount && parseFloat(offer.discount_amount) > 0) {
        finalPrice = Math.max(0, parseFloat(offer.price) - parseFloat(offer.discount_amount));
        savings = parseFloat(offer.discount_amount);
      }

      // FIX: Ensure savings is a number before calling toFixed()
      const finalSavings = typeof savings === 'number' ? parseFloat(savings.toFixed(2)) : 0;

      return {
        id: offer.id,
        product_id: offer.product_id,
        offer_type: offer.offer_type,
        discount_percentage: offer.discount_percentage ? parseFloat(offer.discount_percentage) : 0,
        discount_amount: offer.discount_amount ? parseFloat(offer.discount_amount) : 0,
        min_quantity: offer.min_quantity,
        max_quantity: offer.max_quantity,
        valid_from: offer.valid_from,
        valid_until: offer.valid_until,
        is_active: Boolean(offer.is_active),
        description: offer.description,
        created_at: offer.created_at,
        updated_at: offer.updated_at,
        
        // Product details
        product_name: offer.product_name,
        name: offer.product_name, // Alias for compatibility
        description: offer.description || getDefaultOfferDescription(offer),
        price: parseFloat(offer.price),
        final_price: parseFloat(finalPrice.toFixed(2)),
        savings: finalSavings,
        category: offer.category,
        image_url: imageUrls[0],
        image_urls: imageUrls,
        stock_quantity: offer.stock_quantity,
        tags: offer.tags ? JSON.parse(offer.tags) : [],
        is_featured: Boolean(offer.is_featured),
        is_new: Boolean(offer.is_new)
      };
    });

    res.json(processedOffers);
  } catch (error) {
    console.error('❌ Get offers error:', error);
    res.status(500).json({ 
      message: 'Error fetching offers',
      error: error.message 
    });
  }
};

// Helper function to generate default offer description
const getDefaultOfferDescription = (offer) => {
  switch (offer.offer_type) {
    case 'Bogo':
      return 'Buy One Get One Free - Amazing Deal!';
    case 'flat_discount':
      return `Flat Rs. ${offer.discount_amount} OFF - Limited Time Offer!`;
    default:
      if (offer.discount_percentage && parseFloat(offer.discount_percentage) > 0) {
        return `${offer.discount_percentage}% OFF - Special Discount!`;
      }
      return 'Special Limited Time Offer - Grab it now!';
  }
};

// Get all offers for admin panel
const getAdminOffers = async (req, res) => {
  try {
    console.log('👑 Fetching all offers for admin...');
    
    const [offers] = await db.execute(`
      SELECT 
        po.*,
        p.name as product_name,
        p.price as product_price,
        p.category,
        p.image_url,
        p.stock_quantity
      FROM product_offers po 
      JOIN products p ON po.product_id = p.id 
      ORDER BY 
        po.is_active DESC,
        po.created_at DESC
    `);
    
    console.log(`✅ Found ${offers.length} total offers for admin`);
    
    res.json({ 
      success: true,
      offers: offers.map(offer => ({
        ...offer,
        discount_percentage: offer.discount_percentage ? parseFloat(offer.discount_percentage) : null,
        discount_amount: offer.discount_amount ? parseFloat(offer.discount_amount) : null,
        is_active: Boolean(offer.is_active)
      }))
    });
  } catch (error) {
    console.error('❌ Get admin offers error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching admin offers',
      error: error.message 
    });
  }
};

// Create new offer
const createOffer = async (req, res) => {
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

    console.log('🎯 Creating new offer:', {
      product_id,
      offer_type,
      discount_percentage,
      discount_amount,
      description
    });

    // Validate required fields
    if (!product_id || !offer_type) {
      return res.status(400).json({
        success: false,
        message: 'Product ID and offer type are required'
      });
    }

    // Validate dates
    if (valid_until && new Date(valid_from) > new Date(valid_until)) {
      return res.status(400).json({
        success: false,
        message: 'Valid until date must be after valid from date'
      });
    }

    // Check if product exists
    const [product] = await db.execute(
      'SELECT id FROM products WHERE id = ?',
      [product_id]
    );

    if (product.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const [result] = await db.execute(
      `INSERT INTO product_offers 
       (product_id, offer_type, discount_percentage, discount_amount, 
        min_quantity, max_quantity, valid_from, valid_until, is_active, description) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        product_id,
        offer_type,
        discount_percentage || null,
        discount_amount || null,
        min_quantity || null,
        max_quantity || null,
        valid_from,
        valid_until || null,
        is_active,
        description || null
      ]
    );

    console.log(`✅ Offer created successfully with ID: ${result.insertId}`);

    // Get the created offer with product details
    const [newOffer] = await db.execute(`
      SELECT po.*, p.name as product_name, p.price 
      FROM product_offers po 
      JOIN products p ON po.product_id = p.id 
      WHERE po.id = ?
    `, [result.insertId]);

    res.status(201).json({ 
      success: true, 
      message: 'Offer created successfully',
      offer: newOffer[0]
    });
  } catch (error) {
    console.error('❌ Create offer error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error creating offer',
      error: error.message 
    });
  }
};

// Update offer
const updateOffer = async (req, res) => {
  try {
    const { id } = req.params;
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

    console.log(`🎯 Updating offer ID: ${id}`);

    // Check if offer exists
    const [existingOffer] = await db.execute(
      'SELECT * FROM product_offers WHERE id = ?',
      [id]
    );

    if (existingOffer.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Offer not found'
      });
    }

    // Validate dates
    if (valid_until && new Date(valid_from) > new Date(valid_until)) {
      return res.status(400).json({
        success: false,
        message: 'Valid until date must be after valid from date'
      });
    }

    await db.execute(
      `UPDATE product_offers 
       SET product_id = ?, offer_type = ?, discount_percentage = ?, discount_amount = ?, 
           min_quantity = ?, max_quantity = ?, valid_from = ?, valid_until = ?, 
           is_active = ?, description = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [
        product_id,
        offer_type,
        discount_percentage || null,
        discount_amount || null,
        min_quantity || null,
        max_quantity || null,
        valid_from,
        valid_until || null,
        is_active !== undefined ? is_active : true,
        description || null,
        id
      ]
    );

    console.log(`✅ Offer ${id} updated successfully`);

    // Get the updated offer
    const [updatedOffer] = await db.execute(`
      SELECT po.*, p.name as product_name, p.price 
      FROM product_offers po 
      JOIN products p ON po.product_id = p.id 
      WHERE po.id = ?
    `, [id]);

    res.json({ 
      success: true, 
      message: 'Offer updated successfully',
      offer: updatedOffer[0]
    });
  } catch (error) {
    console.error('❌ Update offer error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error updating offer',
      error: error.message 
    });
  }
};

// Delete offer
const deleteOffer = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`🗑️ Deleting offer ID: ${id}`);

    // Check if offer exists
    const [existingOffer] = await db.execute(
      'SELECT * FROM product_offers WHERE id = ?',
      [id]
    );

    if (existingOffer.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Offer not found'
      });
    }

    await db.execute('DELETE FROM product_offers WHERE id = ?', [id]);
    
    console.log(`✅ Offer ${id} deleted successfully`);

    res.json({ 
      success: true, 
      message: 'Offer deleted successfully' 
    });
  } catch (error) {
    console.error('❌ Delete offer error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error deleting offer',
      error: error.message 
    });
  }
};

// Get offer statistics for dashboard
const getOfferStats = async (req, res) => {
  try {
    console.log('📊 Fetching offer statistics...');

    const [stats] = await db.execute(`
      SELECT 
        COUNT(*) as total_offers,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_offers,
        SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) as inactive_offers,
        SUM(CASE WHEN offer_type = 'Bogo' THEN 1 ELSE 0 END) as bogo_offers,
        SUM(CASE WHEN discount_percentage > 0 THEN 1 ELSE 0 END) as percentage_offers,
        SUM(CASE WHEN discount_amount > 0 THEN 1 ELSE 0 END) as flat_offers,
        SUM(CASE WHEN valid_until < NOW() THEN 1 ELSE 0 END) as expired_offers
      FROM product_offers
    `);

    const [popularOffers] = await db.execute(`
      SELECT po.*, p.name as product_name, COUNT(c.id) as cart_count
      FROM product_offers po
      JOIN products p ON po.product_id = p.id
      LEFT JOIN cart c ON po.id = c.offer_id
      WHERE po.is_active = 1
      GROUP BY po.id
      ORDER BY cart_count DESC
      LIMIT 5
    `);

    res.json({
      success: true,
      stats: stats[0],
      popular_offers: popularOffers
    });
  } catch (error) {
    console.error('❌ Get offer stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching offer statistics',
      error: error.message
    });
  }
};

// Toggle offer status
const toggleOfferStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    console.log(`🔧 Toggling offer ${id} status to: ${is_active}`);

    const [result] = await db.execute(
      'UPDATE product_offers SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [is_active, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Offer not found'
      });
    }

    console.log(`✅ Offer ${id} status updated to: ${is_active}`);

    res.json({
      success: true,
      message: `Offer ${is_active ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error('❌ Toggle offer status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating offer status',
      error: error.message
    });
  }
};

module.exports = {
  getActiveOffers,
  getAdminOffers,
  createOffer,
  updateOffer,
  deleteOffer,
  getOfferStats,
  toggleOfferStatus
};