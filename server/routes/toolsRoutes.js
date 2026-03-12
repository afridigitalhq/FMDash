const express = require('express');
const router = express.Router();

// Add /admin/add-scan route
router.post('/admin/add-scan', (req, res) => {
  res.json({
    status: 'success',
    message: 'Scan added',
    data: req.body
  });
});

module.exports = router;
