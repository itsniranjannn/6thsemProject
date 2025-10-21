const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
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

// Middleware
app.use(cors());
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
    // Don't return - let server continue without database
    console.log('⚠️  Server continuing without database connection');
  } else {
    console.log('✅ Connected to MySQL Database');
  }
});

// Routes - with error handling
try {
  app.use('/api/products', require('./routes/productRoutes'));
  console.log('✅ Products routes loaded');
} catch (err) {
  console.error('❌ Products routes failed:', err.message);
}

try {
  app.use('/api/users', require('./routes/userRoutes'));
  console.log('✅ Users routes loaded');
} catch (err) {
  console.error('❌ Users routes failed:', err.message);
}

try {
  app.use('/api/orders', require('./routes/orderRoutes'));
  console.log('✅ Orders routes loaded');
} catch (err) {
  console.error('❌ Orders routes failed:', err.message);
}

try {
  app.use('/api/cart', require('./routes/cartRoutes'));
  console.log('✅ Cart routes loaded');
} catch (err) {
  console.error('❌ Cart routes failed:', err.message);
}

try {
  app.use('/api/recommendations', require('./routes/recommendationRoutes'));
  console.log('✅ Recommendations routes loaded');
} catch (err) {
  console.error('❌ Recommendations routes failed:', err.message);
}

// Basic routes
app.get('/', (req, res) => {
  res.json({ message: '6thShop API is running!' });
});

app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API is working!',
    database: db && db.state === 'connected' ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

const paymentRoutes = require('./routes/paymentRoutes');
app.use('/api/payments', paymentRoutes);

// Stripe webhook needs raw body
app.use('/api/payments/stripe/webhook', express.raw({type: 'application/json'}));

// Other middleware
app.use(express.json());
app.use(cors());

app.use('/api/reviews', require('./routes/reviewRoutes'));
// Start server
console.log('🚀 Starting server...');
const server = app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌐 Test: http://localhost:${PORT}/api/test`);
});
// Global error handler for uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ UNCAUGHT EXCEPTION! Shutting down...');
  console.error(error.name, error.message);
  process.exit(1);
});

// Global error handler for unhandled promise rejections
process.on('unhandledRejection', (error) => {
  console.error('❌ UNHANDLED REJECTION! Shutting down...');
  console.error(error.name, error.message);
  server.close(() => {
    process.exit(1);
  });
});

const promoRoutes = require('./routes/promoRoutes');
app.use('/api/promo', promoRoutes);

// Keep the process alive
server.keepAliveTimeout = 120000;