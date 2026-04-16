const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const teacherController = require('../controllers/teacherController');
const { verifyToken, authorizeRoles } = require('../middleware/auth');

// Multer storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

router.use(verifyToken, authorizeRoles('teacher'));

router.get('/dashboard', teacherController.getDashboard);
router.get('/classes', teacherController.getClasses);
router.post('/attendance', teacherController.markAttendance);
router.get('/attendance/stats', teacherController.getAttendanceStats);
router.get('/attendance/:class_id', teacherController.getAttendance);
router.post('/assignments', upload.single('task_file'), teacherController.createAssignment);
router.get('/assignments', teacherController.getAssignments);
router.put('/submissions/grade', teacherController.gradeSubmission);
router.get('/reports', teacherController.getReports);
router.post('/marks', teacherController.updateMarks);
router.get('/marks/students', teacherController.getStudentsForMarks);
router.put('/profile', teacherController.updateProfile);

module.exports = router;
