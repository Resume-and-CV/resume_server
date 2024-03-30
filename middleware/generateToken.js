// generateToken.js

const jwt = require('jsonwebtoken')
const JWT_SECRET = process.env.JWT_SECRET

function generateToken(req, res, next) {
  const user = req.user
  //console.log('user:', user)
  const token = jwt.sign(
    { id: user.user_id, username: user.username, type: user.type },
    JWT_SECRET,
    { expiresIn: '2h' },
  )
  req.token = token
  next()
}

module.exports = generateToken
