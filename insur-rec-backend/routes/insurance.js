const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { validateResponses, generateInsurancePrompt } = require('../utils/validation');
const INSURANCE_PROMPT_TEMPLATE = require('../utils/prompts');
const router = express.Router();
const app = express
require("dotenv").config();

// Initialize Google Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// POST: Start Insurance Recommendation Process
router.post('/start-recommendation', async (req, res, next) => {
    const { userResponse, questionCount = 0 } = req.body;

    try {
        if (questionCount >= 6) {
            return res.json({
                message: "Recommendation process complete. Preparing the final recommendations.",
                isComplete: true,
            });
        }

        const prompt = generateInsurancePrompt(userResponse, questionCount, INSURANCE_PROMPT_TEMPLATE);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(prompt);
        const response = result.response.text();

        res.json({ message: response, questionCount: questionCount + 1 });
    } catch (error) {
        next(error); // Pass the error to the error handler middleware
    }
});

// POST: Get Final Recommendation
router.post('/get-recommendation', async (req, res, next) => {
    const { responses } = req.body;

    try {
        // Validate responses (make sure 'responses' is valid)
        if (!Array.isArray(responses) || responses.length === 0) {
            throw new Error("Invalid responses array");
        }

        // Generate recommendation prompt based on responses
        const prompt = `
            ${INSURANCE_PROMPT_TEMPLATE}
            Based on the user's answers (${JSON.stringify(responses)}), recommend the most suitable insurance policy.
            Provide the recommendation in a JSON object with:
            - policyName
            - description
            - reasons
        `;

        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(prompt);

        // Log the raw response from the AI model for debugging
        let rawResponse = result.response.text();
        console.log("Raw response from AI model:", rawResponse); // Log the raw response

        // Clean the response from code block markers
        rawResponse = rawResponse.replace(/^```json\s*/g, '').replace(/\s*```$/g, ''); // Remove code block markers

        // Manually strip extra newlines or spaces if any
        rawResponse = rawResponse.replace(/\s+/g, ' ').trim(); // Clean extra spaces/newlines

        console.log("Cleaned raw response:", rawResponse); // Log cleaned response

        let recommendation;

        // Attempt to parse the cleaned response as JSON
        try {
            // Ensure the response is valid JSON before proceeding
            recommendation = JSON.parse(rawResponse);

            // Check if the necessary fields exist in the parsed response
            if (!recommendation.policyName || !recommendation.description || !recommendation.reasons) {
                throw new Error("Incomplete recommendation data: missing required fields.");
            }
        } catch (error) {
            // Detailed logging for JSON parsing errors
            console.error("Error parsing AI model response:", error.message);

            return res.status(500).json({
                error: 'Failed to generate a valid recommendation',
                details: error.message,
            });
        }

        // Return the final recommendation response
        res.json({ recommendation });
    } catch (error) {
        // Detailed logging for any other errors
        console.error('Error in /get-recommendation route:', error.message);
        res.status(500).json({
            error: 'Something went wrong in the backend',
            details: error.message,
        });
    }
});


// Centralized error handling middleware
router.use((err, req, res, next) => {
    console.error('Error occurred:', err.message);
    res.status(500).json({ error: 'Something went wrong', details: err.message });
});

module.exports = router;
