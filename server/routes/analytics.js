const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const analyticsController = require('../controllers/analyticsController');

router.use(auth);

router.get('/project/:projectId', analyticsController.getProjectAnalytics);

module.exports = router;
