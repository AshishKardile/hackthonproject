const express = require('express');
const router = express.Router();
const counselorController = require('../controllers/counselorController');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

router.post('/book', counselorController.bookSession);
router.get('/', counselorController.getBookings);

module.exports = router;
