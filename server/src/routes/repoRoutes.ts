import { Router } from 'express';
import { createRepository, listRepositories } from '../controllers/repoController';
import { getCommits, getTree, getBlob, getBranches, updateFile, compareBranches, createBranch } from '../controllers/gitViewController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.post('/', createRepository);
router.get('/', listRepositories);

// Git View Routes
router.get('/:name/commits', getCommits);
router.get('/:name/tree', getTree);
router.get('/:name/tree/:sha', getTree);
router.get('/:name/blob/:sha', getBlob);
router.get('/:name/branches', getBranches);
router.get('/:name/compare', compareBranches);
router.post('/:name/branches', authMiddleware, createBranch);
router.post('/:name/files', authMiddleware, updateFile);

export default router;
