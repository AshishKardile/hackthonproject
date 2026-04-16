const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

router.post('/send', chatController.sendMessage);
router.get('/history', chatController.getHistory);

module.exports = router;
