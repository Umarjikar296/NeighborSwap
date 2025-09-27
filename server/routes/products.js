const express = require('express');
const router = express.Router();

// GET /api/products
router.get('/', async (req, res) => {
  try {
    // For now, return empty array (you can add real products later)
    res.json({
      success: true,
      products: [],
      message: 'No products yet'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching products'
    });
  }
});

module.exports = router;