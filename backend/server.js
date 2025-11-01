// ======================
// SMARTSHOP BACKEND - server.js
// ======================

const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// ======================
// Global Error Handling (Early)
// ======================
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
});

// ======================
// Middleware Setup
// ======================
app.use(cors());

// Stripe Webhook — must come before JSON body parsing
app.use('/api/payments/stripe/webhook', express.raw({ type: 'application/json' }));

// Parse JSON for other routes
app.use(express.json());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ======================
// Database Connection
// ======================
console.log('🔌 Connecting to database...');
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'smartshop'
});

db.connect((err) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
    console.log('⚠️ Server continuing without database connection');
  } else {
    console.log('✅ Connected to MySQL Database');
  }
});

// ======================
// Load API Routes
// ======================
const routes = [
  { path: '/api/products', file: './routes/productRoutes' },
  { path: '/api/users', file: './routes/userRoutes' },
  { path: '/api/orders', file: './routes/orderRoutes' },
  { path: '/api/cart', file: './routes/cartRoutes' },
  { path: '/api/recommendations', file: './routes/recommendationRoutes' },
  { path: '/api/payments', file: './routes/paymentRoutes' },
  { path: '/api/reviews', file: './routes/reviewRoutes' },
  { path: '/api/promo', file: './routes/promoRoutes' },
  { path: '/api/email', file: './routes/emailRoutes' },
  { path: '/api/admin', file: './routes/adminRoutes' },
  { path: '/api/offers', file: './routes/offerRoutes' },
  { path: '/api/user-dashboard', file: './routes/userDashboardRoutes' },
];

routes.forEach((route) => {
  try {
    app.use(route.path, require(route.file));
    console.log(`✅ ${route.path} routes loaded`);
  } catch (err) {
    console.error(`❌ Failed to load ${route.path}:`, err.message);
  }
});

// ======================
// Health & Base Routes
// ======================
app.get('/', (req, res) => {
  res.json({
    message: '🛍️ SmartShop API is running successfully!',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    database: db && db.state === 'connected' ? 'connected' : 'disconnected',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// ======================
// Serve Frontend (Production)
// ======================
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));

  // ✅ Modern Express 5 fix — use RegExp instead of '*'
  app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'), (err) => {
      if (err) {
        console.error('⚠️ Error serving frontend build:', err);
        res.status(500).send('Frontend not found');
      } else {
        console.log(`📄 Served frontend route: ${req.originalUrl}`);
      }
    });
  });
}

// ======================
// Start Server
// ======================
console.log('🚀 Starting server...');
const server = app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`💳 Payment Methods: Stripe, Khalti, eSewa, COD`);
  console.log(`🔔 Stripe Webhook: ${process.env.BACKEND_URL || 'http://localhost:5000'}/api/payments/stripe/webhook`);
});

// ======================
// Global Shutdown Handlers
// ======================
process.on('uncaughtException', (error) => {
  console.error('❌ UNCAUGHT EXCEPTION! Shutting down...');
  console.error(error.name, error.message);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error('❌ UNHANDLED REJECTION! Shutting down...');
  console.error(error.name, error.message);
  server.close(() => process.exit(1));
});

// Extend keep-alive for some hosting providers
server.keepAliveTimeout = 120000;
