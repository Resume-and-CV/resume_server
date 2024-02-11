const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const db = require("../db"); // Import the database connection pool

const JWT_SECRET = process.env.JWT_SECRET; // Secret key for JWT, should be kept secure

router.post("/", (req, res) => {
  // remove empty spaces from username and password
  const username = req.body.username.trim();
  const password = req.body.password.trim();

  // SQL query to find user by username
  const query = "SELECT * FROM users WHERE username = ?";
  db.query(query, [username], (err, results) => {
    // Error handling for the database query
    if (err) {
      console.error("Error executing MySQL query:", err);
      return res
        .status(500)
        .json({ message: "Internal Server Error", error: err.message });
    }

    // Check if the user exists
    if (results.length === 0) {
      // User not found, return generic error message for security
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const user = results[0];

    // Compare the provided password with the hashed password in the database
    bcrypt.compare(password, user.password, (err, passwordMatch) => {
      // Error handling for bcrypt password comparison
      if (err) {
        console.error("Error during password comparison:", err);
        return res
          .status(500)
          .json({ message: "Internal server error", error: err.message });
      }

      if (passwordMatch) {
        // Credentials are valid, generate a JWT token
        const token = jwt.sign(
          { id: user.user_id, username: user.username },
          JWT_SECRET,
          { expiresIn: "2h" }
        );

        // Insert a session record into the database
        const session_start = new Date();
        const sessionQuery =
          "INSERT INTO UserSessions (user_id, session_start, session_end, expiration_time, ip_address, user_agent, session_data) VALUES (?, ?, ?, ?, ?, ?, ?)";
        const ip_address = req.ip; // IP address of the user
        const user_agent = req.headers["user-agent"]; // User agent of the user's device
        const session_end = null;
        const expiration_time = new Date(
          session_start.getTime() + 2 * 60 * 60 * 1000
        );
        const session_data = null;

        db.query(
          sessionQuery,
          [
            user.user_id,
            session_start,
            session_end,
            expiration_time,
            ip_address,
            user_agent,
            session_data,
          ],
          (sessionErr, sessionResults) => {
            // Error handling for session record insertion
            if (sessionErr) {
              console.error("Error recording session:", sessionErr);
              // Decide to log the error and still respond with success or send a 500 response
              return res
                .status(500)
                .json({ message: "Error recording session" });
            }

            // Respond with success message and JWT token
            return res.json({ message: "Logged in successfully!", token });
          }
        );
      } else {
        // Password does not match, return generic error message
        return res.status(400).json({ message: "Invalid credentials" });
      }
    });
  });
});

module.exports = router;
