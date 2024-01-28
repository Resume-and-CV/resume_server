const express = require("express");
const cors = require("cors"); // Import CORS middleware for cross-origin requests
const fs = require("fs");
const https = require("https");
const db = require("./db"); // Import database configuration
const contactInfoRoutes = require("./routes/contactInfoRoutes"); // Import routes for contact info
const personalInfoRoutes = require("./routes/personalInfoRoutes"); // Import routes for personal info
const loginRoutes = require('./routes/loginRoutes');
const educationRoutes = require("./routes/educationRoutes")
const workRoutes = require("./routes/workRoutes")

require("dotenv").config(); // Load environment variables from .env file

const app = express();
app.use(express.json()); // Middleware to parse JSON request bodies
app.use(cors()); // Enable CORS for all routes

// Read SSL certificate and private key for setting up HTTPS
const privateKey = fs.readFileSync("key.pem", "utf8");
const certificate = fs.readFileSync("cert.pem", "utf8");
const credentials = { key: privateKey, cert: certificate };

// Create an HTTPS server with the provided credentials
const httpsServer = https.createServer(credentials, app);

// Register route handlers
app.use("/contactinfo", contactInfoRoutes); // Routes for contact info
app.use("/personalinfo", personalInfoRoutes); // Routes for personal info
app.use("/login", loginRoutes);
app.use("/education", educationRoutes);
app.use("/work", workRoutes);

const port = process.env.PORT || 3000 // Define the server port

// Start the HTTPS server
httpsServer.listen(port, () => {
  console.log(`HTTPS Server running on port: ${port}`);
});
