const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const creditRoutes = require('./routes/creditRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const matchRoutes = require('./routes/matchRoutes'); // New route for AI matching
const scanRoutes = require('./routes/scanRoutes'); // New route for scan data storage
const path = require('path');
const app = express();

// Enable Cross-Origin Resource Sharing (CORS)
app.use(cors());

// Parse incoming JSON requests
app.use(bodyParser.json());

// Mount the user routes at the '/auth' path
app.use('/user', userRoutes);
app.use('/admin', adminRoutes);
app.use('/credits', creditRoutes);
app.use('/upload', uploadRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api", matchRoutes); // New route for AI matching
app.use("/scan", scanRoutes);


// Define the port to listen on, defaulting to 3000 if not specified in .env
const port = process.env.PORT || 3000;

// Simple health check endpoint
app.get('/', (req, res) => {
  res.status(200).send('API is running'); // Use a more descriptive message and status code
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`); // More descriptive log message
});
