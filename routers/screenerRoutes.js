const express = require('express');
const router = express.Router();
const screenerController = require('../controllers/screenerController');

router.post('/sevenpercent', screenerController.getSevenPercentStocks);

module.exports = router;
