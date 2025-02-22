const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { findUserByUsername, updateCredits } = require("../models/userModel");
const db = require("../database");
const pdfParse = require("pdf-parse");

const router = express.Router();
const { createWorker } = require("tesseract.js");


// Configure Multer storage to save files with original extensions
const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext).replace(/\s+/g, "_");
        const uniqueSuffix = Date.now();
        cb(null, `${name}_${uniqueSuffix}${ext}`); // Prevent overwriting
    }
});

const preprocessText = (text) => {
    return text
        .replace(/\s+/g, " ") // Replace multiple spaces/newlines with a single space
        .replace(/[^a-zA-Z0-9.,!? ]/g, "") // Remove special characters (except punctuation)
        .toLowerCase() // Convert to lowercase
        .trim(); // Remove leading/trailing spaces
};

const upload = multer({ storage }).any(); // Accepts any file field name

// Helper function to read file content (if applicable)
const readFileContent = (filePath, ext) => {
    const textFileTypes = [".txt", ".md", ".json"];
    if (textFileTypes.includes(ext)) {
        return fs.readFileSync(filePath, "utf8");
    }
    return null;
};

// 📌 File Upload Route
router.post("/", upload, async (req, res) => {  
    try {
        console.log("📤 File upload request received");

        const { username } = req.body;
        const files = req.files;

        if (!files || files.length === 0) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const file = files[0];
        const fileExt = path.extname(file.filename).toLowerCase();

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

        if (fileExt === ".pdf") {
            const pdfBuffer = fs.readFileSync(file.path);
            const pdfData = await pdfParse(pdfBuffer);
            content = preprocessText(pdfData.text);
        } else if (fileExt === ".png" || fileExt === ".jpg" || fileExt === ".jpeg") {
            content = await extractTextFromImage(file.path); // Use OCR for images
        } else {
            content = preprocessText(readFileContent(file.path, fileExt));
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

        // AI Matching logic (if applicable)
        let aiMatches = [];
        

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


// 📌 Fetch User's Uploaded Files
router.get("/uploads/:username", (req, res) => {
    const { username } = req.params;

    db.get("SELECT id FROM users WHERE username = ?", [username], (err, user) => {
        if (err) return res.status(500).json({ message: "Database error" });
        if (!user) return res.status(404).json({ message: "User not found" });

        db.all("SELECT filename, uploaded_at FROM uploads WHERE user_id = ?", [user.id], (err, files) => {
            if (err) return res.status(500).json({ message: "Database error" });
            if (files.length === 0) return res.status(404).json({ message: "No uploads found for this user" });

            res.json(files.map(file => ({
                filename: file.filename,
                uploaded_at: file.uploaded_at,
                url: `/uploads/${file.filename}`
            })));
        });
    });
});

// 📌 Serve Static Files
router.get("/uploads/file/:filename", (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(__dirname, "../uploads", filename);

    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) return res.status(404).json({ message: "File not found" });
        res.sendFile(filePath);
    });
});

// 📌 Delete File
router.delete("/delete/:filename", (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(__dirname, "../uploads", filename);

    if (fs.existsSync(filePath)) {
        fs.unlink(filePath, (err) => {
            if (err) return res.status(500).json({ message: "Error deleting file" });
            res.json({ message: "File deleted successfully" });
        });
    } else {
        res.status(404).json({ message: "File not found" });
    }
});

module.exports = router;