import { GoogleGenerativeAI } from '@google/generative-ai';

export class AIService {
    private genAI: GoogleGenerativeAI;
    private model: any;

    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error('GEMINI_API_KEY is not set');
            throw new Error('GEMINI_API_KEY is required');
        }
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
    }

    async generateRefinement(code: string, instruction: string): Promise<string> {
        try {
            const prompt = `
You are an expert software engineer.
Your task is to modify the following code based on the user's instruction.
Return ONLY the modified code. Do not include markdown formatting (like \`\`\`typescript), just the raw code.
Do not explain your changes unless asked in comments within the code.

Instruction: ${instruction}

Code:
${code}
            `;

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            let text = response.text();

            // Cleanup markdown if Gemini adds it despite instructions
            text = text.replace(/^```[a-z]*\n/, '').replace(/```$/, '');

            return text.trim();
        } catch (error) {
            console.error('AI Generation Error:', error);
            throw new Error('Failed to generate refinement');
        }
    }
}

export const aiService = new AIService();
