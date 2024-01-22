const express = require('express');
const contactInfoRoutes = require('./routes/contactInfoRoutes');
const db = require('./db');
const cors = require('cors'); // Import the cors middleware


require('dotenv').config();

const port = process.env.PORT || 3000;
const app = express();

// Use the cors middleware
app.use(cors());

// Use the contactInfoRoutes for the '/contact-info' endpoint
app.use('/contactinfo', contactInfoRoutes);

// Start the Express server
app.listen(port, () => {
  console.log(`Express server listening at http://localhost:${port}`);
});
