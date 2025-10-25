const db = require('../config/db');

class Product {
  // Update product stock with proper validation
  static async updateStock(productId, quantityChange) {
    try {
      console.log(`📦 Updating stock for product ${productId} by ${quantityChange}`);
      
      // First check current stock
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
      
      // Update stock
      const [result] = await db.execute(
        `UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?`,
        [quantityChange, productId]
      );
      
      if (result.affectedRows === 0) {
        throw new Error('Failed to update product stock');
      }
      
      // Get updated product
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

  // Get product by ID
  static async findById(productId) {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM products WHERE id = ?',
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

  // Get all products with pagination
  static async findAll(limit = 100, offset = 0) {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM products ORDER BY created_at DESC LIMIT ? OFFSET ?',
        [limit, offset]
      );
      
      const [countResult] = await db.execute(
        'SELECT COUNT(*) as total FROM products'
      );
      
      console.log(`✅ Retrieved ${rows.length} products`);
      return {
        products: rows,
        total: countResult[0].total
      };
    } catch (error) {
      console.error('❌ Product find all error:', error);
      throw error;
    }
  }

  // Get products by category with pagination
  static async findByCategory(category, limit = 50, offset = 0) {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM products WHERE category = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
        [category, limit, offset]
      );
      
      const [countResult] = await db.execute(
        'SELECT COUNT(*) as total FROM products WHERE category = ?',
        [category]
      );
      
      console.log(`✅ Retrieved ${rows.length} products in category: ${category}`);
      return {
        products: rows,
        total: countResult[0].total
      };
    } catch (error) {
      console.error('❌ Product find by category error:', error);
      throw error;
    }
  }

  // Search products with pagination
  static async search(query, limit = 50, offset = 0) {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM products WHERE name LIKE ? OR description LIKE ? OR category LIKE ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
        [`%${query}%`, `%${query}%`, `%${query}%`, limit, offset]
      );
      
      const [countResult] = await db.execute(
        'SELECT COUNT(*) as total FROM products WHERE name LIKE ? OR description LIKE ? OR category LIKE ?',
        [`%${query}%`, `%${query}%`, `%${query}%`]
      );
      
      console.log(`🔍 Search for "${query}" returned ${rows.length} products`);
      return {
        products: rows,
        total: countResult[0].total
      };
    } catch (error) {
      console.error('❌ Product search error:', error);
      throw error;
    }
  }

  // Create new product - FIXED: Enhanced to handle all fields
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
        discount_percentage,
        offer_valid_until
      } = productData;
      
      // Handle image_urls - ensure it's stored as JSON string
      const imageUrlsJson = image_urls ? JSON.stringify(image_urls) : JSON.stringify([]);
      const tagsJson = tags ? JSON.stringify(tags) : JSON.stringify([]);
      
      const [result] = await db.execute(
        `INSERT INTO products (
          name, description, price, category, image_urls, stock_quantity,
          tags, is_featured, is_new, discount_percentage, offer_valid_until
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
          parseFloat(discount_percentage) || 0,
          offer_valid_until || null
        ]
      );
      
      console.log(`✅ Created new product: ${name} (ID: ${result.insertId})`);
      return { id: result.insertId, ...productData };
    } catch (error) {
      console.error('❌ Product creation error:', error);
      throw error;
    }
  }

  // Update product - FIXED: Enhanced to handle all fields properly
  static async update(productId, updateData) {
    try {
      const fields = [];
      const values = [];
      
      // Build dynamic update query
      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined && updateData[key] !== null) {
          // Handle special fields that should be stored as JSON
          if (key === 'image_urls' || key === 'tags') {
            const value = Array.isArray(updateData[key]) ? 
              JSON.stringify(updateData[key]) : 
              updateData[key];
            fields.push(`${key} = ?`);
            values.push(value);
          }
          // Handle boolean fields
          else if (key === 'is_featured' || key === 'is_new') {
            fields.push(`${key} = ?`);
            values.push(updateData[key] ? 1 : 0);
          }
          // Handle numeric fields
          else if (key === 'price' || key === 'stock_quantity' || key === 'discount_percentage') {
            fields.push(`${key} = ?`);
            values.push(parseFloat(updateData[key]));
          }
          // Handle other fields
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

  // Get product categories
  static async getCategories() {
    try {
      const [rows] = await db.execute(
        'SELECT DISTINCT category FROM products ORDER BY category'
      );
      const categories = rows.map(row => row.category);
      console.log(`📂 Found ${categories.length} product categories`);
      return categories;
    } catch (error) {
      console.error('❌ Get categories error:', error);
      throw error;
    }
  }

  // Get low stock products
  static async getLowStock(threshold = 5) {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM products WHERE stock_quantity <= ? ORDER BY stock_quantity ASC',
        [threshold]
      );
      console.log(`⚠️ Found ${rows.length} low stock products (threshold: ${threshold})`);
      return rows;
    } catch (error) {
      console.error('❌ Get low stock products error:', error);
      throw error;
    }
  }

  // Get popular products (based on sales/orders)
  static async getPopularProducts(limit = 10) {
    try {
      const [rows] = await db.execute(
        `SELECT p.*, COUNT(oi.product_id) as order_count
         FROM products p
         LEFT JOIN order_items oi ON p.id = oi.product_id
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

  // Get products for admin with pagination
  static async getProductsForAdmin(page = 1, limit = 10, search = '') {
    try {
      const offset = (page - 1) * limit;
      let query = 'SELECT * FROM products';
      let countQuery = 'SELECT COUNT(*) as total FROM products';
      const params = [];
      const countParams = [];

      if (search) {
        query += ' WHERE name LIKE ? OR category LIKE ?';
        countQuery += ' WHERE name LIKE ? OR category LIKE ?';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm);
        countParams.push(searchTerm, searchTerm);
      }

      query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const [rows] = await db.execute(query, params);
      const [countResult] = await db.execute(countQuery, countParams);

      return {
        products: rows,
        total: countResult[0].total
      };
    } catch (error) {
      console.error('❌ Get products for admin error:', error);
      throw error;
    }
  }
}

module.exports = Product;