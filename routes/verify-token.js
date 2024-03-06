const express = require('express')
const router = express.Router()
const authenticateToken = require('../middleware/authenticateToken') // adjust the path accordingly

function verifyToken(req, res) {
  // If the middleware did not return an error, the token is valid
  res.sendStatus(200)
}

router.get('/', authenticateToken, verifyToken)

module.exports = router
