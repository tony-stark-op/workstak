const Task = require('../models/Task');
const Sprint = require('../models/Sprint');
const Project = require('../models/Project');

exports.getProjectAnalytics = async (req, res) => {
    try {
        const { projectId } = req.params;
        // Validate access
        const project = await Project.findOne({ _id: projectId, members: req.user._id });
        if (!project) return res.status(403).json({ message: 'Unauthorized' });

        // Task Status Distribution
        const taskStatusDistribution = await Task.aggregate([
            { $match: { project: project._id } },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        // Tasks Completed by User
        const userProductivity = await Task.aggregate([
            { $match: { project: project._id, status: 'Done' } },
            { $group: { _id: '$assignee', count: { $sum: 1 } } },
            { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
            { $unwind: '$user' },
            { $project: { name: '$user.name', count: 1 } }
        ]);

        res.json({
            taskStatusDistribution,
            userProductivity
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
