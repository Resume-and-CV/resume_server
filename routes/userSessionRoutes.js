// personalInfo.js
const express = require('express')
const router = express.Router()
const db = require('../db') // Adjust the path accordingly
const authenticateToken = require('../middleware/authenticateToken') // Import the authenticateToken middleware
const { route } = require('./loginRoutes')

// Route handling
router.get('/get', authenticateToken, async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM usersessions')
    // Optionally, process results based on the language or other criteria
    res.json(results)
  } catch (err) {
    console.error('Error executing MySQL query:', err)
    res
      .status(500)
      .json({ message: 'Internal Server Error', error: err.message })
  }
})

// DELETE route to remove a user
router.delete('/delete/:user_id', authenticateToken, async (req, res) => {
  const user_id = req.params.user_id
  let connection // Declare connection outside to ensure it's accessible in both try and catch blocks

  try {
    connection = await db.getConnection() // Get a connection from the pool
    await connection.beginTransaction() // Start a transaction

    // last delete user
    const [userDeleteResult] = await connection.query(
      'DELETE FROM UserSessions WHERE user_id = ?',
      [user_id],
    )

    if (userDeleteResult.affectedRows === 0) {
      await connection.rollback() // Rollback the transaction if no user was found
      return res.status(404).json({ message: 'Usersessions not found' })
    }

    await connection.commit() // Commit the transaction if everything is fine
    res.json({ message: 'Usersessions deleted successfully' })
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
})

module.exports = router
