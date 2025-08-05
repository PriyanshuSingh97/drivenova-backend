const express = require('express');
const router = express.Router();

// You can add real routes later
router.get('/', (req, res) => {
  res.json({ message: 'Contact route working!' });
});

module.exports = router;
