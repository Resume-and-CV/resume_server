const express = require("express");
const cors = require("cors");
const db = require("./db"); // Import database configuration
const bodyParser = require("body-parser");

const contactInfoRoutes = require("./routes/contactInfoRoutes");
const personalInfoRoutes = require("./routes/personalInfoRoutes");
const loginRoutes = require("./routes/loginRoutes");
const educationRoutes = require("./routes/educationRoutes");
const workRoutes = require("./routes/workRoutes");
const userRoutes = require("./routes/userRoutes");
const languageInfoRoutes = require("./routes/languageInfo");
const hobbiesRoutes = require("./routes/hobbiesInfo")
const recommendationRoutes = require("./routes/recommendationRoutes.js")
const schoolProjectRoutes = require("./routes/schoolProjectRoutes.js")
const personalProjectRoutes = require("./routes/personalProjectRoutes.js")
const emailRoutes = require("./routes/emailRoutes.js")
const expiringLinkRoutes = require("./routes/expiringLinkRoutes.js")
const userSessionRoutes = require("./routes/userSessionRoutes.js")

require("dotenv").config(); // Load environment variables from .env file

const app = express();
app.use(express.json()); // Middleware to parse JSON request bodies
app.use(cors()); // Enable CORS for all routes

// Register route handlers
app.use(bodyParser.json());
app.use("/contactinfo", contactInfoRoutes);
app.use("/personalinfo", personalInfoRoutes);
app.use("/login", loginRoutes);
app.use("/education", educationRoutes);
app.use("/work", workRoutes);
app.use("/user", userRoutes);
app.use("/languageinfo", languageInfoRoutes);
app.use("/hobbiesinfo", hobbiesRoutes);
app.use("/recommendations", recommendationRoutes);
app.use("/schoolprojects", schoolProjectRoutes);
app.use("/personalprojects", personalProjectRoutes)
app.use("/email", emailRoutes);
app.use("/expiringlink", expiringLinkRoutes);
app.use("/usersessions", userSessionRoutes);

const port = process.env.PORT || 3000; // Define the server port

// Start the HTTP server
app.listen(port, () => {
  console.log(`HTTP Server running on port: ${port}`);
});
