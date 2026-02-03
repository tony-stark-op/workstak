import { Router } from 'express';
import { handleGitRequest } from '../controllers/gitHttpController';

const router = Router();

// Match all routes under /git
// Note: We use a wildcard to capture everything
// Match all routes using regex or wildcard that is compatible with express 4/5
router.use('/', handleGitRequest);

export default router;
