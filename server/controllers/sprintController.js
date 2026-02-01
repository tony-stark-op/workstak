const Sprint = require('../models/Sprint');
const Project = require('../models/Project');

exports.createSprint = async (req, res) => {
    try {
        const { name, startDate, endDate, projectId } = req.body;

        const project = await Project.findOne({ _id: projectId, members: req.user._id });
        if (!project) return res.status(404).json({ message: 'Project not found or unauthorized' });

        const sprint = new Sprint({
            name,
            startDate,
            endDate,
            project: projectId
        });
        await sprint.save();
        res.status(201).json(sprint);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getSprints = async (req, res) => {
    try {
        const { projectId } = req.query;
        if (!projectId) return res.status(400).json({ message: 'Project ID is required' });

        const project = await Project.findOne({ _id: projectId, members: req.user._id });
        if (!project) return res.status(404).json({ message: 'Project not found or unauthorized' });

        const sprints = await Sprint.find({ project: projectId }).sort({ startDate: 1 });
        res.json(sprints);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateSprint = async (req, res) => {
    try {
        const sprintCheck = await Sprint.findById(req.params.id);
        if (!sprintCheck) return res.status(404).json({ message: 'Sprint not found' });

        const project = await Project.findOne({ _id: sprintCheck.project, members: req.user._id });
        if (!project) return res.status(403).json({ message: 'Unauthorized' });

        const sprint = await Sprint.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(sprint);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
