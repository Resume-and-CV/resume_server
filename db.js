const mysql = require('mysql2/promise')
require('dotenv').config()

// Use the URL constructor for parsing
let dbConfig
if (process.env.JAWSDB_URL) {
  // If running on Heroku with JawsDB
  const jawsDbUrl = new URL(process.env.JAWSDB_URL)
  dbConfig = {
    host: jawsDbUrl.hostname,
    user: jawsDbUrl.username, // Change to username
    password: jawsDbUrl.password, // Change to password
    database: jawsDbUrl.pathname.slice(1),
  }
} else {
  // Fallback for local development
  dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  }
}

const db = mysql.createPool(dbConfig) // Create a pool

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
