const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { validateResponses, generateInsurancePrompt } = require('../utils/validation');
const SYSTEM_INSTRUCTIONS = require('../utils/prompts');
const router = express.Router();
require('dotenv').config();

// Ensure the API key is available
if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set in environment variables.");
}

// Initialize Google Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// POST: Start Insurance Recommendation Process
router.post('/start-recommendation', async (req, res, next) => {
    const { userResponse, questionCount = 0 } = req.body;

    try {
        // Check if the recommendation process is complete
        if (questionCount >= 5) {
            return res.json({
                message: "Recommendation process complete. Preparing the final recommendations.",
                isComplete: true,
            });
        }

        // Generate the next question based on user response
        const prompt = `${SYSTEM_INSTRUCTIONS}
        Current User Response: ${userResponse || "None provided yet"}
        Question Count: ${questionCount}
        Generate the next question based on the user's previous response.
        `;
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(prompt);
        const response = result.response.text();

        // Send the next question and updated question count
        res.json({ message: response, questionCount: questionCount + 1 });
    } catch (error) {
        console.error("Error in /start-recommendation route:", error.message);
        next(error); // Pass the error to the error handler middleware
    }
});

// POST: Get Final Recommendation
router.post('/get-recommendation', async (req, res, next) => {
    const { responses } = req.body;

    try {
        // Validate responses
        if (!Array.isArray(responses) || responses.length === 0) {
            throw new Error("Invalid responses array provided.");
        }

        // Generate recommendation prompt
        const prompt = `
            ${SYSTEM_INSTRUCTIONS}
            User Responses: ${JSON.stringify(responses)}
            Based on the user's answers, recommend the most suitable insurance policy.
            Provide the recommendation in a JSON object with:
            - policyName
            - description
            - reasons
        `;

        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(prompt);

        // Log and clean the raw response
        let rawResponse = result.response.text();
        console.log("Raw response from AI model:", rawResponse);

        rawResponse = rawResponse.replace(/^```json\s*/g, '').replace(/\s*```$/g, '').trim();
        console.log("Cleaned raw response:", rawResponse);

        let recommendation;

        // Parse the cleaned response
        try {
            recommendation = JSON.parse(rawResponse);

            // Ensure all required fields are present
            if (!recommendation.policyName || !recommendation.description || !recommendation.reasons) {
                throw new Error("Incomplete recommendation data: missing required fields.");
            }
        } catch (error) {
            console.error("Error parsing AI model response:", error.message);
            return res.status(500).json({
                error: "Failed to generate a valid recommendation",
                details: error.message,
            });
        }

        // Send the recommendation
        res.json({ recommendation });
    } catch (error) {
        console.error("Error in /get-recommendation route:", error.message);
        res.status(500).json({
            error: "Something went wrong in the backend",
            details: error.message,
        });
    }
});

// Centralized error handling middleware
router.use((err, req, res, next) => {
    console.error("Error occurred:", err.message);
    res.status(500).json({ error: "Something went wrong", details: err.message });
});

module.exports = router;
