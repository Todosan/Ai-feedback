const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { validateResponses, generateInsurancePrompt } = require('../utils/validation');
const INSURANCE_PROMPT_TEMPLATE = require('../utils/prompts');
const router = express.Router();

// Initialize Google Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// POST: Start Insurance Recommendation Process
router.post('/start-recommendation', async (req, res) => {
    const { userResponse, questionCount = 0 } = req.body;

    try {
        if (questionCount >= 6) {
            return res.json({
                message: "Recommendation process complete. Preparing the final recommendations.",
                isComplete: true
            });
        }

        const prompt = generateInsurancePrompt(userResponse, questionCount, INSURANCE_PROMPT_TEMPLATE);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(prompt);
        const response = result.response.text();

        res.json({ message: response, questionCount: questionCount + 1 });
    } catch (error) {
        console.error('Error starting recommendation process:', error.message);
        res.status(500).json({ error: 'Failed to start recommendation process', details: error.message });
    }
});

// POST: Get Final Recommendation
router.post('/get-recommendation', async (req, res) => {
    const { responses } = req.body;

    try {
        validateResponses(responses);

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
        const recommendation = JSON.parse(result.response.text());

        res.json({ recommendation });
    } catch (error) {
        console.error('Error generating recommendation:', error.message);
        res.status(500).json({ error: 'Failed to generate recommendation', details: error.message });
    }
});

module.exports = router;
