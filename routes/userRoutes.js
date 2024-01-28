const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const db = require("../db"); // Import the database connection pool
const authenticateToken = require("../middleware/authenticateToken"); // Import the authenticateToken middleware


const saltRounds = 10; // You can adjust this as per your security requirement

router.post("/add", /* authenticateToken ,*/ async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if user already exists
    const userExistsQuery = "SELECT * FROM users WHERE username = ?";
    db.query(userExistsQuery, [username], async (err, results) => {
      if (err) {
        console.error("Error executing MySQL query:", err);
        return res
          .status(500)
          .json({ message: "Internal Server Error", error: err.message });
      }

      if (results.length > 0) {
        // User already exists
        return res.status(400).json({ message: "Username already taken" });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Insert new user into the database
      const addUserQuery =
        "INSERT INTO users (username, password) VALUES (?, ?)";
      db.query(addUserQuery, [username, hashedPassword], (err, results) => {
        if (err) {
          console.error("Error executing MySQL query:", err);
          return res
            .status(500)
            .json({ message: "Internal Server Error", error: err.message });
        }

        res.status(201).json({ message: "User created successfully" });
      });
    });
  } catch (error) {
    console.error("Unhandled error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

router.get("/", authenticateToken, (req, res) => {
  // Modify your database query based on the language, if necessary
  const query = "SELECT * FROM users"; // Adjust the query based on 'lang'

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error executing MySQL query:", err);
      res.status(500).send("Internal Server Error");
    } else {
      // Optionally, process results based on the language
      res.json(results);
    }
  });
});

// DELETE route to remove a user
router.delete("/delete/:username", authenticateToken,(req, res) => {
  const username = req.params.username;

  // SQL query to delete a user
  const query = "DELETE FROM users WHERE username = ?";

  db.query(query, [username], (err, results) => {
    if (err) {
      console.error("Error executing MySQL query:", err);
      return res
        .status(500)
        .json({ message: "Internal Server Error", error: err.message });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  });
});

module.exports = router;

module.exports = router;
