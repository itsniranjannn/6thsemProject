const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Track if server is running
let serverStarted = false;

console.log('=== STARTING SERVER WITH MONITORING ===');

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'smartshop'
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
    return;
  }
  console.log('Connected to MySQL Database');
});

// Routes
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/recommendations', require('./routes/recommendationRoutes'));

app.get('/api/test', (req, res) => {
  res.json({ message: 'Monitored server is working!' });
});

// Start server
const server = app.listen(PORT, () => {
  serverStarted = true;
  console.log(`🎉 SERVER SUCCESS: Running on http://localhost:${PORT}`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
});

// Monitor server status
setInterval(() => {
  if (serverStarted) {
    console.log(`💚 Server still running - ${new Date().toLocaleTimeString()}`);
  }
}, 2000);

// Handle various exit scenarios
process.on('exit', (code) => {
  console.log(`🔴 Process exiting with code: ${code}`);
});

process.on('SIGINT', () => {
  console.log('🔴 Received SIGINT (Ctrl+C)');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('🔴 Received SIGTERM');
  process.exit(0);
});

process.on('uncaughtException', (err) => {
  console.error('🔴 Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('🔴 Unhandled Rejection:', err);
  process.exit(1);
});

console.log('=== SERVER SETUP COMPLETE ===');