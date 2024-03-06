const express = require('express')
const router = express.Router()
const db = require('../../db') // Adjust the path accordingly
const authenticateToken = require('../../middleware/authenticateToken') // Import the authenticateToken middleware

//get exemptions by course_id
const getExemptionsByCourseId = async (req, res) => {
  const course_id = req.headers['course_id']
  const lang = req.headers['accept-language'] // Extract language from header

  // Check if education_id and lang are provided
  if (!course_id) {
    return res.status(400).json({ message: 'Missing course_id in headers' })
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
                e.exemption_id,
                e.course_id,
                et.original_institution,
                et.original_course_name,
                e.original_credits, 
                e.completion_date, 
                e.type,
                et.language
            FROM 
                exemptions_new e 
            JOIN 
                exemptions_translations_new et 
            ON 
                e.exemption_id = et.exemption_id
            WHERE
                et.language = ? AND
                e.course_id = ?
            ORDER BY 
                e.completion_date ASC
            `,
      [lang, course_id],
    )

    // Check if results is empty
    if (results.length === 0) {
      return res.status(404).json({
        message: 'No exemptions found for the provided language and course_id',
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

const addExemptionToCourseId = async (req, res) => {
  const {
    course_id,
    original_credits,
    completion_date,
    type,
    translations, // This should be an array of objects
  } = req.body

  try {
    // Check if the provided education_id exists
    const [course] = await db.query(
      'SELECT * FROM courses_new WHERE course_id = ?',
      [course_id],
    )

    if (!course.length) {
      return res.status(400).json({ message: 'Invalid course_id' })
    }
    // First, insert into the exemptions_new table
    const [exemptionResults] = await db.query(
      'INSERT INTO exemptions_new (course_id, original_credits, completion_date, type) VALUES (?, ?, ?, ?)',
      [course_id, original_credits, completion_date, type],
    )

    // Get the ID of the newly inserted exemption
    const exemptionId = exemptionResults.insertId

    // Then, insert into the exemptions_translations_new table for each translation
    for (let translation of translations) {
      const { original_institution, original_course_name, language } =
        translation
      await db.query(
        'INSERT INTO exemptions_translations_new (exemption_id, original_institution, original_course_name, language) VALUES (?, ?, ?, ?)',
        [exemptionId, original_institution, original_course_name, language],
      )
    }

    // Respond with the id of the newly created exemption
    res.json({ exemptionId, translations })
  } catch (err) {
    console.error('Error executing MySQL query:', err)
    res.status(500).json({
      message: 'An error occurred while adding exemption',
      error: err.message,
    })
  }
}

// Delete an exemption by id
const deleteExemptionById = async (req, res) => {
  const id = req.params.id

  try {
    // Check if exemption exists
    const [exemptions] = await db.query(
      'SELECT * FROM exemptions_new WHERE exemption_id = ?',
      [id],
    )
    if (exemptions.length === 0) {
      return res
        .status(404)
        .json({ message: 'No exemption found with the provided id' })
    }

    // Delete translations from exemptions_translations_new table
    await db.query(
      'DELETE FROM exemptions_translations_new WHERE exemption_id = ?',
      [id],
    )

    // Delete exemption from exemptions_new table
    const [result] = await db.query(
      'DELETE FROM exemptions_new WHERE exemption_id = ?',
      [id],
    )

    // Check if any rows were deleted
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: 'No exemption found with the provided id' })
    }

    // Respond with a success message
    res.json({ message: 'Exemption deleted successfully' })
  } catch (err) {
    console.error('Error executing MySQL query:', err)
    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
      return res
        .status(400)
        .json({ message: 'You must delete related data first' })
    }
    res
      .status(500)
      .json({ message: 'Internal Server Error', error: err.message })
  }
}

// Exemption routes
router.get('/lang', authenticateToken, getExemptionsByCourseId)
router.post('/add', authenticateToken, addExemptionToCourseId)
router.delete('/delete/:id', authenticateToken, deleteExemptionById)

module.exports = router
