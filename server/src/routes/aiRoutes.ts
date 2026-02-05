import { Router } from 'express';
import { refineCode } from '../controllers/aiController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.post('/refine', authMiddleware, refineCode);

export default router;
