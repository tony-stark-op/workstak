import { Router } from 'express';
import { createRepository, listRepositories } from '../controllers/repoController';
import { getCommits, getTree, getBlob } from '../controllers/gitViewController';

const router = Router();

router.post('/', createRepository);
router.get('/', listRepositories);

router.get('/:name/commits', getCommits);
router.get('/:name/tree', getTree);
router.get('/:name/tree/:sha', getTree);
router.get('/:name/blob/:sha', getBlob);

export default router;
