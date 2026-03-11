const express = require('express');
const router = express.Router();
const apiKeyMiddleware = require('../middleware/apiKeyMiddleware');

const scans = [];

router.get('/test', apiKeyMiddleware, (req, res) => {
  res.json({ message: 'Admin route accessed successfully' });
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
    res.json({ message: 'Login successful' });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

router.post('/add-scan', apiKeyMiddleware, (req, res) => {
  const { target, vulnerability, severity, timestamp } = req.body;
  if (!target || !vulnerability || !severity || !timestamp) {
    return res.status(400).json({ message: 'Missing scan data' });
  }
  scans.push({ target, vulnerability, severity, timestamp });
  res.json({ message: 'Scan added successfully', scan: { target, vulnerability, severity, timestamp } });
});

router.get('/scans', apiKeyMiddleware, (req, res) => {
  res.json({ scans });
});

module.exports = router;
