const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const db = require("../db"); // Import the database connection pool
const authenticateToken = require("../middleware/authenticateToken"); // Import the authenticateToken middleware

const saltRounds = 10; // You can adjust this as per your security requirement

router.post("/add", authenticateToken, async (req, res) => {
  const { username, password, type } = req.body;

  try {
    // Check if user already exists
    const [userExistsResults] = await db.query(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );

    if (userExistsResults.length > 0) {
      // User already exists
      return res.status(400).json({ message: "Username already taken" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Set expiration date if type is not admin
    let expirationDate = null;
    if (type !== "admin") {
      let currentDate = new Date();
      expirationDate = new Date(
        currentDate.setMonth(currentDate.getMonth() + 2)
      );
    }

    // Insert new user into the database
    const [addUserResults] = await db.query(
      "INSERT INTO users (username, password, type, expiration_date) VALUES (?, ?, ?, ?)",
      [username, hashedPassword, type, expirationDate]
    );

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Unhandled error:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

router.get("/", authenticateToken, async (req, res) => {
  try {
    const [results] = await db.query("SELECT * FROM users");
    // Optionally, process results based on the language or other criteria
    res.json(results);
  } catch (err) {
    console.error("Error executing MySQL query:", err);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: err.message });
  }
});

// DELETE route to remove a user
router.delete("/delete/:username", authenticateToken, async (req, res) => {
  const username = req.params.username;
  let connection; // Declare connection outside to ensure it's accessible in both try and catch blocks

  try {
    connection = await db.getConnection(); // Get a connection from the pool
    await connection.beginTransaction(); // Start a transaction

    // Delete UserSessions first
    await connection.query(
      "DELETE FROM UserSessions WHERE user_id = (SELECT user_id FROM users WHERE username = ?)",
      [username]
    );
    // Then delete ExpiringLinks
    await connection.query(
      "DELETE FROM ExpiringLinks WHERE user_id = (SELECT user_id FROM users WHERE username = ?)",
      [username]
    );

    // Delete headerTexts
    await connection.query(
      "DELETE FROM headerText WHERE user_id = (SELECT user_id FROM users WHERE username = ?)",
      [username]
    );
    // last delete user
    const [userDeleteResult] = await connection.query(
      "DELETE FROM users WHERE username = ?",
      [username]
    );

    if (userDeleteResult.affectedRows === 0) {
      await connection.rollback(); // Rollback the transaction if no user was found
      return res.status(404).json({ message: "User not found" });
    }

    await connection.commit(); // Commit the transaction if everything is fine
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error executing MySQL query:", error);
    if (connection) {
      await connection.rollback(); // Rollback the transaction in case of any error
    }
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  } finally {
    if (connection) {
      await connection.release(); // Release the connection in the finally block to ensure it's always executed
    }
  }
});

module.exports = router;
