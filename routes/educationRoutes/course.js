// educationRoutes.js
const express = require('express')
const router = express.Router()
const db = require('../../db') // Adjust the path accordingly
const authenticateToken = require('../../middleware/authenticateToken') // Import the authenticateToken middleware

//get courses by education_id
const getCoursesByEducationId = async (req, res) => {
  const education_id = req.headers['education_id']
  const lang = req.headers['accept-language'] // Extract language from header

  // Check if education_id and lang are provided
  if (!education_id) {
    return res.status(400).json({ message: 'Missing education_id in headers' })
  }
  if (!lang) {
    return res
      .status(400)
      .json({ message: 'Missing accept-language in headers' })
  }

  try {
    // Modify your database query based on the language, if necessary
    const [results] = await db.query(
      `
                SELECT 
                e.course_id,
                e.education_id, 
                e.course_code, 
                et.language, 
                et.course_name,
                e.credits, 
                e.grade, 
                e.type, 
                et.language, 
                e.completion_date, 
                e.updatedAt 
            FROM 
                courses_new e 
            JOIN 
                courses_translations_new et 
            ON 
                e.course_id = et.course_id
            WHERE
                et.language = ? AND
                e.education_id = ?
            ORDER BY 
                e.completion_date ASC
            `,
      [lang, education_id],
    )

    // Check if results is empty
    if (results.length === 0) {
      return res.status(404).json({
        message: 'No courses found for the provided language and education_id',
      })
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

const addCourseToEducationId = async (req, res) => {
  const {
    education_id,
    course_code,
    credits,
    grade,
    type,
    completion_date,
    translations, // This should be an array of objects, each containing 'language' and 'course_name'
  } = req.body

  try {
    // Check if the provided education_id exists
    const [education] = await db.query(
      'SELECT * FROM educations_new WHERE education_id = ?',
      [education_id],
    )

    if (!education.length) {
      return res.status(400).json({ message: 'Invalid education_id' })
    }

    // Insert into courses_new table
    const [courseResults] = await db.query(
      'INSERT INTO courses_new (education_id, course_code, credits, grade, type, completion_date) VALUES (?, ?, ?, ?, ?, ?)',
      [education_id, course_code, credits, grade, type, completion_date],
    )

    // Insert into courses_translations_new table for each language
    for (let translation of translations) {
      await db.query(
        'INSERT INTO courses_translations_new (course_id, language, course_name) VALUES (?, ?, ?)',
        [courseResults.insertId, translation.language, translation.course_name],
      )
    }

    // Respond with the id of the newly created course
    res.json({ id: courseResults.insertId })
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
    // Check if course exists
    const [courses] = await db.query(
      'SELECT * FROM courses_new WHERE course_id = ?',
      [id],
    )
    if (courses.length === 0) {
      return res
        .status(404)
        .json({ message: 'No course found with the provided id' })
    }

    // Check if there are any related records in exemptions_new
    const [relatedRecords] = await db.query(
      'SELECT * FROM exemptions_new WHERE course_id = ?',
      [id],
    )

    if (relatedRecords.length > 0) {
      return res
        .status(400)
        .json({ message: 'You must delete exemptions first' })
    }

    // Delete translations from courses_translations_new table
    await db.query('DELETE FROM courses_translations_new WHERE course_id = ?', [
      id,
    ])

    // Delete course from courses_new table
    const [result] = await db.query(
      'DELETE FROM courses_new WHERE course_id = ?',
      [id],
    )

    // Check if any rows were deleted
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: 'No course found with the provided id' })
    }

    // Respond with a success message
    res.json({ message: 'Course deleted successfully' })
  } catch (err) {
    console.error('Error executing MySQL query:', err)
    res
      .status(500)
      .json({ message: 'Internal Server Error', error: err.message })
  }
}
// Course routes
router.get('/lang', authenticateToken, getCoursesByEducationId)
router.post('/add', authenticateToken, addCourseToEducationId)
router.delete('/delete/:id', authenticateToken, deleteCourseById)

module.exports = router
