const mysql = require('mysql2/promise')
require('dotenv').config()

// Use the URL constructor for parsing
let dbConfig
if (process.env.RESUMEDB_URL) {
  // If running on Heroku with JawsDB
  const jawsDbUrl = new URL(process.env.RESUMEDB_URL)
  dbConfig = {
    host: jawsDbUrl.hostname,
    user: jawsDbUrl.username, // Change to username
    password: jawsDbUrl.password, // Change to password
    database: jawsDbUrl.pathname.slice(1),
    connectionLimit: 4, // Add the connection limit here
  }
} else {
  // Fallback for local development
  dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    connectionLimit: 4, // Add the connection limit here
  }
}

let db = mysql.createPool(dbConfig) // Create a pool

db.on('error', (err) => {
  if (err.code === 'ECONNRESET') {
    // Connection was forcibly closed by the server
    // You can recreate the pool here
    db = mysql.createPool(dbConfig)
  } else {
    // Unexpected error
    throw err
  }
})

// Optionally test the connection
async function testConnection() {
  try {
    await db.query('SELECT 1')
    console.log('Connected to MySQL server via Pool')
  } catch (err) {
    console.error('Error connecting to MySQL:', err)
  }
}

testConnection()

module.exports = db
