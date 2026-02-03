import { Router } from 'express';
import { register, login } from '../controllers/authController';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);

router.get('/me', authMiddleware, (req: AuthRequest, res) => {
    res.json(req.user);
});

export default router;
