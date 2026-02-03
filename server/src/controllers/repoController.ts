import { Request, Response } from 'express';
import Repository from '../models/Repository';
import { GitService } from '../services/gitService';

const gitService = new GitService();

export const createRepository = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, description, isPrivate, ownerId } = req.body;

        if (!name) {
            res.status(400).json({ error: 'Repository name is required' });
            return;
        }

        // Check if repo exists in DB
        const existingRepo = await Repository.findOne({ name });

        if (existingRepo) {
            res.status(409).json({ error: 'Repository already exists' });
            return;
        }

        // Init bare repo on disk
        await gitService.initRepo(name);

        // Create DB record
        const repo = new Repository({
            name,
            description,
            isPrivate: !!isPrivate,
            ownerId: ownerId || null, // Optional for now
        });

        await repo.save();

        res.status(201).json(repo);
    } catch (error: any) {
        console.error('Error creating repo:', error);
        res.status(500).json({ error: error.message });
    }
};

export const listRepositories = async (req: Request, res: Response): Promise<void> => {
    try {
        const repos = await Repository.find();
        res.json(repos);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch repositories' });
    }
};
