function validateResponses(responses) {
    if (!responses || !Array.isArray(responses) || responses.length === 0) {
        throw new Error('Responses are required and should be an array.');
    }
}

function generateInsurancePrompt(userResponse, questionCount, template) {
    return `
        ${template}
        This is question ${questionCount + 1}.
        User response so far: ${userResponse || 'None yet'}.
        Continue asking relevant questions about the user's needs to provide the best insurance recommendation.
    `;
}

module.exports = { validateResponses, generateInsurancePrompt };
