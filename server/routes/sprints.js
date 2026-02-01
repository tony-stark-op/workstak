const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const sprintController = require('../controllers/sprintController');

router.use(auth);

router.post('/', sprintController.createSprint);
router.get('/', sprintController.getSprints);
router.put('/:id', sprintController.updateSprint);

module.exports = router;
