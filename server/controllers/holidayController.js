const Holiday = require('../models/Holiday');

// @desc    Get all holidays
// @route   GET /api/holidays
// @access  Public (Authenticated)
exports.getHolidays = async (req, res) => {
    try {
        const holidays = await Holiday.find().sort('date');
        res.json(holidays);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add a holiday
// @route   POST /api/holidays
// @access  Private (Admin)
exports.addHoliday = async (req, res) => {
    const { name, date, type, description } = req.body;
    try {
        const holiday = await Holiday.create({ name, date, type, description });
        res.status(201).json(holiday);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a holiday
// @route   DELETE /api/holidays/:id
// @access  Private (Admin)
exports.deleteHoliday = async (req, res) => {
    try {
        const holiday = await Holiday.findById(req.params.id);
        if (!holiday) return res.status(404).json({ message: 'Holiday not found' });
        await holiday.deleteOne();
        res.json({ message: 'Holiday removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
