const express = require('express');
const router = express.Router();

// Middleware to enforce API key
router.use((req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== process.env['AfriDigital-FMDash-API-Key']) {
    return res.status(401).json({ status: 'error', message: 'API key missing or invalid' });
  }
  next();
});

// POST /admin/add-scan
router.post('/add-scan', (req, res) => {
  res.json({ status: 'success', message: 'Scan added', data: req.body });
});

module.exports = router;
