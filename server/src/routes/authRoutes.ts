import { Router } from 'express';
import { register, login, changePassword, getUsers, updateProfile } from '../controllers/authController';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/change-password', changePassword);
router.put('/profile', authMiddleware, updateProfile); // <--- NEW ROUTE

// List all users (Protected)
router.get('/users', authMiddleware, getUsers);

router.get('/me', authMiddleware, (req: AuthRequest, res) => {
    res.json(req.user);
});

export default router;
