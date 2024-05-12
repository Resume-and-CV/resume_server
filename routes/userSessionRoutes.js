// personalInfo.js
const express = require('express')
const router = express.Router()
const db = require('../db') // Adjust the path accordingly
const authenticateToken = require('../middleware/authenticateToken') // Import the authenticateToken middleware
const isAdmin = require('../middleware/isAdmin') // Import the isAdmin middleware
const { route } = require('./loginRoutes')
const convertTimezone = require('../middleware/convertTimezone') // Import the timezoneConversion middleware

// Define the GET route function
const getAllUserSessions = async (req, res, next) => {
  try {
    const [results] = await db.query(
      'SELECT usersessions.*, users.username FROM usersessions JOIN users ON usersessions.user_id = users.user_id ORDER BY session_start DESC',
    )

    res.locals.results = results
    next()
  } catch (err) {
    console.error('Error executing MySQL query:', err)
    res
      .status(500)
      .json({ message: 'Internal Server Error', error: err.message })
  }
}

const getUserSession = async (req, res, next) => {
  const user_id = req.params.user_id
  try {
    const [results] = await db.query(
      'SELECT usersessions.*, users.username FROM usersessions JOIN users ON usersessions.user_id = users.user_id WHERE usersessions.user_id = ? ORDER BY session_start DESC',
      [user_id],
    )
    if (results.length === 0) {
      return res.status(404).json({ message: 'Usersessions not found' })
    }

    res.locals.results = results
    next()
  } catch (err) {
    console.error('Error executing MySQL query:', err)
    res
      .status(500)
      .json({ message: 'Internal Server Error', error: err.message })
  }
}

// Define the DELETE route function
const deleteUserSessionById = async (req, res) => {
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

const deleteUserSessionBySessionId = async (req, res) => {
  const session_id = req.params.session_id
  let connection

  try {
    connection = await db.getConnection()
    await connection.beginTransaction()

    const [sessionDeleteResult] = await connection.query(
      'DELETE FROM UserSessions WHERE session_id = ?',
      [session_id],
    )

    if (sessionDeleteResult.affectedRows === 0) {
      await connection.rollback()
      return res.status(404).json({ message: 'Session not found' })
    }

    await connection.commit()
    res.json({ message: 'Session deleted successfully' })
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
router.get(
  '/get/all',
  authenticateToken,
  isAdmin,
  getAllUserSessions,
  convertTimezone,
)
router.get(
  '/get/:user_id',
  authenticateToken,
  isAdmin,
  getUserSession,
  convertTimezone,
)

// Use the function in your route
router.delete(
  '/delete/sessionid/:session_id',
  authenticateToken,
  isAdmin,
  deleteUserSessionBySessionId,
)

router.delete('/delete/all', authenticateToken, isAdmin, deleteAllUserSessions)
router.delete(
  '/delete/userid/:user_id',
  authenticateToken,
  isAdmin,
  deleteUserSessionById,
)

module.exports = router
