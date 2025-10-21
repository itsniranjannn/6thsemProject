const db = require('../config/db');

const Review = {
  create: (reviewData) => {
    return new Promise((resolve, reject) => {
      const { user_id, product_id, rating, comment, user_name } = reviewData;
      const query = `
        INSERT INTO reviews (user_id, product_id, rating, comment, user_name, created_at) 
        VALUES (?, ?, ?, ?, ?, NOW())
      `;
      db.query(query, [user_id, product_id, rating, comment, user_name], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  },

  getByProduct: (product_id) => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT r.*, u.name as user_name 
        FROM reviews r 
        LEFT JOIN users u ON r.user_id = u.id 
        WHERE r.product_id = ? 
        ORDER BY r.created_at DESC
      `;
      db.query(query, [product_id], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  },

  getProductStats: (product_id) => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          COUNT(*) as total_reviews,
          AVG(rating) as average_rating,
          COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star,
          COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star,
          COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star,
          COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star,
          COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star
        FROM reviews 
        WHERE product_id = ?
      `;
      db.query(query, [product_id], (err, results) => {
        if (err) reject(err);
        else resolve(results[0]);
      });
    });
  }
};

module.exports = Review;