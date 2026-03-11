require('dotenv').config();
const express = require('express');
const app = express();
const apiKeyMiddleware = require('./server/middleware/apiKeyMiddleware');
app.use(express.json());

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
