const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');
const Task = require('../models/Task');

// Storage Config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });

router.use(auth);

// Upload File
router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

        const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

        // If taskId is provided, Attach to task
        // This part is optional here, can be done via frontend sending taskId
        // For now we just return the URL and let frontend attach it to task via updateTask

        res.json({
            filename: req.file.filename,
            url: fileUrl,
            originalname: req.file.originalname
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
