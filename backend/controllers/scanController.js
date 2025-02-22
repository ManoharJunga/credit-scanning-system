const Scan = require("../models/scanModel");
const User = require("../models/userModel"); // Assuming you have a User model

exports.addScan = async (req, res) => {
  try {
    const { username, topic, textContent } = req.body;

    // ✅ Fetch user ID from username
    User.findUserByUsername(username, (err, user) => {
      if (err || !user) {
        return res.status(404).json({ error: "User not found" });
      }

      const userId = user.id;

      // ✅ Store scan in DB
      Scan.addScan(userId, topic, textContent, (err, scan) => {
        if (err) {
          return res.status(500).json({ error: "Error saving scan" });
        }
        res.status(201).json({ message: "Scan saved successfully", scan });
      });
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getScans = (req, res) => {
  Scan.getScans((err, scans) => {
    if (err) {
      res.status(500).json({ error: "Error fetching scans" });
    } else {
      res.json(scans);
    }
  });
};
