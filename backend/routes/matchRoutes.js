const express = require("express");
const router = express.Router();
const db = require("../database"); // Ensure the database is correctly configured
const { aiBasedMatching } = require("../utils/matching");

// Utility function to fetch documents from DB
// Utility function to fetch unique documents from DB
const getStoredDocuments = async () => {
    return new Promise((resolve, reject) => {
        db.all("SELECT DISTINCT filename, content FROM uploads", [], (err, rows) => {
            if (err) {
                console.error("❌ Database Query Error:", err);
                reject(err);
            } else {
                // Filter duplicates based on content
                const uniqueDocs = [];
                const seenContent = new Set();

                rows.forEach(row => {
                    if (!seenContent.has(row.content)) {
                        seenContent.add(row.content);
                        uniqueDocs.push(row);
                    }
                });

                resolve(uniqueDocs);
            }
        });
    });
};



// Route to Check Matches & Plagiarism
router.post("/match", async (req, res) => {
    try {
        const { text } = req.body;

        if (!text || text.trim() === "") {
            return res.status(400).json({ message: "No text provided." });
        }

        // 🔍 Get stored documents from database
        const docs = await getStoredDocuments();

        if (!docs || docs.length === 0) {
            return res.json({ message: "No stored documents found.", aiMatches: [], plagiarismResults: [] });
        }

        // 📌 Filter valid documents with content
        const validDocs = docs
            .filter(doc => doc.content && doc.filename)
            .map(doc => ({ filename: doc.filename, content: doc.content.toLowerCase() })); // Normalize text for better matching

        if (validDocs.length === 0) {
            return res.json({ message: "No valid documents with content found.", aiMatches: [], plagiarismResults: [] });
        }

        let aiMatches = [];
        let plagiarismResults = null;

        // ✅ AI-Based Matching
        try {
            aiMatches = await aiBasedMatching(text, validDocs);
        } catch (aiError) {
            console.error("❌ AI Matching Error:", aiError);
            aiMatches = { error: "AI matching failed due to an error." };
        }

        

        res.json({ aiMatches, plagiarismResults });

    } catch (error) {
        console.error("❌ Server Error in /match:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});

module.exports = router;
