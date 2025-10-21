const express = require('express');
const app = express();
const PORT = 5000;

app.get('/api/test', (req, res) => {
  res.json({ message: 'Test server working!' });
});

console.log('🚀 Attempting to start server on port 5000...');

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server SUCCESSFULLY started on http://localhost:${PORT}`);
}).on('error', (err) => {
  console.log('❌ Server FAILED to start:', err.message);
});

// Keep process alive
process.stdin.resume();