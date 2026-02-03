import { Router } from 'express';
import { authMiddleware as authenticate } from '../middleware/authMiddleware';
import {
    createPR,
    getPRs,
    getPRDetails,
    getPRDiff
} from '../controllers/pullRequestController';

const router = Router({ mergeParams: true });

// Routes relative to /api/repos/:repoName/prs
router.post('/', authenticate, createPR);
router.get('/', authenticate, getPRs);
router.get('/:id', authenticate, getPRDetails);
router.get('/:id/diff', authenticate, getPRDiff);

export default router;
