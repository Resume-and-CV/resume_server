// contactInfoRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../db'); // Adjust the path accordingly

// Route handling
router.get('/', (req, res) => {
  // Sample query to retrieve data from a table
  db.query('SELECT * FROM contactInfo', (err, results) => {
    if (err) {
      console.error('Error executing MySQL query:', err);
      res.status(500).send('Internal Server Error');
    } else {
      res.json(results);
    }
  });
});

module.exports = router;
