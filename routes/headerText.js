//headerText.js
const express = require('express')
const router = express.Router()
const db = require('../db') // Adjust the path accordingly
const authenticateToken = require('../middleware/authenticateToken') // Import the authenticateToken middleware

// Route handling
router.get('/getbyuserid', authenticateToken, async (req, res) => {
  const { user_id, language } = req.query

  if (!user_id || !language) {
    return res.status(400).send('user_id and language are required')
  }

  try {
    const [results] = await db.query(
      'SELECT * FROM headerText WHERE user_id = ? AND language = ?',
      [user_id, language],
    )

    if (results.length === 0) {
      const [defaultResults] = await db.query(
        'SELECT * FROM headerText WHERE user_id = ? AND language = ?',
        [0, language], // Assuming 0 is the user_id for the default text
      )
      if (defaultResults.length === 0) {
        return res
          .status(404)
          .send('No header text found for the provided language')
      }
      return res.status(200).json(defaultResults[0])
    }

    res.status(200).json(results[0])
  } catch (error) {
    console.error('Error fetching data:', error)
    if (error.code === 'ER_BAD_FIELD_ERROR') {
      res.status(400).send('Invalid field')
    } else {
      res.status(500).send('Server error')
    }
  }
})

// POST route to insert header text

router.post('/add', authenticateToken, async (req, res) => {
  const { user_id, language, header, description } = req.body

  if (user_id === undefined || user_id === null || !language || !header) {
    return res.status(400).send('user_id, language and header are required')
  }

  try {
    await db.query(
      'INSERT INTO headerText (user_id, language, header, description) VALUES (?, ?, ?, ?)',
      [user_id, language, header, description],
    )

    res.status(200).send('Data inserted successfully')
  } catch (error) {
    console.error('Error inserting data:', error)
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).send('Duplicate entry')
    } else {
      res.status(500).send('Server error')
    }
  }
})

router.delete('/delete', authenticateToken, async (req, res) => {
  const { user_id, language } = req.body

  if (user_id === undefined || user_id === null || !language) {
    return res.status(400).send('user_id and language are required')
  }

  try {
    const [result] = await db.query(
      'DELETE FROM headerText WHERE user_id = ? AND language = ?',
      [user_id, language],
    )

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .send('No header text found with the provided user_id and language')
    }

    res.status(200).send('Data deleted successfully')
  } catch (error) {
    console.error('Error deleting data:', error)
    res.status(500).send('Server error')
  }
})

router.put('/update', authenticateToken, async (req, res) => {
  const { user_id, language, header, description } = req.body

  if (user_id === undefined || user_id === null || !language || !header) {
    return res.status(400).send('user_id, language and header are required')
  }

  try {
    const [result] = await db.query(
      'UPDATE headerText SET header = ?, description = ? WHERE user_id = ? AND language = ?',
      [header, description, user_id, language],
    )

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .send('No header text found with the provided user_id and language')
    }

    res.status(200).send('Data updated successfully')
  } catch (error) {
    console.error('Error updating data:', error)
    res.status(500).send('Server error')
  }
})

module.exports = router
