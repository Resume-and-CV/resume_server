const express = require("express");
const router = express.Router();
const jwt = require('jsonwebtoken'); // Import the jsonwebtoken library for token generation

// Define your JWT secret key
const JWT_SECRET = 'your_jwt_secret'; // This should be kept secure and private

// Sample user data (in a real application, replace this with database access)
const users = [
  { id: 1, username: 'user1', password: 'pass1' },
  { id: 2, username: 'user2', password: 'pass2' }
];

// POST endpoint for user login
router.post('/', (req, res) => {
  // Extract username and password from request body
  const { username, password } = req.body;

  // Log the login attempt (consider logging this only for debugging purposes)
  console.log(`Received login request for username: ${username}`);
  
  // Find user by username and password
  // In a real application, replace this with a database query
  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
    // Generate a JWT token if credentials are valid
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '2h' });
    
    // Log successful authentication
    console.log(`User ${username} logged in successfully`);

    // Send the generated token as response
    return res.json({ message: "Logged in successfully!", token });
  } else {
    // Log failed authentication attempt
    console.log(`Authentication failed for username: ${username}`);

    // Respond with an error message if credentials are invalid
    return res.status(400).json({ message: "Invalid credentials!" });
  }
});

// Export the router for use in other parts of the application
module.exports = router;
