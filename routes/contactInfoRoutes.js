// contactInfoRoutes.js
const express = require("express");
const router = express.Router();
const db = require("../db"); // Adjust the path accordingly
const authenticateToken = require("../middleware/authenticateToken"); // Import the authenticateToken middleware

// Route handling
router.get("/lang", authenticateToken, (req, res) => {
  const lang = req.headers["accept-language"]; // Extract language from header
  //console.log("lang",lang)

  // Modify your database query based on the language, if necessary
  const query = "SELECT * FROM contactinfo WHERE language = ?"; // Adjust the query based on 'lang'

  db.query(query, [lang], (err, results) => {
    if (err) {
      console.error("Error executing MySQL query:", err);
      res.status(500).send("Internal Server Error");
    } else {
      // Optionally, process results based on the language
      res.json(results);
    }
  });
});

module.exports = router;
