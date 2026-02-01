const Task = require('../models/Task');
const Project = require('../models/Project');

exports.createTask = async (req, res) => {
    try {
        const { title, description, status, priority, dueDate, projectId, assigneeId, sprintId } = req.body;

        // Allow any member of the project to create a task
        const project = await Project.findOne({ _id: projectId, members: req.user._id });
        if (!project) return res.status(404).json({ message: 'Project not found or unauthorized' });

        const task = new Task({
            title,
            description,
            status,
            priority,
            dueDate,
            project: projectId,
            assignee: assigneeId,
            sprint: sprintId,
            reporter: req.user._id
        });

        await task.save();

        // Emit socket event (placeholder for now, will integrate properly later)
        // req.io.to(projectId).emit('task:created', task);

        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getTasks = async (req, res) => {
    try {
        const { projectId } = req.query;
        if (!projectId) return res.status(400).json({ message: 'Project ID is required' });

        const project = await Project.findOne({ _id: projectId, members: req.user._id });
        if (!project) return res.status(404).json({ message: 'Project not found or unauthorized' });

        const tasks = await Task.find({ project: projectId })
            .populate('assignee', 'name email')
            .populate('reporter', 'name email')
            .sort({ createdAt: -1 });

        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateTask = async (req, res) => {
    try {
        // Check project access first
        const taskCheck = await Task.findById(req.params.id);
        if (!taskCheck) return res.status(404).json({ message: 'Task not found' });

        const project = await Project.findOne({ _id: taskCheck.project, members: req.user._id });
        if (!project) return res.status(403).json({ message: 'Unauthorized' });

        const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true })
            .populate('assignee', 'name email');

        res.json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteTask = async (req, res) => {
    try {
        const taskCheck = await Task.findById(req.params.id);
        if (!taskCheck) return res.status(404).json({ message: 'Task not found' });

        const project = await Project.findOne({ _id: taskCheck.project, members: req.user._id });
        if (!project) return res.status(403).json({ message: 'Unauthorized' });

        await Task.findByIdAndDelete(req.params.id);
        res.json({ message: 'Task deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
