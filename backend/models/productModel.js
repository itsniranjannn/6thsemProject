const db = require('../config/db');

class Product {
  // Get all products with proper error handling
  static async findAll(limit = 100, offset = 0) {
    try {
      const [rows] = await db.execute(
        `SELECT p.*, 
                COALESCE(AVG(r.rating), 0) as average_rating,
                COUNT(DISTINCT r.id) as review_count,
                po.offer_type,
                po.discount_percentage as offer_discount_percentage,
                po.discount_amount as offer_discount_amount,
                po.is_active as offer_is_active,
                po.valid_until as offer_valid_until
         FROM products p
         LEFT JOIN reviews r ON p.id = r.product_id
         LEFT JOIN product_offers po ON p.id = po.product_id 
           AND po.is_active = 1 
           AND (po.valid_until IS NULL OR po.valid_until > NOW())
         GROUP BY p.id, po.id
         ORDER BY p.created_at DESC 
         LIMIT ? OFFSET ?`,
        [limit, offset]
      );
      
      console.log(`✅ Retrieved ${rows.length} products with reviews`);
      return rows;
    } catch (error) {
      console.error('❌ Product find all error:', error);
      throw error;
    }
  }

  // Get products by category
  static async findByCategory(category, limit = 50, offset = 0) {
    try {
      const [rows] = await db.execute(
        `SELECT p.*, 
                COALESCE(AVG(r.rating), 0) as average_rating,
                COUNT(DISTINCT r.id) as review_count,
                po.offer_type,
                po.discount_percentage as offer_discount_percentage,
                po.discount_amount as offer_discount_amount,
                po.is_active as offer_is_active,
                po.valid_until as offer_valid_until
         FROM products p
         LEFT JOIN reviews r ON p.id = r.product_id
         LEFT JOIN product_offers po ON p.id = po.product_id 
           AND po.is_active = 1 
           AND (po.valid_until IS NULL OR po.valid_until > NOW())
         WHERE p.category = ? 
         GROUP BY p.id, po.id
         ORDER BY p.created_at DESC 
         LIMIT ? OFFSET ?`,
        [category, limit, offset]
      );
      
      console.log(`✅ Retrieved ${rows.length} products in category: ${category}`);
      return rows;
    } catch (error) {
      console.error('❌ Product find by category error:', error);
      throw error;
    }
  }

  // Search products
  static async search(query, limit = 50, offset = 0) {
    try {
      const [rows] = await db.execute(
        `SELECT p.*, 
                COALESCE(AVG(r.rating), 0) as average_rating,
                COUNT(DISTINCT r.id) as review_count,
                po.offer_type,
                po.discount_percentage as offer_discount_percentage,
                po.discount_amount as offer_discount_amount,
                po.is_active as offer_is_active,
                po.valid_until as offer_valid_until
         FROM products p
         LEFT JOIN reviews r ON p.id = r.product_id
         LEFT JOIN product_offers po ON p.id = po.product_id 
           AND po.is_active = 1 
           AND (po.valid_until IS NULL OR po.valid_until > NOW())
         WHERE p.name LIKE ? OR p.description LIKE ? OR p.category LIKE ?
         GROUP BY p.id, po.id
         ORDER BY p.created_at DESC 
         LIMIT ? OFFSET ?`,
        [`%${query}%`, `%${query}%`, `%${query}%`, limit, offset]
      );
      
      console.log(`🔍 Search for "${query}" returned ${rows.length} products`);
      return rows;
    } catch (error) {
      console.error('❌ Product search error:', error);
      throw error;
    }
  }

  // Get product categories
  static async getCategories() {
    try {
      const [rows] = await db.execute(
        'SELECT DISTINCT category FROM products WHERE category IS NOT NULL AND category != "" ORDER BY category'
      );
      const categories = rows.map(row => row.category);
      console.log(`📂 Found ${categories.length} product categories`);
      return categories;
    } catch (error) {
      console.error('❌ Get categories error:', error);
      throw error;
    }
  }

  // Get product by ID
  static async findById(productId) {
    try {
      const [rows] = await db.execute(
        `SELECT p.*, 
                COALESCE(AVG(r.rating), 0) as average_rating,
                COUNT(DISTINCT r.id) as review_count,
                po.offer_type,
                po.discount_percentage as offer_discount_percentage,
                po.discount_amount as offer_discount_amount,
                po.is_active as offer_is_active,
                po.valid_until as offer_valid_until
         FROM products p
         LEFT JOIN reviews r ON p.id = r.product_id
         LEFT JOIN product_offers po ON p.id = po.product_id 
           AND po.is_active = 1 
           AND (po.valid_until IS NULL OR po.valid_until > NOW())
         WHERE p.id = ?
         GROUP BY p.id, po.id`,
        [productId]
      );
      
      if (rows.length === 0) {
        console.log(`❌ Product not found: ${productId}`);
        return null;
      }
      
      console.log(`✅ Found product: ${rows[0].name}`);
      return rows[0];
    } catch (error) {
      console.error('❌ Product find by ID error:', error);
      throw error;
    }
  }

  // Get product reviews
  static async getProductReviews(productId) {
    try {
      // Get reviews with user names
      const [reviews] = await db.execute(
        `SELECT r.*, u.name as user_name 
         FROM reviews r 
         LEFT JOIN users u ON r.user_id = u.id 
         WHERE r.product_id = ? 
         ORDER BY r.created_at DESC`,
        [productId]
      );

      // Get review statistics
      const [stats] = await db.execute(
        `SELECT 
           COUNT(*) as total_reviews,
           COALESCE(AVG(rating), 0) as average_rating,
           SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as five_star,
           SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as four_star,
           SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as three_star,
           SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as two_star,
           SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as one_star
         FROM reviews 
         WHERE product_id = ?`,
        [productId]
      );

      return {
        success: true,
        reviews: reviews,
        stats: {
          total_reviews: stats[0]?.total_reviews || 0,
          average_rating: stats[0]?.average_rating || 0,
          five_star: stats[0]?.five_star || 0,
          four_star: stats[0]?.four_star || 0,
          three_star: stats[0]?.three_star || 0,
          two_star: stats[0]?.two_star || 0,
          one_star: stats[0]?.one_star || 0
        }
      };
    } catch (error) {
      console.error('❌ Get product reviews error:', error);
      return {
        success: false,
        reviews: [],
        stats: {
          total_reviews: 0,
          average_rating: 0,
          five_star: 0,
          four_star: 0,
          three_star: 0,
          two_star: 0,
          one_star: 0
        }
      };
    }
  }

  // Get active product offers
  static async getActiveOffers(limit = 10) {
    try {
      const [rows] = await db.execute(
        `SELECT po.*, p.name as product_name, p.image_urls, p.price, p.discount_percentage
         FROM product_offers po
         JOIN products p ON po.product_id = p.id
         WHERE po.is_active = 1 
         AND (po.valid_until IS NULL OR po.valid_until > NOW())
         ORDER BY po.created_at DESC
         LIMIT ?`,
        [limit]
      );
      
      console.log(`🎁 Retrieved ${rows.length} active offers`);
      return rows;
    } catch (error) {
      console.error('❌ Get active offers error:', error);
      throw error;
    }
  }

  // Update product stock
  static async updateStock(productId, quantityChange) {
    try {
      console.log(`📦 Updating stock for product ${productId} by ${quantityChange}`);
      
      const [current] = await db.execute(
        'SELECT stock_quantity, name FROM products WHERE id = ?',
        [productId]
      );
      
      if (current.length === 0) {
        throw new Error(`Product with ID ${productId} not found`);
      }
      
      const currentStock = current[0].stock_quantity;
      const productName = current[0].name;
      const newStock = currentStock + quantityChange;
      
      if (newStock < 0) {
        throw new Error(`Insufficient stock for ${productName}. Available: ${currentStock}, Requested: ${-quantityChange}`);
      }
      
      const [result] = await db.execute(
        `UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?`,
        [quantityChange, productId]
      );
      
      if (result.affectedRows === 0) {
        throw new Error('Failed to update product stock');
      }
      
      const [products] = await db.execute(
        'SELECT * FROM products WHERE id = ?',
        [productId]
      );
      
      console.log(`✅ Product ${productName} (${productId}) stock updated: ${currentStock} → ${products[0].stock_quantity}`);
      return products[0];
    } catch (error) {
      console.error('❌ Stock update error:', error);
      throw error;
    }
  }

  // Create new product
  static async create(productData) {
    try {
      const { 
        name, 
        description, 
        price, 
        category, 
        image_urls, 
        stock_quantity,
        tags,
        is_featured,
        is_new,
        discount_percentage
      } = productData;
      
      const imageUrlsJson = image_urls ? JSON.stringify(image_urls) : JSON.stringify([]);
      const tagsJson = tags ? JSON.stringify(tags) : JSON.stringify([]);
      
      const [result] = await db.execute(
        `INSERT INTO products (
          name, description, price, category, image_urls, stock_quantity,
          tags, is_featured, is_new, discount_percentage
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          name, 
          description || '', 
          parseFloat(price), 
          category, 
          imageUrlsJson, 
          parseInt(stock_quantity) || 0,
          tagsJson,
          is_featured ? 1 : 0,
          is_new ? 1 : 0,
          parseFloat(discount_percentage) || 0
        ]
      );
      
      console.log(`✅ Created new product: ${name} (ID: ${result.insertId})`);
      return { id: result.insertId, ...productData };
    } catch (error) {
      console.error('❌ Product creation error:', error);
      throw error;
    }
  }

  // Update product
  static async update(productId, updateData) {
    try {
      const fields = [];
      const values = [];
      
      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined && updateData[key] !== null) {
          if (key === 'image_urls' || key === 'tags') {
            const value = Array.isArray(updateData[key]) ? 
              JSON.stringify(updateData[key]) : 
              updateData[key];
            fields.push(`${key} = ?`);
            values.push(value);
          }
          else if (key === 'is_featured' || key === 'is_new') {
            fields.push(`${key} = ?`);
            values.push(updateData[key] ? 1 : 0);
          }
          else if (key === 'price' || key === 'stock_quantity' || key === 'discount_percentage') {
            fields.push(`${key} = ?`);
            values.push(parseFloat(updateData[key]));
          }
          else {
            fields.push(`${key} = ?`);
            values.push(updateData[key]);
          }
        }
      });
      
      if (fields.length === 0) {
        throw new Error('No fields to update');
      }
      
      values.push(productId);
      
      const [result] = await db.execute(
        `UPDATE products SET ${fields.join(', ')} WHERE id = ?`,
        values
      );
      
      if (result.affectedRows === 0) {
        throw new Error('Product not found');
      }
      
      console.log(`✅ Updated product ${productId}`);
      return true;
    } catch (error) {
      console.error('❌ Product update error:', error);
      throw error;
    }
  }

  // Delete product
  static async delete(productId) {
    try {
      const [result] = await db.execute(
        'DELETE FROM products WHERE id = ?',
        [productId]
      );
      
      if (result.affectedRows === 0) {
        throw new Error('Product not found');
      }
      
      console.log(`🗑️ Deleted product ${productId}`);
      return true;
    } catch (error) {
      console.error('❌ Product delete error:', error);
      throw error;
    }
  }

  // Get popular products
  static async getPopularProducts(limit = 10) {
    try {
      const [rows] = await db.execute(
        `SELECT p.*, 
                COUNT(oi.product_id) as order_count,
                COALESCE(AVG(r.rating), 0) as average_rating,
                COUNT(r.id) as review_count
         FROM products p
         LEFT JOIN order_items oi ON p.id = oi.product_id
         LEFT JOIN reviews r ON p.id = r.product_id
         GROUP BY p.id
         ORDER BY order_count DESC, p.created_at DESC
         LIMIT ?`,
        [limit]
      );
      console.log(`🔥 Retrieved ${rows.length} popular products`);
      return rows;
    } catch (error) {
      console.error('❌ Get popular products error:', error);
      throw error;
    }
  }

  // Get featured products
  static async getFeaturedProducts(limit = 8) {
    try {
      const [rows] = await db.execute(
        `SELECT p.*,
                COALESCE(AVG(r.rating), 0) as average_rating,
                COUNT(r.id) as review_count
         FROM products p
         LEFT JOIN reviews r ON p.id = r.product_id
         WHERE p.is_featured = 1 AND p.stock_quantity > 0 
         GROUP BY p.id
         ORDER BY p.created_at DESC 
         LIMIT ?`,
        [limit]
      );
      console.log(`⭐ Retrieved ${rows.length} featured products`);
      return rows;
    } catch (error) {
      console.error('❌ Get featured products error:', error);
      throw error;
    }
  }

  // Get new arrival products
  static async getNewArrivals(limit = 8) {
    try {
      const [rows] = await db.execute(
        `SELECT p.*,
                COALESCE(AVG(r.rating), 0) as average_rating,
                COUNT(r.id) as review_count
         FROM products p
         LEFT JOIN reviews r ON p.id = r.product_id
         WHERE p.is_new = 1 AND p.stock_quantity > 0 
         GROUP BY p.id
         ORDER BY p.created_at DESC 
         LIMIT ?`,
        [limit]
      );
      console.log(`🆕 Retrieved ${rows.length} new arrival products`);
      return rows;
    } catch (error) {
      console.error('❌ Get new arrivals error:', error);
      throw error;
    }
  }
}

module.exports = Product;