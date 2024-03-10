const express = require('express')
const router = express.Router()
const db = require('../db') // Adjust the path accordingly
const authenticateToken = require('../middleware/authenticateToken') // Import the authenticateToken middleware
const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET

router.post('/add', authenticateToken, async (req, res) => {
  const { user_id, url } = req.body // Validate user_id as needed

  try {
    // Generate a unique token for resume access
    const resumeAccessToken = jwt.sign(
      { user_id },
      JWT_SECRET,
      { expiresIn: '60d' }, // Adjust the expiration as needed
    )

    // Calculate expiration date for storing in the database
    const expirationDate = new Date()
    expirationDate.setDate(expirationDate.getDate() + 60) // Add 60 days for consistency with token expiration

    // Generate the unique link (assuming the token is part of the link)
    const uniqueLink = `${url}/#/linkloginpage?token=${resumeAccessToken}`

    // Store the link information in the databasexzs
    await db.query(
      'INSERT INTO ExpiringLinks (user_id, link, expiration_date) VALUES (?, ?, ?)',
      [user_id, uniqueLink, expirationDate],
    )

    // Respond with the unique link
    return res.json({ message: 'Link added succesfully!', link: uniqueLink })
  } catch (error) {
    console.error('Error generating resume access link:', error)
    return res
      .status(500)
      .json({ message: 'Internal server error', error: error.message })
  }
})

router.get('/get', authenticateToken, async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM ExpiringLinks')
    // Optionally, process results based on the language or other criteria
    res.json(results)
  } catch (err) {
    console.error('Error executing MySQL query:', err)
    res
      .status(500)
      .json({ message: 'Internal Server Error', error: err.message })
  }
})

module.exports = router
