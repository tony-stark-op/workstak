import { Request, Response } from 'express';
import PullRequest from '../models/PullRequest';
import { GitService } from '../services/gitService';
import path from 'path';

const gitService = new GitService();

export const createPR = async (req: Request, res: Response) => {
    try {
        const repoName = req.params.repoName as string;
        const { title, description, sourceBranch, targetBranch, tasks } = req.body;

        console.log('[Create PR] Request Body:', req.body);
        console.log('[Create PR] User:', (req as any).user);

        // @ts-ignore
        const userId = req.user.id;

        // Validating data
        if (!userId) {
            console.error('[Create PR] User ID missing from token');
            return res.status(401).json({ error: 'User ID missing from token' });
        }

        // TODO: Add branch validation when GitService.getBranches() is implemented
        // This would check if sourceBranch and targetBranch exist in the repository

        const pr = new PullRequest({
            title,
            description,
            sourceBranch,
            targetBranch,
            repository: repoName,
            createdBy: userId,
            reviewers: [], // Initialize empty reviewers array
            tasks: tasks || [] // Linked Tasks
        });

        await pr.save();
        res.status(201).json(pr);
    } catch (error) {
        console.error('[Create PR] Error:', error);
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

// Replacement 1: getPRDetails
export const getPRDetails = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const pr = await PullRequest.findById(id)
            .populate('createdBy', 'firstName lastName email')
            .populate('reviewers', 'firstName lastName email')
            .populate('tasks', 'title status priority'); // Populate Tasks
        if (!pr) return res.status(404).json({ error: 'PR not found' });
        res.json(pr);
    } catch (error) {
        console.error('[Get PR Details] Error:', error);
        res.status(500).json({ error: 'Failed to fetch PR details' });
    }
};

// Replacement 2: getPRDiff
export const getPRDiff = async (req: Request, res: Response) => {
    try {
        const repoName = req.params.repoName as string;
        const { id } = req.params;
        const pr = await PullRequest.findById(id);
        if (!pr) return res.status(404).json({ error: 'PR not found' });

        const diff = await gitService.getDiff(repoName, pr.sourceBranch, pr.targetBranch);
        res.json({ diff });
    } catch (error) {
        console.error('[Get PR Diff] Error:', error);
        res.status(500).json({ error: 'Failed to fetch diff' });
    }
};

// Replacement 3: mergePR (just in case)
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

        // Perform actual Git Merge
        try {
            await gitService.mergeBranches(pr.repository, pr.sourceBranch, pr.targetBranch);
        } catch (err: any) {
            return res.status(409).json({ error: err.message || 'Merge failed due to conflicts or git error' });
        }

        await pr.save();

        console.log(`[PR Merge] PR #${id} merged successfully.`);

        res.json({
            message: 'PR merged successfully',
            pr
        });
    } catch (error) {
        console.error('Merge PR Error:', error);
        res.status(500).json({ error: 'Failed to merge PR' });
    }
};
