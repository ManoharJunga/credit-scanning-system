const db = require('../database');

// Function to create a new user
const createUser = async (username, hashedPassword, role) => {
  const sql = 'INSERT INTO users (username, password, role) VALUES (?, ?, ?)';
  return new Promise((resolve, reject) => {
    db.run(sql, [username, hashedPassword, role], function (err) {
      if (err) {
        console.error("Error while creating user:", err);
        return reject(err);
      }
      resolve(this.lastID);  // Resolves with the last inserted user's ID
    });
  });
};

// Function to find a user by username
const findUserByUsername = async (username) => {
  const sql = 'SELECT * FROM users WHERE username = ?';
  return new Promise((resolve, reject) => {
    db.get(sql, [username], (err, row) => {
      if (err) {
        console.error("Error while finding user:", err);
        return reject(err);
      }
      resolve(row);  // Resolves with the user row or null if not found
    });
  });
};

// Function to update user credits
const updateCredits = async (userId, credits) => {
  const sql = 'UPDATE users SET credits = ? WHERE id = ?';
  return new Promise((resolve, reject) => {
    db.run(sql, [credits, userId], function (err) {
      if (err) {
        console.error("Error while updating credits:", err);
        return reject(err);
      }
      resolve(this.changes);  // Resolves with the number of changes (rows affected)
    });
  });
};

// Function to get user's credit details
const getUserCredits = async (username) => {
    const sql = 'SELECT id, username, credits, daily_credit_used FROM users WHERE username = ?';
    return new Promise((resolve, reject) => {
        db.get(sql, [username], (err, row) => {
            if (err) {
                console.error("DB Error while getting user credits:", err);
                return reject(err);
            }
            console.log("Fetched user from DB:", row); // Debugging log
            resolve(row);
        });
    });
};
  
  module.exports = { createUser, findUserByUsername, updateCredits, getUserCredits };
  