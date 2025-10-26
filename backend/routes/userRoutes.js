// backend/routes/userRoutes.js
const express = require('express');
const { 
  registerUser, 
  loginUser, 
  getUserProfile,
  verifyEmail,
  resendVerificationEmail,
  requestPasswordReset,
  resetPassword,
  changePassword,
  checkEmailVerification
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// 2️⃣ Create router instance
const router = express.Router();

// 3️⃣ Define authentication routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);

// 4️⃣ Define email verification routes
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerificationEmail);
router.post('/check-verification', checkEmailVerification);

// 5️⃣ Define password management routes
router.post('/forgot-password', requestPasswordReset);
router.post('/reset-password', resetPassword);
router.post('/change-password', protect, changePassword);

// 6️⃣ Notifications route
router.get('/notifications', protect, async (req, res) => {
  try {
    const db = require('../config/db');
    
    // Get notifications for all users or specific user
    const [notifications] = await db.execute(`
      SELECT * FROM notifications 
      WHERE (target_users = 'all' OR JSON_CONTAINS(user_ids, JSON_QUOTE(?)))
        AND (expires_at IS NULL OR expires_at > NOW())
      ORDER BY created_at DESC
      LIMIT 50
    `, [req.user.id.toString()]); // convert user ID to string for JSON comparison

    res.json({
      success: true,
      notifications: notifications || []
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ success: false, message: 'Error fetching notifications' });
  }
});

// 7️⃣ Export router
module.exports = router;
