const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const aiService = require('../services/aiService');
const Task = require('../models/Task');

router.use(auth);

router.post('/summary', async (req, res) => {
    try {
        const { taskId } = req.body;
        const task = await Task.findById(taskId);
        if (!task) return res.status(404).json({ message: 'Task not found' });

        // Mock comments logic for now, can extend later
        const summary = await aiService.generateTaskSummary(task.description || task.title);
        res.json({ summary });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
