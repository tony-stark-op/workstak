import { Request, Response } from 'express';
import PullRequest from '../models/PullRequest';
import { GitService } from '../services/gitService';
import path from 'path';

// Todo: Instantiate GitService properly
const gitService = new GitService();

export const createPR = async (req: Request, res: Response) => {
    try {
        const repoName = req.params.repoName as string;
        const { title, description, sourceBranch, targetBranch } = req.body;
        // @ts-ignore
        const userId = req.user.userId;

        // TODO: Add branch validation when GitService.getBranches() is implemented
        // This would check if sourceBranch and targetBranch exist in the repository

        const pr = new PullRequest({
            title,
            description,
            sourceBranch,
            targetBranch,
            repository: repoName,
            createdBy: userId,
            reviewers: [] // Initialize empty reviewers array
        });

        await pr.save();
        res.status(201).json(pr);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create PR' });
    }
};

export const getPRs = async (req: Request, res: Response) => {
    try {
        const repoName = req.params.repoName as string;
        const { status } = req.query;

        const filter: any = { repository: repoName };
        if (status) filter.status = status;

        const prs = await PullRequest.find(filter)
            .populate('createdBy', 'username email')
            .sort({ createdAt: -1 });

        res.json(prs);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch PRs' });
    }
};

export const getPRDetails = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const pr = await PullRequest.findById(id)
            .populate('createdBy', 'firstName lastName email')
            .populate('reviewers', 'firstName lastName email');
        if (!pr) return res.status(404).json({ error: 'PR not found' });
        res.json(pr);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch PR details' });
    }
};

export const getPRDiff = async (req: Request, res: Response) => {
    try {
        const repoName = req.params.repoName as string;
        const { id } = req.params;
        const pr = await PullRequest.findById(id);
        if (!pr) return res.status(404).json({ error: 'PR not found' });

        const diff = await gitService.getDiff(repoName, pr.sourceBranch, pr.targetBranch);
        res.json({ diff });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch diff' });
    }
};

export const mergePR = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const pr = await PullRequest.findById(id);

        if (!pr) return res.status(404).json({ error: 'PR not found' });

        if (pr.status !== 'active') {
            return res.status(400).json({ error: 'Only active PRs can be merged' });
        }

        // Update status to merged
        pr.status = 'merged';
        await pr.save();

        console.log(`[PR Merge] PR #${id} marked as merged. Merge logic to be implemented via Git Service.`);

        res.json({
            message: 'PR merged successfully',
            pr
        });
    } catch (error) {
        console.error('Merge PR Error:', error);
        res.status(500).json({ error: 'Failed to merge PR' });
    }
};
