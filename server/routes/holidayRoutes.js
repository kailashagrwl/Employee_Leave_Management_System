const express = require('express');
const router = express.Router();
const { getHolidays, addHoliday, deleteHoliday } = require('../controllers/holidayController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getHolidays);
router.post('/', authorize('Admin'), addHoliday);
router.delete('/:id', authorize('Admin'), deleteHoliday);

module.exports = router;
