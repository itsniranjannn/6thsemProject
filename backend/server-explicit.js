const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0'; // Bind to all network interfaces

console.log('🚀 Starting server with explicit binding...');

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
    console.error('Database connection failed:', err.message);
  } else {
    console.log('✅ Connected to MySQL Database');
  }
});

// Simple test route
app.get('/api/test', (req, res) => {
  console.log('📨 Test endpoint hit');
  res.json({ 
    message: 'Server with explicit binding is working!',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/products', (req, res) => {
  db.query('SELECT * FROM products', (err, results) => {
    if (err) {
      return res.json([
        { id: 1, name: "Sample Product 1", price: 99.99 },
        { id: 2, name: "Sample Product 2", price: 29.99 }
      ]);
    }
    res.json(results);
  });
});

// Start server on ALL interfaces
console.log(`🌐 Binding to ${HOST}:${PORT}...`);
app.listen(PORT, HOST, () => {
  console.log(`🎉 SERVER RUNNING ON:`);
  console.log(`   http://localhost:${PORT}`);
  console.log(`   http://127.0.0.1:${PORT}`);
  console.log(`   http://0.0.0.0:${PORT}`);
  console.log(`📋 Test: http://localhost:${PORT}/api/test`);
});

// Verify binding
setTimeout(() => {
  console.log('🔍 Checking server status...');
  const net = require('net');
  const client = new net.Socket();
  
  client.connect(PORT, 'localhost', () => {
    console.log('✅ Server is accepting connections on localhost');
    client.destroy();
  });
  
  client.on('error', (err) => {
    console.log('❌ Server not accepting connections on localhost:', err.message);
  });
}, 1000);