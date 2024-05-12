// personalInfo.js
const express = require('express')
const router = express.Router()
const db = require('../db') // Adjust the path accordingly
const authenticateToken = require('../middleware/authenticateToken') // Import the authenticateToken middleware
const isAdmin = require('../middleware/isAdmin') // Import the isAdmin middleware
const { route } = require('./loginRoutes')

// Define the GET route function
const getAllUserSessions = async (req, res) => {
  try {
    const [results] = await db.query(
      'SELECT usersessions.*, users.username FROM usersessions JOIN users ON usersessions.user_id = users.user_id',
    )
    res.json(results)
  } catch (err) {
    console.error('Error executing MySQL query:', err)
    res
      .status(500)
      .json({ message: 'Internal Server Error', error: err.message })
  }
}

const getUserSession = async (req, res) => {
  const user_id = req.params.user_id
  try {
    const [results] = await db.query(
      'SELECT usersessions.*, users.username FROM usersessions JOIN users ON usersessions.user_id = users.user_id WHERE usersessions.user_id = ?',
      [user_id],
    )
    if (results.length === 0) {
      return res.status(404).json({ message: 'Usersessions not found' })
    }
    res.json(results)
  } catch (err) {
    console.error('Error executing MySQL query:', err)
    res
      .status(500)
      .json({ message: 'Internal Server Error', error: err.message })
  }
}

// Define the DELETE route function
const deleteUserSession = async (req, res) => {
  const user_id = req.params.user_id
  let connection

  try {
    connection = await db.getConnection()
    await connection.beginTransaction()

    const [userDeleteResult] = await connection.query(
      'DELETE FROM UserSessions WHERE user_id = ?',
      [user_id],
    )

    if (userDeleteResult.affectedRows === 0) {
      await connection.rollback()
      return res.status(404).json({ message: 'Usersessions not found' })
    }

    await connection.commit()
    res.json({ message: 'Usersessions deleted successfully' })
  } catch (error) {
    console.error('Error executing MySQL query:', error)
    if (connection) {
      await connection.rollback()
    }
    return res
      .status(500)
      .json({ message: 'Internal Server Error', error: error.message })
  } finally {
    if (connection) {
      await connection.release()
    }
  }
}

const deleteAllUserSessions = async (req, res) => {
  let connection

  try {
    connection = await db.getConnection()
    await connection.beginTransaction()

    const [userDeleteResult] = await connection.query(
      'DELETE FROM UserSessions',
    )

    if (userDeleteResult.affectedRows === 0) {
      await connection.rollback()
      return res.status(404).json({ message: 'Usersessions not found' })
    }

    await connection.commit()
    res.json({ message: 'Usersessions deleted successfully' })
  } catch (error) {
    console.error('Error executing MySQL query:', error)
    if (connection) {
      await connection.rollback()
    }
    return res
      .status(500)
      .json({ message: 'Internal Server Error', error: error.message })
  } finally {
    if (connection) {
      await connection.release()
    }
  }
}

// Use the functions in your routes
router.get('/get/all', authenticateToken, isAdmin, getAllUserSessions)
router.get('/get/:user_id', authenticateToken, isAdmin, getUserSession)
router.delete('/delete/all', authenticateToken, isAdmin, deleteAllUserSessions)
router.delete('/delete/:user_id', authenticateToken, isAdmin, deleteUserSession)

module.exports = router
