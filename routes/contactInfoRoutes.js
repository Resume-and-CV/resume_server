// contactInfoRoutes.js
const express = require("express");
const router = express.Router();
const db = require("../db"); // Adjust the path accordingly

// Route handling

//get all http://localhost:3000/contactinfo
router.get("/", (req, res) => {
  // Sample query to retrieve data from a table
  db.query("SELECT * FROM contactInfo", (err, results) => {
    if (err) {
      console.error("Error executing MySQL query:", err);
      res.status(500).send("Internal Server Error");
    } else {
      res.json(results);
    }
  });
});

router.get("/lang", (req, res) => {
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
