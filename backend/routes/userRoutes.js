// routes/userRoutes.js
const express = require('express');
const { registerUser, loginUser } = require('../controllers/userController');
const { getUserCredits } = require('../models/userModel');
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/:username', async (req, res) => {
    const { username } = req.params;
    try {
        const user = await getUserCredits(username);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json(user);
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;
