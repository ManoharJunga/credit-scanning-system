const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { findUserByUsername, updateCredits } = require("../models/userModel");
const db = require("../database");

const router = express.Router();

// Configure Multer storage to save files with original extensions
const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    }
});

const upload = multer({ storage }).any(); // Accepts any file field name

// 📌 File Upload Route
router.post("/", upload, async (req, res) => {  
    try {
        console.log("📤 File upload request received");

        const { username } = req.body;
        const files = req.files;  // Use req.files instead of req.file

        console.log("🛠️ Username:", username);
        console.log("📁 Uploaded Files:", files);

        if (!files || files.length === 0) {
            console.log("⚠️ No file uploaded");
            return res.status(400).json({ message: "No file uploaded" });
        }

        const file = files[0];  // Retrieve the first file from the array

        // Get user details
        const user = await findUserByUsername(username);
        console.log("👤 User found:", user);

        if (!user) {
            console.log("❌ User not found");
            return res.status(404).json({ message: "User not found" });
        }

        // Check credits
        if (user.credits <= 0) {
            console.log("⚠️ Not enough credits");
            return res.status(400).json({ message: "Not enough credits to upload" });
        }

        // Deduct 1 credit per upload
        const updatedCredits = user.credits - 1;
        console.log("💰 Updated Credits:", updatedCredits);

        const updateResult = await updateCredits(user.id, updatedCredits);
        console.log("📝 Credits Updated in DB:", updateResult);

        // Insert file details into the uploads table
        const sql = "INSERT INTO uploads (filename, user_id, uploaded_at) VALUES (?, ?, CURRENT_TIMESTAMP)";
        const params = [file.filename, user.id];

        await new Promise((resolve, reject) => {
            db.run(sql, params, function (err) {
                if (err) {
                    console.log("❌ Error inserting file details:", err);
                    reject(err);
                } else {
                    console.log("✅ File details saved in DB");
                    resolve(this.lastID);
                }
            });
        });

        res.json({
            message: "File uploaded successfully!",
            filename: file.filename,
            filePath: `/uploads/${file.filename}`,
            updatedCredits,
        });

    } catch (error) {
        console.error("❌ Error handling file upload:", error);
        res.status(500).json({ message: "Server error" });
    }
});




// 📌 Fetch User's Uploaded Files
router.get("/uploads/:username", (req, res) => {
    const { username } = req.params;

    db.get(`SELECT id FROM users WHERE username = ?`, [username], (err, user) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Database error" });
        }
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Fetch uploaded files for the user
        db.all(`SELECT filename, uploaded_at FROM uploads WHERE user_id = ?`, [user.id], (err, files) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ message: "Database error" });
            }
            if (files.length === 0) {
                return res.status(404).json({ message: "No uploads found for this user" });
            }

            // Return list of files with URLs
            const fileList = files.map(file => ({
                filename: file.filename,
                uploaded_at: file.uploaded_at,
                url: `/uploads/${file.filename}`
            }));

            res.json(fileList);
        });
    });
});

// 📌 Serve Static Files (Make Files Accessible)
router.get("/uploads/file/:filename", (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(__dirname, "../uploads", filename);

    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            return res.status(404).json({ message: "File not found" });
        }
        res.sendFile(filePath);
    });
});

module.exports = router;
