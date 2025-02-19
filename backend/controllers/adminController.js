// controllers/adminController.js
const User = require('../models/userModel');

// Admin-specific functionality (e.g., updating credits)
const updateUserCredits = async (req, res) => {
  const { userId, credits } = req.body;
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: "Access denied, only admin can update credits" });
  }

  try {
    const result = await User.updateCredits(userId, credits);
    if (result === 0) {
      return res.status(400).json({ error: "User not found" });
    }
    res.json({ message: "Credits updated successfully" });
  } catch (error) {
    console.error("Error in updateUserCredits:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { updateUserCredits };
