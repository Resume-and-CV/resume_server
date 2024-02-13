const db = require('../db') // Ensure db is set up for mysql2/promise

// Middleware for adding a user session
const addUserSession = async (req, res, next) => {
  const user = req.user

  // If the user is an admin, don't record the session
  if (user.type === 'admin') {
    next()
    return
  }

  const session_start = new Date()
  const expiration_time = new Date(session_start.getTime() + 2 * 60 * 60 * 1000) // 2 hours from now

  try {
    await db.query(
      'INSERT INTO UserSessions (user_id, session_start, session_end, expiration_time, ip_address, user_agent, session_data) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        user.user_id,
        session_start,
        null, // session_end is null initially
        expiration_time,
        req.ip, // IP address of the user
        req.headers['user-agent'], // User agent of the user's device
        null, // session_data can be null or specific data you wish to store
      ],
    )
    next()
  } catch (error) {
    console.error('Error during session creation:', error)
    return res
      .status(500)
      .json({ message: 'Internal server error', error: error.message })
  }
}

module.exports = addUserSession // Export the middleware function
