// pdfRoutes.js

const express = require('express')
const router = express.Router()
const authenticateToken = require('../middleware/authenticateToken') // Import the authenticateToken middleware
const isAdmin = require('../middleware/isAdmin') // Import the isAdmin middleware
const generatePDFMiddleware = require('../middleware/generatePDFMiddleware') // Import the generatePDFMiddleware middleware
const db = require('../db') // Adjust the path accordingly

// Route for generating PDF
router.get(
  '/generate',
  authenticateToken,
  isAdmin,
  async (req, res, next) => {
    const lang = req.headers['accept-language'] // Extract language from header

    try {
      // Fetch contact information from the database
      const [results] = await db.query(
        'SELECT * FROM contactinfo WHERE language = ? ',
        [lang],
      )

      if (!results || results.length === 0) {
        return res.status(404).json({ message: 'No contact information found' })
      }
      // Attach contact information to request object
      req.contactInfoData = results[0]
      next()
    } catch (err) {
      console.error('Error executing MySQL query:', err)
      res
        .status(500)
        .json({ message: 'Internal Server Error', error: err.message })
    }
  },
  generatePDFMiddleware,
  (req, res) => {
    // Send PDF as response
    res.setHeader('Content-Type', 'application/pdf')
    res.send(req.pdfBuffer)
  },
)

module.exports = router
