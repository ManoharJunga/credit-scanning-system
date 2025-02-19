const db = require('../database'); // Ensure you are importing the SQLite database

// Endpoint for requesting additional credits
const requestCredits = async (req, res) => {
    const { userId, requestedCredits } = req.body;

    if (!userId || !requestedCredits) {
        return res.status(400).json({ message: 'Missing required fields.' });
    }

    try {
        // Fetch user details from SQLite
        db.get("SELECT * FROM users WHERE username = ?", [userId], (err, user) => {
            if (err) {
                console.error("❌ Database error:", err);
                return res.status(500).json({ message: "Internal server error" });
            }

            if (!user) {
                console.log(`❌ User not found: ${userId}`);
                return res.status(404).json({ message: "User not found." });
            }

            console.log("✅ User found:", user);

            if (user.daily_credit_used >= user.credits) {
                console.log(`📝 Submitting credit request for ${user.username} - Amount: ${requestedCredits}`);

                db.run(
                    "INSERT INTO credit_requests (user_id, requested_credits) VALUES (?, ?)",
                    [user.id, requestedCredits],
                    function (insertErr) {
                        if (insertErr) {
                            console.error("❌ Error inserting credit request:", insertErr);
                            return res.status(500).json({ message: "Error processing credit request." });
                        }

                        console.log(`✅ Credit request inserted with ID: ${this.lastID}`);

                        res.json({
                            success: true,
                            message: "Credit request submitted successfully.",
                            requestId: this.lastID,
                        });
                    }
                );
            } else {
                console.log("❌ User has not used all credits yet.");
                return res.status(400).json({ message: "You have not used all your credits yet." });
            }
        });
    } catch (error) {
        console.error("❌ Error in requesting credits:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};


// Endpoint for admin to approve or deny credit requests
const manageCreditRequest = async (req, res) => {
    const { requestId, action } = req.body;

    if (!requestId || !action) {
        return res.status(400).json({ message: 'Missing requestId or action.' });
    }

    try {
        let statusUpdate = action === 'approve' ? 'approved' : action === 'deny' ? 'denied' : null;
        if (!statusUpdate) {
            return res.status(400).json({ message: 'Invalid action.' });
        }

        db.run(
            "UPDATE credit_requests SET status = ? WHERE id = ?",
            [statusUpdate, requestId],
            function (err) {
                if (err) {
                    console.error("❌ Error updating credit request:", err);
                    return res.status(500).json({ message: "Error processing request." });
                }

                console.log(`✅ Credit request ${requestId} updated to ${statusUpdate}`);
                return res.json({ message: `Credit request ${statusUpdate}.` });
            }
        );
    } catch (error) {
        console.error("❌ Error managing credit request:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};



module.exports = { requestCredits, manageCreditRequest };
