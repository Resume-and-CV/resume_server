const express = require("express");
const cors = require("cors");
const db = require("./db"); // Import database configuration
const contactInfoRoutes = require("./routes/contactInfoRoutes");
const personalInfoRoutes = require("./routes/personalInfoRoutes");
const loginRoutes = require("./routes/loginRoutes");
const educationRoutes = require("./routes/educationRoutes");
const workRoutes = require("./routes/workRoutes");
const userRoutes = require("./routes/userRoutes");
const languageInfo = require("./routes/languageInfo");
const hobbiesRoutes = require("./routes/hobbiesInfo")
const recommendationRoutes = require("./routes/recommendationRoutes.js")

require("dotenv").config(); // Load environment variables from .env file

const app = express();
app.use(express.json()); // Middleware to parse JSON request bodies
app.use(cors()); // Enable CORS for all routes

// Register route handlers
app.use("/contactinfo", contactInfoRoutes);
app.use("/personalinfo", personalInfoRoutes);
app.use("/login", loginRoutes);
app.use("/education", educationRoutes);
app.use("/work", workRoutes);
app.use("/user", userRoutes);
app.use("/languageinfo", languageInfo);
app.use("/hobbiesinfo", hobbiesRoutes);
app.use("/recommendations", recommendationRoutes);

const port = process.env.PORT || 3000; // Define the server port

// Start the HTTP server
app.listen(port, () => {
  console.log(`HTTP Server running on port: ${port}`);
});
