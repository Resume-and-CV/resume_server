// hobbiesinfo.js
const express = require("express");
const router = express.Router();
const db = require("../db"); // Adjust the path accordingly
const authenticateToken = require("../middleware/authenticateToken"); // Import the authenticateToken middleware

// Route handling
router.get("/lang", authenticateToken, async (req, res) => {
  const lang = req.headers["accept-language"]; // Extract language from header

  try {
    // Modify your database query based on the language, if necessary
    const [results] = await db.query("SELECT * FROM hobbies WHERE language = ?", [lang]);
    
    // Process and respond with results based on the language
    res.json(results);
  } catch (err) {
    console.error("Error executing MySQL query:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
});


module.exports = router;
