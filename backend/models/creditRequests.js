const db = require('../database');

// Function to create a credit request from a user
const createCreditRequest = async (userId, requestedCredits) => {
  const sql = 'INSERT INTO credit_requests (user_id, requested_credits, status) VALUES (?, ?, "pending")';
  return new Promise((resolve, reject) => {
    db.run(sql, [userId, requestedCredits], function (err) {
      if (err) {
        console.error("Error while creating credit request:", err);
        return reject(err);
      }
      resolve(this.lastID);  // Resolves with the last inserted credit request ID
    });
  });
};

// Function to approve credit request (called by admin)
const approveCreditRequest = async (requestId) => {
  const sql = 'UPDATE credit_requests SET status = "approved" WHERE id = ?';
  return new Promise((resolve, reject) => {
    db.run(sql, [requestId], function (err) {
      if (err) {
        console.error("Error while approving credit request:", err);
        return reject(err);
      }
      resolve("Credit request approved.");
    });
  });
};

// Function to deny credit request (called by admin)
const denyCreditRequest = async (requestId) => {
  const sql = 'UPDATE credit_requests SET status = "denied" WHERE id = ?';
  return new Promise((resolve, reject) => {
    db.run(sql, [requestId], function (err) {
      if (err) {
        console.error("Error while denying credit request:", err);
        return reject(err);
      }
      resolve("Credit request denied.");
    });
  });
};

module.exports = {
  createCreditRequest,
  approveCreditRequest,
  denyCreditRequest
};
