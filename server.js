const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // Import the cors package
const loginRoutes = require('./routers/loginRoutes');
const screenerRoutes = require('./routers/screenerRoutes');
const dotenv = require('dotenv');
const app = express();
dotenv.config();
const port = process.env.PORT || 5000;

// Middleware to parse incoming JSON requests
app.use(bodyParser.json());
app.use(cors());
// Use auth routes
app.use('/api/auth', loginRoutes);
app.use('/api/screener', screenerRoutes);

// Root route to check if API is running
app.get('/', (req, res) => {
  res.status(200).json({ message: 'API is running' });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});