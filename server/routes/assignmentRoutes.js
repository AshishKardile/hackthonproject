const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

router.post('/', assignmentController.createAssignment);
router.get('/', assignmentController.getAssignments);
router.post('/submit', assignmentController.submitAssignment);
router.get('/:assignment_id/submissions', assignmentController.getSubmissions);

module.exports = router;
