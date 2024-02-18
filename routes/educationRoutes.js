// educationRoutes.js
const express = require('express')
const router = express.Router()
const db = require('../db') // Adjust the path accordingly
const authenticateToken = require('../middleware/authenticateToken') // Import the authenticateToken middleware

// get education
const getEducationByLanguage = async (req, res) => {
  const lang = req.headers['accept-language'] // Extract language from header

  try {
    // Modify your database query based on the language, if necessary
    const [results] = await db.query(
      'SELECT * FROM education WHERE language = ? ORDER BY start_date DESC',
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

// Post a new education
const addEducation = async (req, res) => {
  const {
    institution,
    degree,
    major,
    start_date,
    end_date,
    GPA,
    total_credits_required,
    language,
  } = req.body

  try {
    const [results] = await db.query(
      'INSERT INTO education (institution, degree, major, start_date, end_date, GPA, total_credits_required, language) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        institution,
        degree,
        major,
        start_date,
        end_date,
        GPA,
        total_credits_required,
        language,
      ],
    )

    // Respond with the id of the newly created education
    res.json({ id: results.insertId })
  } catch (err) {
    console.error('Error executing MySQL query:', err)
    res
      .status(500)
      .json({ message: 'Internal Server Error', error: err.message })
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

//get courses by education_id
const getCoursesByEducationId = async (req, res) => {
  const education_id = req.query.education_id // Extract education_id from query parameters

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
      return res
        .status(404)
        .json({ message: 'No exemptions found for the provided course_id' })
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

// Education routes
router.get('/lang', authenticateToken, getEducationByLanguage)
router.post('/add', authenticateToken, addEducation)
router.put('/update', authenticateToken, updateEducationById)
router.delete('/delete/:id', authenticateToken, deleteEducationById)

// Course routes
router.get('/courses', authenticateToken, getCoursesByEducationId)
router.post('/courses/add', authenticateToken, addCourseToEducationId)
router.put('/courses/update', authenticateToken, updateCourseById)
router.delete('/courses/delete/:id', authenticateToken, deleteCourseById)

// Exemption routes
router.get('/exemptions', authenticateToken, getExemptionsByCourseId)
router.post('/exemptions/add', authenticateToken, addExemptionToCourseId)
router.put('/exemptions/update', authenticateToken, updateExemptionById)
router.delete('/exemptions/delete/:id', authenticateToken, deleteExemptionById)

module.exports = router
