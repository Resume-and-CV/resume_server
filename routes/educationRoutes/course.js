// educationRoutes.js
const express = require('express')
const router = express.Router()
const db = require('../../db') // Adjust the path accordingly
const authenticateToken = require('../../middleware/authenticateToken') // Import the authenticateToken middleware

//get courses by education_id
const getCoursesByEducationId = async (req, res) => {
  const education_id = req.query.education_id // Extract education_id from query parameters
  const lang = req.headers['accept-language'] // Extract language from header

  try {
    // Modify your database query based on the education_id
    const [results] = await db.query(
      'SELECT * FROM courses WHERE education_id = ?',
      [education_id],
    )

    // Check if results is empty
    if (results.length === 0) {
      return res
        .status(404)
        .json({ message: 'No courses found for provided education_id' })
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

// Post a new course
const addCourseToEducationId = async (req, res) => {
  const {
    education_id,
    course_code,
    course_name,
    credits,
    grade,
    type,
    language,
    completion_date,
  } = req.body

  try {
    const [results] = await db.query(
      'INSERT INTO courses (education_id, course_code, course_name, credits, grade, type, completion_date, language) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        education_id,
        course_code,
        course_name,
        credits,
        grade,
        type,
        completion_date,
        language,
      ],
    )

    // Respond with the id of the newly created course
    res.json({ id: results.insertId })
  } catch (err) {
    console.error('Error executing MySQL query:', err)
    res
      .status(500)
      .json({ message: 'Internal Server Error', error: err.message })
  }
}

// Update a course
const updateCourseById = async (req, res) => {
  const {
    course_id,
    education_id,
    course_code,
    course_name,
    credits,
    grade,
    type,
    language,
    completion_date,
  } = req.body

  try {
    const [results] = await db.query(
      'UPDATE courses SET education_id = ?, course_code = ?, course_name = ?, credits = ?, grade = ?, type = ?, completion_date = ?, language = ? WHERE course_id = ?',
      [
        education_id,
        course_code,
        course_name,
        credits,
        grade,
        type,
        completion_date,
        language,
        course_id,
      ],
    )

    // Check if any rows were updated
    if (results.affectedRows === 0) {
      return res.status(404).json({
        message: 'No course found with the provided id',
      })
    }

    // Respond with a success message
    res.json({ message: 'Course updated successfully' })
  } catch (err) {
    console.error('Error executing MySQL query:', err)
    res
      .status(500)
      .json({ message: 'Internal Server Error', error: err.message })
  }
}

// Delete a course by id
const deleteCourseById = async (req, res) => {
  const id = req.params.id

  try {
    const [result] = await db.query('DELETE FROM courses WHERE course_id = ?', [
      id,
    ])

    // Check if any rows were deleted
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: 'No courses found with the provided course_id' })
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

// Course routes
router.get('/', authenticateToken, getCoursesByEducationId)
router.post('/add', authenticateToken, addCourseToEducationId)
router.put('/update', authenticateToken, updateCourseById)
router.delete('/delete/:id', authenticateToken, deleteCourseById)

module.exports = router
