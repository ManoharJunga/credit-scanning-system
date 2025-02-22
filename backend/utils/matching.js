const { GoogleGenerativeAI } = require("@google/generative-ai");
const fetch = require("node-fetch");
require("dotenv").config();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * AI-Based Document Matching
 * @param {string} inputText - The text to match against stored documents.
 * @param {Array} documents - List of stored documents.
 * @returns {Promise<Array>} - List of matched documents.
 */
async function aiBasedMatching(inputText, documents) {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const filteredDocs = documents.filter(d => d.content);
    if (filteredDocs.length === 0) {
        return "No valid documents found for matching.";
    }

    // 🚀 Improved Prompt for Strict JSON Output
    const prompt = `
    **Task:** Identify the most relevant stored documents for the given input text and assign a similarity score.

    **Input Text:**  
    "${inputText}"

    **Documents to Compare:**  
    ${filteredDocs.map((d, index) => `Document ${index + 1}: (${d.filename})\n"${d.content.substring(0, 300)}..."`).join("\n\n")}

    **Instructions for AI:**  
    - Analyze the semantic meaning, context, and key phrases.  
    - Assign a **similarity score (0-100%)** for each document based on relevance.  
    - Respond **ONLY with valid JSON format** as follows:  

      \`\`\`json
      [
        { "filename": "Document1.txt", "similarity": 85 },
        { "filename": "Document2.txt", "similarity": 72 }
      ]
      \`\`\`

    - **Do NOT include any explanations, text, or extra formatting**—only return JSON.  
    - Ensure that similarity scores **accurately reflect semantic relevance**, not just word matches.
    `;

    try {
        const result = await model.generateContent(prompt);
        const resultText = result.response.text().trim(); // Ensure clean response

        // 🔥 Fix: Extract JSON using regex
        const jsonMatch = resultText.match(/\[\s*{[\s\S]*}\s*\]/); // Matches JSON array
        if (!jsonMatch) throw new Error("Invalid JSON format from AI");

        const matches = JSON.parse(jsonMatch[0]); // Convert AI output to object

        return Array.isArray(matches) ? matches : "No valid AI matches found.";
    } catch (error) {
        console.error("❌ Error in AI-based matching:", error);
        return "AI matching failed due to an error.";
    }
}


/**
 * Extracts meaningful keywords for better plagiarism checks.
 * @param {string} text - The input text.
 * @returns {string} - Extracted keywords.
 */
function extractKeywords(text) {
    return text
        .replace(/[^\w\s]/gi, "") // Remove punctuation
        .split(" ") // Split into words
        .filter(word => word.length > 3) // Keep only words with more than 3 letters
        .slice(0, 10) // Take only the first 10 words
        .join(" "); // Join into a query
}


/**
 * Internet Plagiarism Check using Google Search API
 * @param {string} text - The text to check for plagiarism.
 * @returns {Promise<Array>} - List of online matches.
 */
async function checkPlagiarismOnline(text) {
    const searchQuery = encodeURIComponent(extractKeywords(text)); // Extract keywords for better results
    const searchUrl = `https://www.googleapis.com/customsearch/v1?q=${searchQuery}&key=${process.env.GOOGLE_SEARCH_API_KEY}&cx=${process.env.SEARCH_ENGINE_ID}`;

    try {
        const response = await fetch(searchUrl);
        const data = await response.json();

        if (data.items && data.items.length > 0) {
            return data.items.map(item => ({
                title: item.title,
                link: item.link
            }));
        } else {
            return [];
        }
    } catch (error) {
        console.error("❌ Error in plagiarism check:", error);
        return [];
    }
}

module.exports = { aiBasedMatching, checkPlagiarismOnline };
