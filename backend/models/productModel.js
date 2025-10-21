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

  // Bulk update stock for multiple products
  static async bulkUpdateStock(items, action = 'deduct') {
    try {
      console.log(`📦 Bulk ${action} stock for ${items.length} items`);
      
      for (const item of items) {
        const quantityChange = action === 'deduct' ? -item.quantity : item.quantity;
        await this.updateStock(item.id, quantityChange);
      }
      
      console.log(`✅ Bulk stock ${action} completed successfully`);
      return true;
    } catch (error) {
      console.error('❌ Bulk stock update error:', error);
      throw error;
    }
  }

  // Check stock availability for a product
  static async checkStock(productId, requiredQuantity) {
    try {
      const [rows] = await db.execute(
        `SELECT stock_quantity, name FROM products WHERE id = ?`,
        [productId]
      );
      
      if (rows.length === 0) {
        return { available: false, reason: 'Product not found' };
      }
      
      const available = rows[0].stock_quantity >= requiredQuantity;
      return {
        available: available,
        currentStock: rows[0].stock_quantity,
        productName: rows[0].name,
        required: requiredQuantity
      };
    } catch (error) {
      console.error('❌ Check stock error:', error);
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

  // Get all products
  static async findAll(limit = 100, offset = 0) {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM products ORDER BY created_at DESC LIMIT ? OFFSET ?',
        [limit, offset]
      );
      console.log(`✅ Retrieved ${rows.length} products`);
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
        'SELECT * FROM products WHERE category = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
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
        'SELECT * FROM products WHERE name LIKE ? OR description LIKE ? OR category LIKE ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
        [`%${query}%`, `%${query}%`, `%${query}%`, limit, offset]
      );
      console.log(`🔍 Search for "${query}" returned ${rows.length} products`);
      return rows;
    } catch (error) {
      console.error('❌ Product search error:', error);
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

  // Create new product
  static async create(productData) {
    try {
      const { name, description, price, category, image_url, stock_quantity } = productData;
      
      const [result] = await db.execute(
        `INSERT INTO products (name, description, price, category, image_url, stock_quantity) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [name, description, price, category, image_url, stock_quantity || 0]
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
        fields.push(`${key} = ?`);
        values.push(updateData[key]);
      });
      
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
}

module.exports = Product;