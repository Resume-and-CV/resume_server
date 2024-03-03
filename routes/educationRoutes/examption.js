const express = require('express')
const router = express.Router()
const db = require('../../db') // Adjust the path accordingly
const authenticateToken = require('../../middleware/authenticateToken') // Import the authenticateToken middleware

//get exemptions by course_id
const getExemptionsByCourseId = async (req, res) => {
  const course_id = req.query.course_id // Extract course_id from URL parameters

  try {
    // Modify your database query based on the course_id
    const [results] = await db.query(
      'SELECT * FROM exemptions WHERE course_id = ?',
      [course_id],
    )

    // Check if results is empty
    if (results.length === 0) {
      return res.status(200).json([]) // Return an empty array with a 200 status code
    }

    // Process and respond with results based on the language
    res.json(results)
  } catch (err) {
    console.error('Error executing MySQL query:', err)
    res
      .status(500)
      .json({ message: 'Internal Server Error', error: err.message })
  }
}

// Post a new exemption
const addExemptionToCourseId = async (req, res) => {
  const {
    course_id,
    original_institution,
    original_course_name,
    original_credits,
    completion_date,
    type,
    language,
  } = req.body

  try {
    const [results] = await db.query(
      'INSERT INTO exemptions (course_id, original_institution, original_course_name, original_credits, completion_date, type, language) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        course_id,
        original_institution,
        original_course_name,
        original_credits,
        completion_date,
        type,
        language,
      ],
    )

    // Respond with the id of the newly created exemption
    res.json({ id: results.insertId })
  } catch (err) {
    console.error('Error executing MySQL query:', err)
    res
      .status(500)
      .json({ message: 'Internal Server Error', error: err.message })
  }
}

// Update an exemption
const updateExemptionById = async (req, res) => {
  const {
    exemption_id,
    course_id,
    original_institution,
    original_course_name,
    original_credits,
    completion_date,
    type,
    language,
  } = req.body

  try {
    const [results] = await db.query(
      'UPDATE exemptions SET course_id = ?, original_institution = ?, original_course_name = ?, original_credits = ?, completion_date = ?, type = ?, language = ? WHERE exemption_id = ?',
      [
        course_id,
        original_institution,
        original_course_name,
        original_credits,
        completion_date,
        type,
        language,
        exemption_id,
      ],
    )

    // Check if any rows were updated
    if (results.affectedRows === 0) {
      return res.status(404).json({
        message: 'No exemption found with the provided id',
      })
    }

    // Respond with a success message
    res.json({ message: 'Exemption updated successfully' })
  } catch (err) {
    console.error('Error executing MySQL query:', err)
    res
      .status(500)
      .json({ message: 'Internal Server Error', error: err.message })
  }
}

// Delete an exemption by id
const deleteExemptionById = async (req, res) => {
  const id = req.params.id

  try {
    const [result] = await db.query(
      'DELETE FROM exemptions WHERE exemption_id = ?',
      [id],
    )

    // Check if any rows were deleted
    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: 'No exemptions found with the provided exemption_id',
      })
    }

    // Respond with a success message
    res.json({ message: 'Education deleted successfully' })
  } catch (err) {
    console.error('Error executing MySQL query:', err)
    res
      .status(500)
      .json({ message: 'Internal Server Error', error: err.message })
  }
}

// Exemption routes
router.get('/', authenticateToken, getExemptionsByCourseId)
router.post('/add', authenticateToken, addExemptionToCourseId)
router.put('/update', authenticateToken, updateExemptionById)
router.delete('/delete/:id', authenticateToken, deleteExemptionById)

module.exports = router
