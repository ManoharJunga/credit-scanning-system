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

const manageCreditRequest = async (req, res) => {
    const { requestId, action } = req.body;

    if (!requestId || !action) {
        return res.status(400).json({ message: 'Missing requestId or action.' });
    }

    try {
        // Fetch the credit request details
        db.get("SELECT user_id, requested_credits FROM credit_requests WHERE id = ?", [requestId], (err, request) => {
            if (err) {
                console.error("❌ Error fetching credit request:", err);
                return res.status(500).json({ message: "Error fetching request." });
            }
            
            if (!request) {
                return res.status(404).json({ message: "Credit request not found." });
            }

            const { user_id, requested_credits } = request;

            if (action === 'approve') {
                // Approve the request and update the user's credits
                db.run("UPDATE users SET credits = credits + ? WHERE id = ?", [requested_credits, user_id], function (updateErr) {
                    if (updateErr) {
                        console.error("❌ Error updating user credits:", updateErr);
                        return res.status(500).json({ message: "Error updating credits." });
                    }

                    // Update the credit request status to approved
                    db.run("UPDATE credit_requests SET status = 'approved' WHERE id = ?", [requestId], function (statusErr) {
                        if (statusErr) {
                            console.error("❌ Error updating credit request status:", statusErr);
                            return res.status(500).json({ message: "Error updating request status." });
                        }

                        console.log(`✅ Credit request ${requestId} approved. User ${user_id} credited with ${requested_credits} credits.`);
                        return res.json({ message: `Credit request approved. ${requested_credits} credits added to user.` });
                    });
                });
            } else if (action === 'deny') {
                // Deny the request
                db.run("UPDATE credit_requests SET status = 'denied' WHERE id = ?", [requestId], function (denyErr) {
                    if (denyErr) {
                        console.error("❌ Error updating credit request status:", denyErr);
                        return res.status(500).json({ message: "Error processing request." });
                    }

                    console.log(`✅ Credit request ${requestId} denied.`);
                    return res.json({ message: "Credit request denied." });
                });
            } else {
                return res.status(400).json({ message: 'Invalid action. Use "approve" or "deny".' });
            }
        });
    } catch (error) {
        console.error("❌ Error managing credit request:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};


module.exports = { requestCredits, manageCreditRequest };
