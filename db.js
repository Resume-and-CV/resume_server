// db.js

const mysql = require("mysql");
require("dotenv").config();
const url = require('url');

// Parse the JAWSDB_URL environment variable
let dbConfig;
if (process.env.JAWSDB_URL) {
  // If running on Heroku with JawsDB
  const jawsDbUrl = url.parse(process.env.JAWSDB_URL);
  dbConfig = {
    host: jawsDbUrl.hostname,
    user: jawsDbUrl.auth.split(':')[0],
    password: jawsDbUrl.auth.split(':')[1],
    database: jawsDbUrl.pathname.slice(1)
  };
} else {
  // Fallback for local development
  dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
  };
}

const db = mysql.createConnection(dbConfig);

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
    throw err;
  }
  console.log("Connected to MySQL server");
});

module.exports = db;





/* const mysql = require("mysql");
require("dotenv").config();

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
};

const db = mysql.createConnection(dbConfig);

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
    throw err;
  }
  console.log("Connected to MySQL server");
});
module.exports = db; */

