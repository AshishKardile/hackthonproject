const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { verifyToken, authorizeRoles } = require('../middleware/auth');

router.use(verifyToken, authorizeRoles('student'));

router.get('/dashboard', studentController.getDashboard);
router.get('/wellness', studentController.getWellness);
router.post('/wellness', studentController.logWellness);
router.get('/academics', studentController.getAcademics);
router.get('/attendance', studentController.getAttendance);
router.get('/assignments', studentController.getAssignments);
router.post('/assignments/submit', studentController.submitAssignment);
router.get('/gamification', studentController.getGamification);

module.exports = router;
