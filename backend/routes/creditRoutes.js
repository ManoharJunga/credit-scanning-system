const express = require('express');
const router = express.Router();
const creditController = require('../controllers/creditController');

// Route to request additional credits
router.post('/request', creditController.requestCredits);

// Route for admin to approve or deny credit requests
router.post('/manage', creditController.manageCreditRequest);

module.exports = router;
