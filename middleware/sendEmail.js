// sendMail.js
const nodemailer = require("nodemailer");

const sendEmail = async ({ from, to, subject, text }) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USERNAME,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  // Include sender's email in the email body
  const emailBody = `From: ${from}\n\n${text}`; // Modify this according to your email format

  const mailOptions = {
    from: process.env.GMAIL_USERNAME, // Use your own email address here
    to: to,
    subject: subject,
    text: emailBody,
  };

  return transporter.sendMail(mailOptions);
};
module.exports = sendEmail;
