const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const db = require("../db"); // Import the database connection pool

const JWT_SECRET = process.env.JWT_SECRET; // Secret key for JWT, should be kept secure

router.post("/", (req, res) => {
  const { username, password } = req.body;

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
          { id: user.id, username: user.username },
          JWT_SECRET,
          { expiresIn: "2h" }
        );

        // Insert a session record into the database
        const signInTimestamp = new Date();
        const sessionQuery =
          "INSERT INTO user_sessions (username, sign_in_timestamp, ip_address, user_agent) VALUES (?, ?, ?, ?)";
        const ip_address = req.ip; // IP address of the user
        const user_agent = req.headers["user-agent"]; // User agent of the user's device

        db.query(
          sessionQuery,
          [username, signInTimestamp, ip_address, user_agent],
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

//this is for user sessions logout but it doesnt do anything yet
/* router.post("/logout", (req, res) => {
  // Extract user ID or username from the JWT token
  // Assuming you have a middleware to validate the token and add the user info to `req.user`
  const { username } = req.user;

  // SQL query to update the logout timestamp in the user_sessions table
  const signOutTimestamp = new Date();
  const updateSessionQuery = "UPDATE user_sessions SET sign_out_timestamp = ?, session_duration = TIMESTAMPDIFF(SECOND, sign_in_timestamp, ?) WHERE username = ? AND sign_out_timestamp IS NULL";

  db.query(updateSessionQuery, [signOutTimestamp, signOutTimestamp, username], (err, results) => {
      if (err) {
          console.error("Error executing MySQL query:", err);
          return res.status(500).json({ message: "Internal Server Error", error: err.message });
      }

      if (results.affectedRows === 0) {
          // No active session found to log out
          return res.status(404).json({ message: "No active session found" });
      }

      // Successfully logged out
      res.json({ message: "Logged out successfully" });
  });
}); */


module.exports = router;
