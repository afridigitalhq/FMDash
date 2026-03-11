require('dotenv').config();  // Loads environment variables

module.exports = (req, res, next) => {
  const key = req.headers['x-api-key'];  // must match header sent
  if (key && key === process.env.API_KEY) {
    next();
  } else {
    res.status(401).json({ message: 'Unauthorized: Invalid API key' });
  }
};
