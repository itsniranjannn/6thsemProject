const db = require('../config/db');

// Simple in-memory cache for ML recommendations (5-minute expiry)
const mlCache = {
  data: null,
  timestamp: 0,
  TTL: 5 * 60 * 1000  // 5 minutes in milliseconds
};

// Invalidate cache (call this when products are updated)
function invalidateMLCache() {
  mlCache.data = null;
  mlCache.timestamp = 0;
}

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

      // Find similar products based on category and price range, with rating and reviewCount
      const similarProducts = await this.executeQuery(
        `SELECT p.id, p.name, p.description, p.price, p.category, 
                p.image_url, p.image_urls, p.tags, p.is_featured, p.is_new,
                p.discount_percentage, p.stock_quantity, p.created_at,
                COALESCE(AVG(r.rating), 0) as rating,
                COUNT(r.id) as reviewCount,
                (CASE WHEN p.category = ? THEN 3 ELSE 0 END) +
                (CASE WHEN ABS(p.price - ?) / ? < 0.3 THEN 2 ELSE 0 END) as similarity_score
         FROM products p 
         LEFT JOIN reviews r ON p.id = r.product_id
         WHERE p.id != ? AND p.stock_quantity > 0
         GROUP BY p.id
         ORDER BY similarity_score DESC, p.created_at DESC 
         LIMIT ?`,
        [
          targetProduct.category,
          targetProduct.price,
          targetProduct.price || 1,
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
  // Returns { recommendations: [], fallback: boolean, fallbackReason: string }
  static async getUserRecommendations(userId, limit = 4, returnMetadata = false) {
    try {
      // Get user's purchase history
      const userPurchases = await this.executeQuery(
        `SELECT DISTINCT product_id FROM order_items oi 
         JOIN orders o ON oi.order_id = o.id 
         WHERE o.user_id = ?`,
        [userId]
      );

      if (userPurchases.length === 0) {
        const popular = await this.getPopularProducts(limit);
        if (returnMetadata) {
          return { 
            recommendations: popular, 
            fallback: true, 
            fallbackReason: 'no_purchases',
            algorithm_used: 'popularity'
          };
        }
        return popular;
      }

      const purchasedProductIds = userPurchases.map(p => p.product_id);
      
      // Build dynamic placeholders for IN clause (mysql2 fix)
      const purchasePlaceholders = purchasedProductIds.map(() => '?').join(',');

      // Find users who bought similar products
      const similarUsers = await this.executeQuery(
        `SELECT DISTINCT o.user_id 
         FROM order_items oi 
         JOIN orders o ON oi.order_id = o.id 
         WHERE oi.product_id IN (${purchasePlaceholders}) AND o.user_id != ?
         LIMIT 10`,
        [...purchasedProductIds, userId]
      );

      if (similarUsers.length === 0) {
        const popular = await this.getPopularProducts(limit);
        if (returnMetadata) {
          return { 
            recommendations: popular, 
            fallback: true, 
            fallbackReason: 'no_similar_users',
            algorithm_used: 'popularity'
          };
        }
        return popular;
      }

      const similarUserIds = similarUsers.map(u => u.user_id);
      const userPlaceholders = similarUserIds.map(() => '?').join(',');

      // Get products bought by similar users, with rating and reviewCount
      const recommendations = await this.executeQuery(
        `SELECT p.id, p.name, p.description, p.price, p.category, 
                p.image_url, p.image_urls, p.tags, p.is_featured, p.is_new,
                p.discount_percentage, p.stock_quantity, p.created_at,
                COALESCE(AVG(rev.rating), 0) as rating,
                COUNT(DISTINCT rev.id) as reviewCount,
                COUNT(oi.product_id) as purchase_count
         FROM products p
         JOIN order_items oi ON p.id = oi.product_id
         JOIN orders o ON oi.order_id = o.id
         LEFT JOIN reviews rev ON p.id = rev.product_id
         WHERE o.user_id IN (${userPlaceholders}) AND p.id NOT IN (${purchasePlaceholders})
         GROUP BY p.id
         ORDER BY purchase_count DESC, p.created_at DESC
         LIMIT ?`,
        [...similarUserIds, ...purchasedProductIds, limit]
      );

      if (returnMetadata) {
        return { 
          recommendations, 
          fallback: false, 
          algorithm_used: 'collaborative'
        };
      }
      return recommendations;
    } catch (error) {
      console.error('Error in getUserRecommendations:', error);
      const popular = await this.getPopularProducts(limit);
      if (returnMetadata) {
        return { 
          recommendations: popular, 
          fallback: true, 
          fallbackReason: 'error',
          algorithm_used: 'popularity'
        };
      }
      return popular;
    }
  }

  // Popular products based on sales and ratings
  static async getPopularProducts(limit = 4) {
    try {
      // Calculate popularity based on sales count, featured status, with rating and reviewCount
      const popularProducts = await this.executeQuery(
        `SELECT p.id, p.name, p.description, p.price, p.category, 
                p.image_url, p.image_urls, p.tags, p.is_featured, p.is_new,
                p.discount_percentage, p.stock_quantity, p.created_at,
                COALESCE(AVG(r.rating), 0) as rating,
                COUNT(r.id) as reviewCount,
                (COALESCE(oi.purchase_count, 0) * 2) + 
                (CASE WHEN p.is_featured = 1 THEN 3 ELSE 0 END) +
                (CASE WHEN p.is_new = 1 THEN 2 ELSE 0 END) as popularity_score
         FROM products p
         LEFT JOIN (
           SELECT product_id, COUNT(*) as purchase_count 
           FROM order_items 
           GROUP BY product_id
         ) oi ON p.id = oi.product_id
         LEFT JOIN reviews r ON p.id = r.product_id
         WHERE p.stock_quantity > 0
         GROUP BY p.id
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

  // Enhanced Machine Learning-based recommendations using multiple features
  static async getMLRecommendations(productId, limit = 4) {
    try {
      const now = Date.now();
      let allProducts;
      
      // Check cache for product data
      if (mlCache.data && (now - mlCache.timestamp) < mlCache.TTL) {
        console.log('📦 Using cached ML product data');
        allProducts = mlCache.data;
      } else {
        // Get all products with their features (including image_url for consistency)
        allProducts = await this.executeQuery(
          `SELECT 
            p.id, 
            p.name, 
            p.category, 
            p.price, 
            p.description,
            p.image_url,
            p.image_urls,
            p.is_featured,
            p.is_new,
            p.stock_quantity,
            p.discount_percentage,
            p.created_at,
            COALESCE(AVG(r.rating), 0) as rating,
            COUNT(r.id) as reviewCount
           FROM products p
           LEFT JOIN reviews r ON p.id = r.product_id
           WHERE p.stock_quantity > 0
           GROUP BY p.id`
        );
        
        // Update cache
        mlCache.data = allProducts;
        mlCache.timestamp = now;
        console.log('🔄 ML product data cached');
      }

      if (allProducts.length === 0) {
        return [];
      }

      // Create enhanced feature vectors for each product
      const productVectors = this.createEnhancedProductVectors(allProducts);
      
      // Find target product
      const targetProduct = allProducts.find(p => p.id === parseInt(productId));
      if (!targetProduct) {
        return await this.getPopularProducts(limit);
      }

      // If target product vector doesn't exist, fallback
      if (!productVectors[targetProduct.id]) {
        return await this.getRelatedProducts(productId, limit);
      }

      // Calculate cosine similarity with all other products
      const recommendations = allProducts
        .filter(p => p.id !== parseInt(productId) && productVectors[p.id])
        .map(product => {
          const similarity = this.cosineSimilarity(
            productVectors[targetProduct.id],
            productVectors[product.id]
          );
          return { 
            ...product, 
            similarity,
            // Add confidence score based on similarity
            confidence: Math.round(similarity * 100)
          };
        })
        .filter(rec => rec.similarity > 0.1) // Filter out very low similarity
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);

      // If no good ML recommendations, fallback to content-based
      if (recommendations.length === 0) {
        console.log('ML recommendations failed, falling back to content-based');
        return await this.getRelatedProducts(productId, limit);
      }

      return recommendations;
    } catch (error) {
      console.error('Error in getMLRecommendations:', error);
      // Fallback to content-based recommendations
      return await this.getRelatedProducts(productId, limit);
    }
  }

  // Create enhanced feature vectors for products using ALL available columns
  static createEnhancedProductVectors(products) {
    const vectors = {};
    
    if (products.length === 0) return vectors;
    
    // Get all unique categories
    const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
    
    // Calculate min/max for normalization
    const prices = products.map(p => parseFloat(p.price || 0));
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice || 1;
    
    // Calculate stock range for normalization
    const stocks = products.map(p => parseInt(p.stock_quantity || 0));
    const maxStock = Math.max(...stocks);
    
    // Calculate discount range
    const discounts = products.map(p => parseFloat(p.discount_percentage || 0));
    const maxDiscount = Math.max(...discounts);

    products.forEach(product => {
      const vector = [];
      
      // 1. Category one-hot encoding (using available categories)
      categories.forEach(cat => {
        vector.push(product.category === cat ? 1 : 0);
      });
      
      // 2. Normalized price (0-1)
      vector.push((parseFloat(product.price || 0) - minPrice) / priceRange);
      
      // 3. Featured product flag
      vector.push(product.is_featured ? 1 : 0);
      
      // 4. New product flag
      vector.push(product.is_new ? 1 : 0);
      
      // 5. Normalized stock quantity (0-1)
      vector.push((parseInt(product.stock_quantity || 0)) / (maxStock || 1));
      
      // 6. Discount percentage (0-1)
      vector.push((parseFloat(product.discount_percentage || 0)) / (maxDiscount || 1));
      
      // 7. Product age (newer products get higher weight)
      const productAge = new Date() - new Date(product.created_at);
      const maxAge = new Date() - new Date(products.reduce((oldest, p) => 
        new Date(p.created_at) < new Date(oldest.created_at) ? p : oldest
      ).created_at);
      vector.push(1 - (productAge / (maxAge || 1)));
      
      // 8. Price tier (budget, mid-range, premium)
      const priceTier = parseFloat(product.price || 0) < (minPrice + priceRange * 0.33) ? 0 : 
                       parseFloat(product.price || 0) < (minPrice + priceRange * 0.66) ? 0.5 : 1;
      vector.push(priceTier);
      
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
    
    const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    
    // Ensure similarity is between 0 and 1
    return Math.max(0, Math.min(1, similarity));
  }

  // Fallback to basic products query
  static async getFallbackProducts(limit = 4) {
    try {
      const fallbackProducts = await this.executeQuery(
        `SELECT p.id, p.name, p.description, p.price, p.category, 
                p.image_url, p.image_urls, p.tags, p.is_featured, p.is_new,
                p.discount_percentage, p.stock_quantity, p.created_at,
                COALESCE(AVG(r.rating), 0) as rating,
                COUNT(r.id) as reviewCount
         FROM products p
         LEFT JOIN reviews r ON p.id = r.product_id
         WHERE p.stock_quantity > 0 
         GROUP BY p.id
         ORDER BY p.is_featured DESC, p.created_at DESC 
         LIMIT ?`,
        [limit]
      );
      return fallbackProducts;
    } catch (error) {
      console.error('Error in getFallbackProducts:', error);
      return [];
    }
  }

  // Hybrid recommendations combining multiple algorithms
  static async getHybridRecommendations(productId, userId = null, limit = 4) {
    try {
      const [mlRecs, contentRecs, popularRecs] = await Promise.all([
        this.getMLRecommendations(productId, limit),
        this.getRelatedProducts(productId, limit),
        this.getPopularProducts(limit)
      ]);

      // Combine and deduplicate recommendations
      const allRecs = [...mlRecs, ...contentRecs, ...popularRecs];
      const uniqueRecs = [];
      const seenIds = new Set();

      for (const rec of allRecs) {
        if (!seenIds.has(rec.id) && rec.id !== parseInt(productId)) {
          uniqueRecs.push(rec);
          seenIds.add(rec.id);
        }
        if (uniqueRecs.length >= limit) break;
      }

      return uniqueRecs.slice(0, limit);
    } catch (error) {
      console.error('Error in getHybridRecommendations:', error);
      return await this.getPopularProducts(limit);
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
  
  // Invalidate ML cache (call when products are updated)
  static invalidateCache() {
    invalidateMLCache();
  }
}

module.exports = RecommendationEngine;