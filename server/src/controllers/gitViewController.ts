import { Request, Response } from 'express';
import { GitService } from '../services/gitService';

const gitService = new GitService();

export const getCommits = async (req: Request, res: Response) => {
    try {
        const { name } = req.params;
        const { branch } = req.query;
        const commits = await gitService.getCommits(name as string, (branch as string) || 'master');
        res.json(commits);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch commits' });
    }
};

export const getTree = async (req: Request, res: Response) => {
    try {
        const { name, sha } = req.params;
        const tree = await gitService.getFileTree(name as string, (sha as string) || 'master');
        res.json(tree);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch file tree' });
    }
};

export const getBlob = async (req: Request, res: Response) => {
    try {
        const { name, sha } = req.params;
        const content = await gitService.getFileContent(name as string, sha as string);
        res.send(content);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch content' });
    }
};
