// authenticateToken.js
const jwt = require('jsonwebtoken')

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  //console.log(token)

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(401) // Invalid token
    req.user = user
    next() // Token is valid, proceed
  })
}

module.exports = authenticateToken
