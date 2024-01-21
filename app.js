const express = require('express');
const contactInfoRoutes = require('./routes/contactInfoRoutes');
const db = require('./db');
require('dotenv').config();

const port = process.env.PORT || 3000;
const app = express();

// Use the contactInfoRoutes for the '/contact-info' endpoint
app.use('/contactinfo', contactInfoRoutes);

// Start the Express server
app.listen(port, () => {
  console.log(`Express server listening at http://localhost:${port}`);
});
