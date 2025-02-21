const express = require('express');
const router = express.Router();
const creditController = require('../controllers/creditController');
const db = require('../database');
// Route to request additional credits
router.post('/request', creditController.requestCredits);

// Route for admin to approve or deny credit requests
router.post('/manage', creditController.manageCreditRequest);

router.get('/pending', async (req, res) => {
    db.all(
        "SELECT cr.id, u.username, cr.requested_credits FROM credit_requests cr JOIN users u ON cr.user_id = u.id WHERE cr.status = 'pending'",
        [],
        (err, rows) => {
            if (err) {
                console.error("Error fetching pending requests:", err);
                return res.status(500).json({ message: "Internal server error" });
            }
            res.json(rows);
        }
    );
});

router.get("/scans-per-user", async (req, res) => {
    db.all(
        "SELECT user_id, COUNT(*) AS scan_count, DATE(timestamp) AS scan_date FROM scans GROUP BY user_id, scan_date",
        [],
        (err, rows) => {
            if (err) {
                console.error("Error fetching scans per user:", err);
                return res.status(500).json({ message: "Internal server error" });
            }
            res.json(rows);
        }
    );
});

// Get most common scanned topics
router.get("/common-topics", async (req, res) => {
    db.all(
        "SELECT topic, COUNT(*) AS count FROM scans GROUP BY topic ORDER BY count DESC LIMIT 5",
        [],
        (err, rows) => {
            if (err) {
                console.error("Error fetching common topics:", err);
                return res.status(500).json({ message: "Internal server error" });
            }
            res.json(rows);
        }
    );
});

// Get top users by scans and credit usage
router.get("/top-users", async (req, res) => {
    db.all(
        "SELECT u.username, COUNT(s.id) AS total_scans, u.credits FROM users u LEFT JOIN scans s ON u.id = s.user_id GROUP BY u.id ORDER BY total_scans DESC LIMIT 5",
        [],
        (err, rows) => {
            if (err) {
                console.error("Error fetching top users:", err);
                return res.status(500).json({ message: "Internal server error" });
            }
            res.json(rows);
        }
    );
});

// Get credit usage statistics
router.get("/credit-usage", async (req, res) => {
    db.get(
        "SELECT SUM(requested_credits) AS total_requested, SUM(CASE WHEN status='approved' THEN requested_credits ELSE 0 END) AS total_approved FROM credit_requests",
        [],
        (err, row) => {
            if (err) {
                console.error("Error fetching credit usage:", err);
                return res.status(500).json({ message: "Internal server error" });
            }
            res.json(row);
        }
    );
});

module.exports = router;
