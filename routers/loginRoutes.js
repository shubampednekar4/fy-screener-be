// routes/authRoutes.js

const express = require('express');
const { login , validateAuthcode, getProfile , signout} = require('../controllers/loginController');

const router = express.Router();

// Define login route
router.post('/login', login);
router.post('/signout',signout);
router.post('/validate-authcode', validateAuthcode);
router.post('/profile', getProfile);

module.exports = router;
