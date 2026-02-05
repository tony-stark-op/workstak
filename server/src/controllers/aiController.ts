import { Request, Response } from 'express';
import { aiService } from '../services/aiService';

export const refineCode = async (req: Request, res: Response) => {
    try {
        const { code, instruction } = req.body;

        if (!code || !instruction) {
            return res.status(400).json({ error: 'Code and instruction are required' });
        }

        const refinedCode = await aiService.generateRefinement(code, instruction);
        res.json({ refinedCode });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to refine code' });
    }
};
