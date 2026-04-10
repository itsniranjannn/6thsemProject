const express = require('express');
const db = require('../config/db');

const router = express.Router();

router.get('/homepage', async (req, res) => {
  try {
    const [productCountRows] = await db.execute(
      'SELECT COUNT(*) AS total_products FROM products'
    );

    const [userCountRows] = await db.execute(
      "SELECT COUNT(*) AS total_users FROM users WHERE role = 'user'"
    );

    const [happyCustomerRows] = await db.execute(`
      SELECT COUNT(DISTINCT user_id) AS happy_customers
      FROM orders
      WHERE user_id IS NOT NULL
        AND payment_status = 'completed'
        AND status != 'cancelled'
    `);

    const [reviewStatsRows] = await db.execute(`
      SELECT AVG(rating) AS avg_rating, COUNT(*) AS total_reviews
      FROM reviews
    `);

    const [deliveryRows] = await db.execute(`
      SELECT AVG(TIMESTAMPDIFF(HOUR, created_at, estimated_delivery)) AS avg_delivery_hours
      FROM orders
      WHERE estimated_delivery IS NOT NULL
        AND status IN ('confirmed', 'shipped', 'delivered')
    `);

    const totalProducts = Number(productCountRows?.[0]?.total_products || 0);
    const totalUsers = Number(userCountRows?.[0]?.total_users || 0);
    const happyCustomersFromOrders = Number(happyCustomerRows?.[0]?.happy_customers || 0);
    const happyCustomers = happyCustomersFromOrders > 0 ? happyCustomersFromOrders : totalUsers;

    const avgRating = Number(reviewStatsRows?.[0]?.avg_rating || 0);
    const totalReviews = Number(reviewStatsRows?.[0]?.total_reviews || 0);
    const satisfactionRate = totalReviews > 0
      ? Math.max(1, Math.min(100, Math.round((avgRating / 5) * 100)))
      : 95;

    const avgDeliveryHoursRaw = Number(deliveryRows?.[0]?.avg_delivery_hours || 0);
    const deliveryTime = avgDeliveryHoursRaw > 0 ? Math.round(avgDeliveryHoursRaw) : 72;

    res.json({
      success: true,
      stats: {
        totalProducts,
        happyCustomers,
        satisfactionRate,
        deliveryTime
      }
    });
  } catch (error) {
    console.error('Error fetching homepage stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch homepage stats'
    });
  }
});

module.exports = router;
