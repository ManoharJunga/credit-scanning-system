const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const creditRoutes = require('./routes/creditRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

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


// Example of a POST route (you would add your actual routes here)
// app.post('/users', (req, res) => {
//   const { username, password } = req.body;
//   // ... your logic to create a user ...
//   res.status(201).json({ message: 'User created successfully' });
// });

// Example of a GET route (you would add your actual routes here)
// app.get('/users', (req, res) => {
//     // ... your logic to fetch users ...
//     res.status(200).json({ users: [] }); // Or send the actual users data
// });