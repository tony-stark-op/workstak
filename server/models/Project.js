const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    repositories: [{
        name: String,
        url: String,
        type: { type: String, enum: ['github', 'azure', 'gitlab', 'bitbucket', 'other'], default: 'other' }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Project', ProjectSchema);
