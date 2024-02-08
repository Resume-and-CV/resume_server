const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: process.env.MAILTRAP_USERNAME,
    pass: process.env.MAILTRAP_PASSWORD,
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
