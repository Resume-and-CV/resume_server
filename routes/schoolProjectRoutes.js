const express = require('express')
const router = express.Router()
const db = require('../db') // Adjust the path accordingly
const authenticateToken = require('../middleware/authenticateToken') // Import the authenticateToken middleware

// Route handling
router.get('/lang', authenticateToken, async (req, res) => {
  const lang = req.headers['accept-language'] // Extract language from header

  try {
    // Modify your database query based on the language, if necessary
    // Optionally, process results based on the language
    const query =
      'SELECT * FROM schoolprojects WHERE language = ? ORDER BY completitionDate DESC'
    const [results] = await db.query(query, [lang])

    // Optionally, process results based on the language
    res.json(results)
  } catch (err) {
    console.error('Error executing MySQL query:', err)
    res
      .status(500)
      .json({ message: 'Internal Server Error', error: err.message })
  }
})

module.exports = router
