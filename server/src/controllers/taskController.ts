import { Request, Response } from 'express';
import Task from '../models/Task';
import emailService from '../services/emailService';

export const getTasks = async (req: Request, res: Response) => {
    try {
        const { project } = req.query;
        const filter = project ? { project } : {};
        const tasks = await Task.find(filter)
            .populate('assignee', 'username email')
            .sort({ position: 1 });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
};

export const createTask = async (req: Request, res: Response) => {
    try {
        const { title, description, project, priority, assignee } = req.body;

        // Auto-assign position at end of list
        const count = await Task.countDocuments({ project, status: 'todo' });

        const newTask = new Task({
            title,
            description,
            project,
            priority,
            assignee,
            position: count,
        });

        await newTask.save();
        const populated = await newTask.populate('assignee', 'username email');
        res.status(201).json(populated);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create task' });
    }
};

export const updateTask = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const task = await Task.findByIdAndUpdate(id, updates, { new: true })
            .populate('assignee', 'username email');

        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        res.json(task);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update task' });
    }
};

export const deleteTask = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as any).user?.id || 'Unknown User'; // Assuming Auth middleware attaches user

        // Find task first to get details for email
        const task = await Task.findById(id).populate('assignee');

        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        // Send Email Notification
        // Note: Using imported EmailService
        await emailService.sendTaskDeletionNotification(task, userId);

        // Delete Task use deleteOne()
        await task.deleteOne();

        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Delete Task Error:', error);
        res.status(500).json({ error: 'Failed to delete task' });
    }
};
