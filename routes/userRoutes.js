const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const db = require('../db') // Import the database connection pool
const authenticateToken = require('../middleware/authenticateToken') // Import the authenticateToken middleware
const isAdmin = require('../middleware/isAdmin') // Import the isAdmin middleware

const saltRounds = 10 // You can adjust this as per your security requirement

router.post('/add', authenticateToken, isAdmin, async (req, res) => {
  const { username, password, type } = req.body

  try {
    // Check if user already exists
    const [userExistsResults] = await db.query(
      'SELECT * FROM users WHERE username = ?',
      [username],
    )

    if (userExistsResults.length > 0) {
      // User already exists
      return res.status(400).json({ message: 'Username already taken' })
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Set expiration date if type is not admin
    let expirationDate = null
    if (type !== 'admin') {
      let currentDate = new Date()
      expirationDate = new Date(
        currentDate.setMonth(currentDate.getMonth() + 2),
      )
    }

    // Insert new user into the database
    const [addUserResults] = await db.query(
      'INSERT INTO users (username, password, type, expiration_date) VALUES (?, ?, ?, ?)',
      [username, hashedPassword, type, expirationDate],
    )

    res.status(201).json({
      message: 'User created successfully',
      id: addUserResults.insertId,
    })
  } catch (error) {
    console.error('Unhandled error:', error)
    res
      .status(500)
      .json({ message: 'Internal server error', error: error.message })
  }
})

router.get('/', authenticateToken, isAdmin, async (req, res) => {
  try {
    const sql = `
      SELECT 
        users.user_id, 
        users.username, 
        users.type, 
        users.expiration_date as expiration_date_from_users, 
        users.createdAt as createdAt_from_users,
        users.updatedAt as updatedAt_from_users,
        expiringlinks.link_id, 
        expiringlinks.user_id as user_id_from_expiringlinks,
        expiringlinks.link, 
        expiringlinks.expiration_date as expiration_from_expiringlinks,
        expiringlinks.createdAt as createdAt_from_expiringlinks,
        expiringlinks.updatedAt as updatedAt_from_expiringlinks
      FROM 
        users 
      LEFT JOIN 
        expiringlinks 
      ON 
        users.user_id = expiringlinks.user_id
        ORDER BY 
        users.createdAt DESC
    `
    const [results] = await db.query(sql, [])
    res.json(results)
  } catch (err) {
    console.error('Error executing MySQL query:', err)
    res
      .status(500)
      .json({ message: 'Internal Server Error', error: err.message })
  }
})

// DELETE route to remove a user
router.delete(
  '/delete/:userId',
  authenticateToken,
  isAdmin,
  async (req, res) => {
    const userId = req.params.userId
    let connection
    let userDeleteResult // Declare userDeleteResult here

    try {
      connection = await db.getConnection()
      await connection.beginTransaction()

      // Delete UserSessions
      try {
        await connection.query('DELETE FROM UserSessions WHERE user_id = ?', [
          userId,
        ])
      } catch (error) {
        console.error('Error deleting UserSessions:', error)
      }

      // Delete ExpiringLinks
      try {
        await connection.query('DELETE FROM ExpiringLinks WHERE user_id = ?', [
          userId,
        ])
      } catch (error) {
        console.error('Error deleting ExpiringLinks:', error)
      }

      // Delete headerTexts
      try {
        await connection.query('DELETE FROM headerText WHERE user_id = ?', [
          userId,
        ])
      } catch (error) {
        console.error('Error deleting headerText:', error)
      }

      try {
        // last delete user
        ;[userDeleteResult] = await connection.query(
          // Assign the result to userDeleteResult here
          'DELETE FROM users WHERE user_id = ?',
          [userId],
        )
      } catch (error) {
        console.error('Error deleting user:', error)
        return res
          .status(500)
          .json({ message: 'Error deleting user', error: error.message })
      }

      if (userDeleteResult.affectedRows === 0) {
        await connection.rollback() // Rollback the transaction if no user was found
        return res.status(404).json({ message: 'User not found' })
      }

      await connection.commit() // Commit the transaction if everything is fine
      res.json({ message: 'User deleted successfully' })
    } catch (error) {
      console.error('Error executing MySQL query:', error)
      if (connection) {
        await connection.rollback() // Rollback the transaction in case of any error
      }
      return res
        .status(500)
        .json({ message: 'Internal Server Error', error: error.message })
    } finally {
      if (connection) {
        await connection.release() // Release the connection in the finally block to ensure it's always executed
      }
    }
  },
)

module.exports = router
