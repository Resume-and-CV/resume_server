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

  const mailOptions = { from, to, subject, text };
  return transporter.sendMail(mailOptions);
};
module.exports = sendEmail;
