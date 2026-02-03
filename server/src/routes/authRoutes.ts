import { Router } from 'express';
import { register, login, changePassword } from '../controllers/authController'; // Add changePassword
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/change-password', changePassword); // <--- NEW ROUTE

router.get('/me', authMiddleware, (req: AuthRequest, res) => {
    res.json(req.user);
});

export default router;
