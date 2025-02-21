const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Function to use Gemini AI for document matching
async function aiBasedMatching(inputText, documents) {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Prepare input prompt for Gemini
    const prompt = `Find the most similar documents to the following text:\n\n"${inputText}"\n\nDocuments:\n` +
        documents.map(d => `- ${d.filename}: ${d.content.substring(0, 200)}...`).join("\n");

    // Send request to Gemini
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    return response.text(); // Gemini's AI-generated matches
}

module.exports = { aiBasedMatching };
