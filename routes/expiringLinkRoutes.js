const express = require("express");
const router = express.Router();
const db = require("../db"); // Adjust the path accordingly
const authenticateToken = require("../middleware/authenticateToken"); // Import the authenticateToken middleware
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

router.post("/add", authenticateToken, async (req, res) => {
  const { employerId } = req.body; // Validate employerId as needed

  try {
    // Generate a unique token for resume access
    const resumeAccessToken = jwt.sign(
      { employerId },
      JWT_SECRET,
      { expiresIn: "24h" } // Adjust the expiration as needed
    );

    // Calculate expiration date for storing in the database
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + 24); // Set to 24 hours from now

    // Generate the unique link (assuming the token is part of the link)
    const uniqueLink = `https://${process.env.WEB_URL}/#/home?token=${resumeAccessToken}`;

    // Store the link information in the database
    await db.query(
      "INSERT INTO ExpiringLinks (user_id, link, expiration_date) VALUES (?, ?, ?)",
      [employerId, uniqueLink, expirationDate]
    );

    // Respond with the unique link
    return res.json({ link: uniqueLink });
  } catch (error) {
    console.error("Error generating resume access link:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

router.get("/", async (req, res) => {
  const { token } = req.query;

  try {
    // Verify the token to extract employerId or other identifying information
    const decoded = jwt.verify(token, JWT_SECRET);
    const employerId = decoded.employerId; // Extracted from the token

    // Check the database for the link and ensure it's not expired
    const [links] = await db.query(
      "SELECT * FROM ExpiringLinks WHERE link LIKE ? AND expiration_date > NOW()",
      [`%${token}%`]
    );

    if (links.length === 0) {
      return res.status(400).json({ message: "Invalid or expired link" });
    }

    // Serve the resume here (e.g., send a file, a link to a document, or render a page with resume information)
    res.sendFile(process.env.WEB_URL);
  } catch (error) {
    console.error("Error serving resume:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

module.exports = router;
