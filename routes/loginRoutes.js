const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const db = require('../db') // Ensure db is set up for mysql2/promise
const addUserSession = require('../middleware/userSessionMiddlewares') // Import the addUserSession middleware
const generateToken = require('../middleware/generateToken') // Import the generateToken middleware

const JWT_SECRET = process.env.JWT_SECRET // Ensure this is securely set

router.post(
  '/',
  async (req, res, next) => {
    const username = req.body.username.trim()
    const password = req.body.password.trim()

    try {
      // SQL query to find user by username using async/await
      const [results] = await db.query(
        'SELECT * FROM users WHERE username = ?',
        [username],
      )
      if (results.length === 0) {
        // User not found, return generic error message for security
        return res.status(400).json({ message: 'Invalid credentials' })
      }

      const user = results[0]

      // Check if the account is expired
      if (user.expiration_date && new Date(user.expiration_date) < new Date()) {
        return res.status(403).json({ message: 'Account is expired' })
      }

      // Compare the provided password with the hashed password in the database using async/await
      const passwordMatch = await bcrypt.compare(password, user.password)

      if (!passwordMatch) {
        // Password does not match, return generic error message
        return res.status(400).json({ message: 'Invalid credentials' })
      }

      req.user = user // Assign the user data to req.user

      next()
    } catch (error) {
      console.error('Error during login process:', error)
      return res
        .status(500)
        .json({ message: 'Internal server error', error: error.message })
    }
  },
  generateToken,
  addUserSession,
  (req, res) => {
    // Respond with success message and JWT token
    return res.json({ message: 'Logged in successfully!', token: req.token })
  },
)

router.post(
  '/login-with-link',
  async (req, res, next) => {
    const { token } = req.body // Extract token from the request body

    if (!token) {
      return res.status(400).send('Token is required')
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET)

      // Check if the token is expired or already used if implementing one-time-use logic
      // For the sake of simplicity, this check is omitted here

      // Find the user associated with this token. Assuming `employerId` or similar identifier is stored in the token
      const [user] = await db.query('SELECT * FROM users WHERE user_id = ?', [
        decoded.employerId,
      ])

      if (user.length === 0) {
        return res.status(404).send('User not found')
      }

      req.user = user[0] // Assign the user data to req.user

      next()
    } catch (error) {
      // Handle errors, e.g., token expiration or verification failure
      console.error('Login with link error:', error)
      return res.status(401).send('Invalid or expired link')
    }
  },
  generateToken,
  addUserSession,
  (req, res) => {
    // Respond with success message and JWT token
    return res.json({
      message: 'Logged in successfully!',
      token: req.token,
    })
  },
)

module.exports = router
