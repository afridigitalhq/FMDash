require('dotenv').config();  // Load environment variables

module.exports = (req, res, next) => {
  const key = req.headers['x-api-key'] || req.headers['X-API-KEY'];

  if (!key) {
    return res.status(401).json({ message: 'API key missing' });
  }

  if (key.trim() !== process.env.API_KEY) {
    return res.status(401).json({ message: 'Unauthorized: Invalid API key' });
  }

  next();
};
