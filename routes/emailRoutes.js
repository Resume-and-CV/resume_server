// gmailRoutes.js
const express = require("express");
const router = express.Router();
const sendEmail = require("../middleware/sendEmail");
const authenticateToken = require("../middleware/authenticateToken"); // Import the authenticateToken middleware

router.post("/send-request", async (req, res) => {
  try {
    const { from, subject, text } = req.body;
    const to = process.env.RECIPIENT_EMAIL;
    //console.log(req.body)

    if (!from || !subject || !text) {
      return res.status(400).json({ message: "Missing email fields" });
    }
    await sendEmail({ from, to, subject, text });
    res.json({ message: "Email sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to send email" });
  }
});

router.post("/send-mail", authenticateToken, async (req, res) => {
  try {
    const { from, to, subject, text } = req.body;

    if (!from || !to || !subject || !text) {
      return res.status(400).json({ message: "Missing email fields" });
    }
    await sendEmail({ from, to, subject, text });
    res.json({ message: "Email sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to send email" });
  }
});

module.exports = router;
