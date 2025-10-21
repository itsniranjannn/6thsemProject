const db = require('../config/db');

class RecommendationEngine {
  
  // Content-based filtering based on product categories and features
  static async getRelatedProducts(productId, limit = 4) {
    try {
      // First, get the target product details
      const [targetProduct] = await this.executeQuery(
        'SELECT * FROM products WHERE id = ?',
        [productId]
      );

      if (!targetProduct) {
        return await this.getPopularProducts(limit);
      }

      // Find similar products based on category and price range
      // Using only existing columns: category, price
      const similarProducts = await this.executeQuery(
        `SELECT p.*, 
                (CASE WHEN p.category = ? THEN 3 ELSE 0 END) +
                (CASE WHEN ABS(p.price - ?) / ? < 0.3 THEN 2 ELSE 0 END) as similarity_score
         FROM products p 
         WHERE p.id != ? AND p.stock_quantity > 0
         ORDER BY similarity_score DESC, p.created_at DESC 
         LIMIT ?`,
        [
          targetProduct.category,
          targetProduct.price,
          targetProduct.price,
          productId,
          limit
        ]
      );

      return similarProducts;
    } catch (error) {
      console.error('Error in getRelatedProducts:', error);
      return await this.getPopularProducts(limit);
    }
  }

  // Collaborative filtering based on user purchase history
  static async getUserRecommendations(userId, limit = 4) {
    try {
      // Get user's purchase history
      const userPurchases = await this.executeQuery(
        `SELECT DISTINCT product_id FROM order_items oi 
         JOIN orders o ON oi.order_id = o.id 
         WHERE o.user_id = ?`,
        [userId]
      );

      if (userPurchases.length === 0) {
        return await this.getPopularProducts(limit);
      }

      // Find users who bought similar products
      const similarUsers = await this.executeQuery(
        `SELECT DISTINCT o.user_id 
         FROM order_items oi 
         JOIN orders o ON oi.order_id = o.id 
         WHERE oi.product_id IN (?) AND o.user_id != ?
         LIMIT 10`,
        [userPurchases.map(p => p.product_id), userId]
      );

      if (similarUsers.length === 0) {
        return await this.getPopularProducts(limit);
      }

      // Get products bought by similar users
      const recommendations = await this.executeQuery(
        `SELECT p.*, COUNT(oi.product_id) as purchase_count
         FROM products p
         JOIN order_items oi ON p.id = oi.product_id
         JOIN orders o ON oi.order_id = o.id
         WHERE o.user_id IN (?) AND p.id NOT IN (?)
         GROUP BY p.id
         ORDER BY purchase_count DESC, p.created_at DESC
         LIMIT ?`,
        [
          similarUsers.map(u => u.user_id),
          userPurchases.map(p => p.product_id),
          limit
        ]
      );

      return recommendations;
    } catch (error) {
      console.error('Error in getUserRecommendations:', error);
      return await this.getPopularProducts(limit);
    }
  }

  // Popular products based on sales and ratings
  static async getPopularProducts(limit = 4) {
    try {
      // Calculate popularity based on sales count only (since rating column doesn't exist)
      const popularProducts = await this.executeQuery(
        `SELECT p.*, 
                COALESCE(oi.purchase_count, 0) as popularity_score
         FROM products p
         LEFT JOIN (
           SELECT product_id, COUNT(*) as purchase_count 
           FROM order_items 
           GROUP BY product_id
         ) oi ON p.id = oi.product_id
         WHERE p.stock_quantity > 0
         ORDER BY popularity_score DESC, p.created_at DESC
         LIMIT ?`,
        [limit]
      );

      return popularProducts;
    } catch (error) {
      console.error('Error in getPopularProducts:', error);
      return await this.getFallbackProducts(limit);
    }
  }

  // Machine Learning-based recommendations using cosine similarity
  static async getMLRecommendations(productId, limit = 4) {
    try {
      // Get all products with their features (using only existing columns)
      const allProducts = await this.executeQuery(
        'SELECT id, name, category, price, description FROM products WHERE stock_quantity > 0'
      );

      if (allProducts.length === 0) {
        return [];
      }

      // Create feature vectors for each product
      const productVectors = this.createProductVectors(allProducts);
      
      // Find target product
      const targetProduct = allProducts.find(p => p.id === parseInt(productId));
      if (!targetProduct) {
        return this.getPopularProducts(limit);
      }

      // Calculate cosine similarity with all other products
      const recommendations = allProducts
        .filter(p => p.id !== parseInt(productId))
        .map(product => {
          const similarity = this.cosineSimilarity(
            productVectors[targetProduct.id],
            productVectors[product.id]
          );
          return { ...product, similarity };
        })
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);

      return recommendations;
    } catch (error) {
      console.error('Error in getMLRecommendations:', error);
      return await this.getPopularProducts(limit);
    }
  }

  // Create feature vectors for products (using only existing columns)
  static createProductVectors(products) {
    const vectors = {};
    
    // Get all unique categories
    const categories = [...new Set(products.map(p => p.category))];
    
    products.forEach(product => {
      const vector = [];
      
      // Category one-hot encoding
      categories.forEach(cat => {
        vector.push(product.category === cat ? 1 : 0);
      });
      
      // Normalized price (0-1)
      const prices = products.map(p => parseFloat(p.price));
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      vector.push((parseFloat(product.price) - minPrice) / (maxPrice - minPrice || 1));
      
      vectors[product.id] = vector;
    });
    
    return vectors;
  }

  // Calculate cosine similarity between two vectors
  static cosineSimilarity(vecA, vecB) {
    if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    
    if (normA === 0 || normB === 0) return 0;
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  // Fallback to basic products query
  static async getFallbackProducts(limit = 4) {
    try {
      const fallbackProducts = await this.executeQuery(
        'SELECT * FROM products WHERE stock_quantity > 0 ORDER BY created_at DESC LIMIT ?',
        [limit]
      );
      return fallbackProducts;
    } catch (error) {
      console.error('Error in getFallbackProducts:', error);
      return [];
    }
  }

  // Helper method to execute SQL queries
  static executeQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.query(sql, params, (err, results) => {
        if (err) {
          console.error('SQL Error:', err);
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  }
}

module.exports = RecommendationEngine;