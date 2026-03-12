const express = require('express');
const path = require('path');
const app = express();

// Serve static files from client folder (CSS, JS, images)
app.use(express.static(path.join(__dirname, 'client')));

// Serve index.html at root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'index.html'));
});

// Example route for scan results (optional)
app.get('/api/scan-results', (req, res) => {
  // Example static data; you can replace with real scans
  res.json([
    { target: '192.168.0.1', vulnerability: 'SQL Injection', severity: 'High', timestamp: '2026-03-12 09:00' },
    { target: '10.0.0.5', vulnerability: 'XSS', severity: 'Medium', timestamp: '2026-03-12 09:05' }
  ]);
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
