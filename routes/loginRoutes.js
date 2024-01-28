const express = require('express');
const router = express.Router();
const jwt = require("jsonwebtoken");
const db = require("../db"); // Import the database connection pool

const JWT_SECRET = process.env.JWT_SECRET; // Secret key for JWT, should be kept secure

router.post("/", async (req, res) => {
  const { username, password } = req.body;

  try {
    // SQL query to find user by username
    const query = "SELECT * FROM users WHERE username = ?";
    db.query(query, [username], (err, results) => {
      if (err) {
        console.error("Error executing MySQL query:", err);
        return res
          .status(500)
          .json({ message: "Internal Server Error", error: err.message });
      }

      // Check if the user exists
      if (results.length === 0) {
        // Username does not exist
        return res.status(400).json({ message: "Invalid username" });
      }

      const user = results[0];
      if (user.password === password) {
        // Generate a JWT token if credentials are valid
        const token = jwt.sign(
          { id: user.id, username: user.username },
          JWT_SECRET,
          { expiresIn: "2h" }
        );
        return res.json({ message: "Logged in successfully!", token });
      } else {
        // Password is incorrect
        return res.status(400).json({ message: "Invalid password" });
      }
    });
  } catch (error) {
    console.error("Unhandled error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

module.exports = router;
