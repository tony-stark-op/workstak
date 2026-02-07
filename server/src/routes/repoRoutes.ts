import { Router } from 'express';
import { createRepository, listRepositories, deleteRepository } from '../controllers/repoController';
import { getCommits, getTree, getBlob, getBranches, updateFile, compareBranches, createBranch, deleteBranch } from '../controllers/gitViewController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.post('/', createRepository);
router.get('/', listRepositories);
router.delete('/:name', authMiddleware, deleteRepository);

// Git View Routes
router.get('/:name/commits', getCommits);
router.get('/:name/tree', getTree);
router.get('/:name/tree/:sha', getTree);
router.get('/:name/blob/:sha', getBlob);
router.get('/:name/branches', getBranches);
router.get('/:name/compare', compareBranches);
router.post('/:name/branches', authMiddleware, createBranch);
router.delete('/:name/branches/(.*)', authMiddleware, deleteBranch);
router.post('/:name/files', authMiddleware, updateFile);

export default router;
