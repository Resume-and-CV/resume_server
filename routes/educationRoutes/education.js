// educationRoutes.js
const express = require('express')
const router = express.Router()
const db = require('../../db') // Adjust the path accordingly
const authenticateToken = require('../../middleware/authenticateToken') // Import the authenticateToken middleware

// get education
const getEducationByLanguage = async (req, res) => {
  const lang = req.headers['accept-language'] // Extract language from header

  try {
    // Modify your database query based on the language, if necessary
    const [results] = await db.query(
      `
      SELECT e.education_id, et.institution, et.degree,
      et.major, 
      e.start_date, 
      e.end_date, 
      e.GPA, 
      e.total_credits_required, 
      et.language, 
      e.createdAt, 
      e.updatedAt 
    FROM 
      educations_new e 
    JOIN 
      educations_translations_new et 
    ON 
      e.education_id = et.education_id
    WHERE
      et.language = ?
    ORDER BY 
      e.start_date DESC
    `,
      [lang],
    )

    // Check if results is empty
    if (results.length === 0) {
      return res
        .status(404)
        .json({ message: 'No education found for the provided language' })
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

const addEducation = async (req, res) => {
  const {
    start_date,
    end_date,
    GPA,
    total_credits_required,
    translations, // This should be an array of objects
  } = req.body

  try {
    // First, insert into the educations_new table
    const [educationResults] = await db.query(
      'INSERT INTO educations_new (start_date, end_date, GPA, total_credits_required) VALUES (?, ?, ?, ?)',
      [start_date, end_date, GPA, total_credits_required],
    )

    // Get the ID of the newly inserted education
    const educationId = educationResults.insertId

    // Then, insert into the educations_translations_new table for each translation
    for (let translation of translations) {
      const { institution, degree, major, language } = translation
      await db.query(
        'INSERT INTO educations_translations_new (education_id, institution, degree, major, language) VALUES (?, ?, ?, ?, ?)',
        [educationId, institution, degree, major, language],
      )
    }

    // Respond with the id of the newly created education
    res.json({ educationId, translations })
  } catch (err) {
    console.error('Error executing MySQL query:', err)
    res.status(500).json({
      message: 'An error occurred while adding education',
      error: err.message,
    })
  }
}

const updateEducationById = async (req, res) => {
  const {
    id,
    institution,
    degree,
    major,
    start_date,
    end_date,
    GPA,
    total_credits_required,
    language,
  } = req.body // Extract fields from request body

  try {
    // Modify your database query based on the id
    const [results] = await db.query(
      'UPDATE education SET institution = ?, degree = ?, major = ?, start_date = ?, end_date = ?, GPA = ?, total_credits_required = ?, language = ? WHERE id = ?',
      [
        institution,
        degree,
        major,
        start_date,
        end_date,
        GPA,
        total_credits_required,
        language,
        id,
      ],
    )

    // Check if any rows were updated
    if (results.affectedRows === 0) {
      return res.status(404).json({
        message: 'No education found with the provided id',
      })
    }

    // Respond with a success message
    res.json({ message: 'Education updated successfully' })
  } catch (err) {
    console.error('Error executing MySQL query:', err)
    res
      .status(500)
      .json({ message: 'Internal Server Error', error: err.message })
  }
}

// Delete an education by id
const deleteEducationById = async (req, res) => {
  const id = req.params.id

  try {
    // First, find all related course records
    const [courses] = await db.query(
      'SELECT course_id FROM courses WHERE education_id = ?',
      [id],
    )

    // Then, delete all related exemption records
    for (let course of courses) {
      await db.query('DELETE FROM exemptions WHERE course_id = ?', [
        course.course_id,
      ])
    }

    // Next, delete the course records
    await db.query('DELETE FROM courses WHERE education_id = ?', [id])

    // Finally, delete the education record
    const [result] = await db.query('DELETE FROM education WHERE id = ?', [id])

    // Check if any rows were deleted
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: 'No education found with the provided id' })
    }

    // Respond with a success message
    res.json({ message: 'Education and related records deleted successfully' })
  } catch (err) {
    console.error('Error executing MySQL query:', err)
    res
      .status(500)
      .json({ message: 'Internal Server Error', error: err.message })
  }
}

// Education routes
router.get('/lang', authenticateToken, getEducationByLanguage)
router.post('/add', authenticateToken, addEducation)
router.put('/update', authenticateToken, updateEducationById)
router.delete('/delete/:id', authenticateToken, deleteEducationById)

module.exports = router
