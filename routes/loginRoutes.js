const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const db = require("../db"); // Ensure db is set up for mysql2/promise

const JWT_SECRET = process.env.JWT_SECRET; // Ensure this is securely set

router.post("/", async (req, res) => {
  const username = req.body.username.trim();
  const password = req.body.password.trim();

  try {
    // SQL query to find user by username using async/await
    const [results] = await db.query("SELECT * FROM users WHERE username = ?", [
      username,
    ]);

    if (results.length === 0) {
      // User not found, return generic error message for security
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const user = results[0];

    // Compare the provided password with the hashed password in the database using async/await
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      // Password does not match, return generic error message
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Credentials are valid, generate a JWT token
    const token = jwt.sign(
      { id: user.user_id, username: user.username },
      JWT_SECRET,
      { expiresIn: "2h" }
    );

    // Insert a session record into the database
    const session_start = new Date();
    const expiration_time = new Date(
      session_start.getTime() + 2 * 60 * 60 * 1000
    ); // 2 hours from now

    await db.query(
      "INSERT INTO UserSessions (user_id, session_start, session_end, expiration_time, ip_address, user_agent, session_data) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        user.user_id,
        session_start,
        null, // session_end is null initially
        expiration_time,
        req.ip, // IP address of the user
        req.headers["user-agent"], // User agent of the user's device
        null, // session_data can be null or specific data you wish to store
      ]
    );

    // Respond with success message and JWT token
    return res.json({ message: "Logged in successfully!", token });
  } catch (error) {
    console.error("Error during login process:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

module.exports = router;
