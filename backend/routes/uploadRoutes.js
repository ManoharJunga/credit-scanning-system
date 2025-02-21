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
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext).replace(/\s+/g, "_");
        const uniqueSuffix = Date.now(); // Unique identifier
        cb(null, `${name}_${uniqueSuffix}${ext}`); // Prevent overwriting
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

router.delete("/delete/:filename", (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(__dirname, "../uploads", filename);

    // Check if file exists
    if (fs.existsSync(filePath)) {
        fs.unlink(filePath, (err) => {
            if (err) {
                return res.status(500).json({ message: "Error deleting file" });
            }
            res.json({ message: "File deleted successfully" });
        });
    } else {
        res.status(404).json({ message: "File not found" });
    }
});

// 📌 File Upload Route with AI Matching
router.post("/", upload, async (req, res) => {
    try {
        console.log("📤 File upload request received");

        const { username } = req.body;
        const files = req.files;

        if (!files || files.length === 0) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const file = files[0];

        // Get user details
        const user = await findUserByUsername(username);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check credits
        if (user.credits <= 0) {
            return res.status(400).json({ message: "Not enough credits to upload" });
        }

        // Deduct 1 credit per upload
        const updatedCredits = user.credits - 1;
        await updateCredits(user.id, updatedCredits);

        // Read file content if it's a text-based file (for AI processing)
        let content = null;
        const allowedTextTypes = [".txt", ".md", ".json"];
        if (allowedTextTypes.includes(path.extname(file.filename))) {
            content = fs.readFileSync(file.path, "utf8");
        }

        // Insert file details into the uploads table
        const sql = "INSERT INTO uploads (filename, user_id, uploaded_at, content) VALUES (?, ?, CURRENT_TIMESTAMP, ?)";
        const params = [file.filename, user.id, content];

        let documentId;
        await new Promise((resolve, reject) => {
            db.run(sql, params, function (err) {
                if (err) reject(err);
                else {
                    documentId = this.lastID;
                    resolve();
                }
            });
        });

        // Trigger AI-based matching if content is available
        let aiMatches = [];
        if (content) {
            const docs = await new Promise((resolve, reject) => {
                db.all("SELECT * FROM uploads WHERE id != ?", [documentId], (err, docs) => {
                    if (err) reject(err);
                    else resolve(docs);
                });
            });

            aiMatches = await aiBasedMatching(content, docs);
        }

        res.json({
            message: "File uploaded successfully!",
            filename: file.filename,
            filePath: `/uploads/${file.filename}`,
            updatedCredits,
            aiMatches, // Returning AI-based matches
        });

    } catch (error) {
        console.error("❌ Error handling file upload:", error);
        res.status(500).json({ message: "Server error" });
    }
});


module.exports = router;
