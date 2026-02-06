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
        const { name } = req.params;
        const sha = req.params.sha || req.query.sha || 'master';
        const tree = await gitService.getFileTree(name as string, (sha as string));
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

export const getBranches = async (req: Request, res: Response) => {
    try {
        const { name } = req.params;
        const branches = await gitService.getBranches(name as string);
        res.json(branches);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch branches' });
    }
};

export const updateFile = async (req: Request, res: Response) => {
    try {
        const { name } = req.params;
        const { filePath, content, message, branch } = req.body;
        // @ts-ignore
        const user = req.user; // populated by auth middleware

        if (!user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        // Fetch full user to get names for git config
        const fullUser = await import('../models/User').then(m => m.default.findById(user.id));
        if (!fullUser) return res.status(401).json({ error: 'User not found' });

        await gitService.updateFile(name as string, filePath, content, message, fullUser, branch || 'master');
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update file' });
    }
};

export const compareBranches = async (req: Request, res: Response) => {
    try {
        const { name } = req.params;
        const { base, head } = req.query;

        if (!base || !head) {
            return res.status(400).json({ error: 'Base and head branches are required' });
        }

        const [commits, diff] = await Promise.all([
            gitService.getCommitsBetween(name as string, base as string, head as string),
            gitService.getDiff(name as string, head as string, base as string) // Note: getDiff uses target...source, so head...base for change from base to head?
            // Wait, getDiff does `git diff target...source`. If I want changes "IN source THAT ARE NOT IN target", it should be target...source.
            // If source=feature, target=master. `git diff master...feature`.
            // My service implementation: `git diff ${target}...${source}`
            // If I call getDiff(repo, source=head, target=base) -> `git diff base...head` -> Correct.
        ]);

        res.json({ commits, diff });
    } catch (error) {
        console.error('Compare Error:', error);
        res.status(500).json({ error: 'Failed to compare branches' });
    }
};

export const createBranch = async (req: Request, res: Response) => {
    try {
        const { name } = req.params;
        const { branchName, sourceBranch } = req.body;

        if (!branchName) {
            return res.status(400).json({ error: 'Branch name is required' });
        }

        await gitService.createBranch(name as string, branchName, sourceBranch || 'master');
        res.status(201).json({ success: true, message: `Branch ${branchName} created` });
    } catch (error: any) {
        console.error('Create Branch Error:', error);
        if (error.message.includes('does not exist') || error.message.includes('already exists')) {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: error.message });
    }
};

export const deleteBranch = async (req: Request, res: Response) => {
    try {
        const { name, branch } = req.params;
        await gitService.deleteBranch(name as string, branch as string);
        res.json({ success: true, message: `Branch ${branch} deleted` });
    } catch (error: any) {
        console.error('Delete Branch Error:', error);
        res.status(500).json({ error: error.message });
    }
};
