const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Add error handling early
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
});

// ✅ FIXED: Middleware - Remove duplicates
app.use(cors());

// ✅ FIXED: Stripe webhook needs raw body - PLACE THIS BEFORE JSON MIDDLEWARE
app.use('/api/payments/stripe/webhook', express.raw({type: 'application/json'}));

// Regular JSON middleware for other routes
app.use(express.json());

// Database connection
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
    console.log('⚠️  Server continuing without database connection');
  } else {
    console.log('✅ Connected to MySQL Database');
  }
});

// Routes - with error handling
const routes = [
  { path: '/api/products', file: './routes/productRoutes' },
  { path: '/api/users', file: './routes/userRoutes' },
  { path: '/api/orders', file: './routes/orderRoutes' },
  { path: '/api/cart', file: './routes/cartRoutes' },
  { path: '/api/recommendations', file: './routes/recommendationRoutes' },
  { path: '/api/payments', file: './routes/paymentRoutes' },
  { path: '/api/reviews', file: './routes/reviewRoutes' },
  { path: '/api/promo', file: './routes/promoRoutes' },
  { path: '/api/email', file: './routes/emailRoutes' }
];

routes.forEach(route => {
  try {
    app.use(route.path, require(route.file));
    console.log(`✅ ${route.path} routes loaded`);
  } catch (err) {
    console.error(`❌ ${route.path} routes failed:`, err.message);
  }
});

// Basic routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Nexus Store API is running!',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    database: db && db.state === 'connected' ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ✅ FIXED: Serve static files from React build (for production)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  });
}

// Start server
console.log('🚀 Starting server...');
const server = app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`💳 Payment Methods: Stripe, Khalti, eSewa, COD`);
  console.log(`🔔 Stripe Webhook: ${process.env.BACKEND_URL || 'http://localhost:5000'}/api/payments/stripe/webhook`);
});

// Global error handlers
process.on('uncaughtException', (error) => {
  console.error('❌ UNCAUGHT EXCEPTION! Shutting down...');
  console.error(error.name, error.message);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error('❌ UNHANDLED REJECTION! Shutting down...');
  console.error(error.name, error.message);
  server.close(() => {
    process.exit(1);
  });
});

// Keep the process alive
server.keepAliveTimeout = 120000;