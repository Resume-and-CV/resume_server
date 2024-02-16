// educationRoutes.js
const express = require('express')
const router = express.Router()
const db = require('../db') // Adjust the path accordingly
const authenticateToken = require('../middleware/authenticateToken') // Import the authenticateToken middleware

// get education
router.get('/lang', authenticateToken, async (req, res) => {
  const lang = req.headers['accept-language'] // Extract language from header

  try {
    // Modify your database query based on the language, if necessary
    const [results] = await db.query(
      'SELECT * FROM education WHERE language = ?',
      [lang],
    )

    // Process and respond with results based on the language
    res.json(results)
  } catch (err) {
    console.error('Error executing MySQL query:', err)
    res
      .status(500)
      .json({ message: 'Internal Server Error', error: err.message })
  }
})

//get courses by education_id
router.get('/courses/:education_id', authenticateToken, async (req, res) => {
  const lang = req.headers['accept-language'] // Extract language from header
  const education_id = req.params.education_id // Extract education_id from URL parameters

  try {
    // Modify your database query based on the education_id
    const [results] = await db.query(
      'SELECT * FROM courses WHERE education_id = ?',
      [education_id],
    )

    // Process and respond with results based on the language and education_id
    res.json(results)
  } catch (err) {
    console.error('Error executing MySQL query:', err)
    res
      .status(500)
      .json({ message: 'Internal Server Error', error: err.message })
  }
})

//get exemptions by course_id
router.get('/exemptions/:course_id', authenticateToken, async (req, res) => {
  const lang = req.headers['accept-language'] // Extract language from header
  const course_id = req.params.course_id // Extract course_id from URL parameters

  try {
    // Modify your database query based on the course_id
    const [results] = await db.query(
      'SELECT * FROM exemptions WHERE course_id = ?',
      [course_id],
    )

    // Process and respond with results based on the language and course_id
    res.json(results)
  } catch (err) {
    console.error('Error executing MySQL query:', err)
    res
      .status(500)
      .json({ message: 'Internal Server Error', error: err.message })
  }
})

module.exports = router
