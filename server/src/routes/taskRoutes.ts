import { Router } from 'express';
import { getTasks, createTask, updateTask } from '../controllers/taskController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.use(authMiddleware); // Protect all task routes

router.get('/', getTasks);
router.post('/', createTask);
router.patch('/:id', updateTask);

export default router;
