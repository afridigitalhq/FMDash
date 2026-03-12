require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const apiKeyMiddleware = require('./server/middleware/apiKeyMiddleware');

app.use(express.json());

// Serve frontend files
app.use(express.static(path.join(__dirname, 'client')));

// Serve index.html for the root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'index.html'));
});

// Example admin route
app.get('/admin/test', apiKeyMiddleware, (req, res) => {
  res.json({ message: 'Admin route accessed successfully' });
});

// Admin login route
app.post('/admin/login', (req, res) => {
  const { username, password } = req.body;
  if(username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
    res.json({ message: 'Login successful' });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log('Server running on port', PORT));
const adminRoutes = require('./server/routes/toolsRoutes');app.use('/admin', adminRoutes);
