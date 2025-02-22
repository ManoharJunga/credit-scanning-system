const db = require("../database");

class Scan {
  static addScan(userId, topic, textContent, callback) {
    const query = `INSERT INTO scans (user_id, topic, text_content) VALUES (?, ?, ?)`;
    db.run(query, [userId, topic, textContent], function (err) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, { id: this.lastID, userId, topic, textContent });
      }
    });
  }

  static getScans(callback) {
    const query = `SELECT * FROM scans ORDER BY timestamp DESC`;
    db.all(query, [], (err, rows) => {
      callback(err, rows);
    });
  }
}

module.exports = Scan;
