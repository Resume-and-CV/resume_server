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

const addEducationTranslationById = async (req, res) => {
  const { education_id, language, institution, degree, major } = req.body // Extract fields from request body

  try {
    // Check if an education with the given education_id exists
    const [educationExists] = await db.query(
      'SELECT 1 FROM educations_new WHERE education_id = ?',
      [education_id],
    )

    if (educationExists.length === 0) {
      return res.status(404).json({
        message: 'No education found with the provided id',
      })
    }

    // Insert a new row into the education_translations_new table
    const [results] = await db.query(
      'INSERT INTO educations_translations_new (education_id, language, institution, degree, major) VALUES (?, ?, ?, ?, ?)',
      [education_id, language, institution, degree, major],
    )

    // Check if the row was inserted successfully
    if (results.affectedRows === 0) {
      return res.status(500).json({
        message: 'Failed to insert new education translation',
      })
    }

    // Respond with a success message
    res.json({ message: 'Education translation added successfully' })
  } catch (err) {
    console.error('Error executing MySQL query:', err)
    res
      .status(500)
      .json({ message: 'Internal Server Error', error: err.message })
  }
}

const updateEducationNewById = async (req, res) => {
  const { education_id, start_date, end_date, GPA, total_credits_required } =
    req.body // Extract fields from request body

  try {
    // Modify your database query based on the id
    const [results] = await db.query(
      'UPDATE educations_new SET start_date = ?, end_date = ?, GPA = ?, total_credits_required = ? WHERE education_id = ?',
      [start_date, end_date, GPA, total_credits_required, education_id],
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

const updateEducationTranslationsNewById = async (req, res) => {
  const { education_id, language, institution, degree, major } = req.body // Extract fields from request body

  try {
    // Modify your database query based on the id
    const [results] = await db.query(
      'UPDATE educations_translations_new SET institution = ?, degree = ?, major = ? WHERE education_id = ? AND language = ?',
      [institution, degree, major, education_id, language],
    )

    // Check if any rows were updated
    if (results.affectedRows === 0) {
      return res.status(404).json({
        message:
          'No education translation found with the provided id and language',
      })
    }

    // Respond with a success message
    res.json({ message: 'Education translation updated successfully' })
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
    // First, delete all related translation records
    await db.query(
      'DELETE FROM educations_translations_new WHERE education_id = ?',
      [id],
    )

    // Finally, delete the education record from educations_new
    const [result] = await db.query(
      'DELETE FROM educations_new WHERE education_id = ?',
      [id],
    )

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
router.post('/add-translation', authenticateToken, addEducationTranslationById)

router.put('/update', authenticateToken, updateEducationNewById)
router.put(
  '/update-translation',
  authenticateToken,
  updateEducationTranslationsNewById,
)

router.delete('/delete/:id', authenticateToken, deleteEducationById)

module.exports = router
