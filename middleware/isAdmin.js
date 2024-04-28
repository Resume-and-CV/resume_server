// isAdmin.js
const isAdmin = (req, res, next) => {
  if (req.user && req.user.type === 'admin') {
    next() // User is admin, proceed
  } else {
    return res.status(403).json({ message: 'Forbidden: Admin rights required' }) // User is not admin
  }
}

module.exports = isAdmin
