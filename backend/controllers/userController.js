const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
bcrypt.setRandomFallback(require('crypto').randomBytes);  // Adding this line to set a fallback for random number generation
const User = require('../models/userModel');

// Register user
const registerUser = async (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password || !role) {
    return res.status(400).json({ error: "Username, password, and role are required" });
  }

  try {
    const existingUser = await User.findUserByUsername(username);
    if (existingUser) {
      return res.status(400).json({ error: "Username already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const userId = await User.createUser(username, hashedPassword, role);

    res.status(201).json({ message: "User registered successfully", userId });
  } catch (error) {
    console.error("Error in registerUser:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Login user
const loginUser = async (req, res) => {
  const { username, password } = req.body;

  // Check if the login is for the admin
  if (username === 'admin' && password === 'admin') {
    return res.json({ message: "Admin login successful", role: 'admin' });
  }

  // For regular users, check the database
  try {
    const user = await User.findUserByUsername(username);
    if (!user) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

    // Compare the provided password with the hashed password in the database
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

    res.json({ message: "Login successful", user });
  } catch (error) {
    console.error("Error in loginUser:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { registerUser, loginUser };
