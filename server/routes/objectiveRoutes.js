const express = require('express');
const router = express.Router();
const objectivesController = require('../controllers/objectivesController');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);
router.get('/:subject', objectivesController.getObjectives);

module.exports = router;
