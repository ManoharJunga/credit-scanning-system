// routes/adminRoutes.js
const express = require('express');
const { updateUserCredits } = require('../controllers/adminController');
const authenticateJWT = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/update-credits', authenticateJWT, updateUserCredits);

module.exports = router;
