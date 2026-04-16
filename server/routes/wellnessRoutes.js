const express = require('express');
const router = express.Router();
const wellnessController = require('../controllers/wellnessController');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);
router.post('/test', wellnessController.submitTest);
router.get('/history', wellnessController.getHistory);
router.post('/tasks', wellnessController.submitTasks);

module.exports = router;
