const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.generateTaskSummary = async (taskDescription, comments = []) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        // Construct prompt
        let prompt = `Summarize the following task into a concise, actionable summary (max 2 sentences).
    Task Description: ${taskDescription}
    `;

        if (comments.length > 0) {
            prompt += `\nComments Context:\n${comments.join('\n')}`;
        }

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Gemini API Error:", error);
        return "Summary generation failed.";
    }
};
