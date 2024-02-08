const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USERNAME, // Your Gmail address
    pass: process.env.GMAIL_APP_PASSWORD, // Your Gmail App Password
  },
});

const mailOptions = {
  from: "",
  to: "",
  subject: "",
  text: "",
};

exports.sendMail = async (req, res) => {
  const { to, from, subject, text } = req.body;

  mailOptions.from = from;
  mailOptions.to = to;
  mailOptions.subject = subject;
  mailOptions.text = text;

  try {
    const result = await transporter.sendMail(mailOptions);
    return result;
  } catch (error) {
    return error;
  }
};
