const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

console.log('1. Setting up middleware...');
app.use(cors());
app.use(express.json());

console.log('2. Setting up database connection...');
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'smartshop'
});

console.log('3. Attempting database connection...');
db.connect((err) => {
  if (err) {
    console.error('❌ Database connection failed:', err);
    console.error('Full error:', err);
    return;
  }
  console.log('✅ Connected to MySQL Database');
});

console.log('4. Setting up routes...');
try {
  app.use('/api/products', require('./routes/productRoutes'));
  console.log('✅ products route loaded');
} catch (e) { console.log('❌ products route failed:', e.message) }

try {
  app.use('/api/users', require('./routes/userRoutes'));
  console.log('✅ users route loaded');
} catch (e) { console.log('❌ users route failed:', e.message) }

try {
  app.use('/api/orders', require('./routes/orderRoutes'));
  console.log('✅ orders route loaded');
} catch (e) { console.log('❌ orders route failed:', e.message) }

try {
  app.use('/api/cart', require('./routes/cartRoutes'));
  console.log('✅ cart route loaded');
} catch (e) { console.log('❌ cart route failed:', e.message) }

try {
  app.use('/api/recommendations', require('./routes/recommendationRoutes'));
  console.log('✅ recommendations route loaded');
} catch (e) { console.log('❌ recommendations route failed:', e.message) }

console.log('5. Setting up basic routes...');
app.get('/', (req, res) => {
  res.json({ message: 'Nexus Store API is running!' });
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'Debug server test endpoint' });
});

console.log('6. Starting server...');
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌐 Test URL: http://localhost:${PORT}/api/test`);
});

console.log('7. Server setup complete - process should continue running...');

// Keep the process alive and catch errors
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
});