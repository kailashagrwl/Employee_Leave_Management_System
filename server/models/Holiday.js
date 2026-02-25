const mongoose = require('mongoose');

const holidaySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a holiday name']
    },
    date: {
        type: Date,
        required: [true, 'Please add a holiday date']
    },
    type: {
        type: String,
        enum: ['Public Holiday', 'Company Holiday', 'Observance', 'Public', 'Company'],
        default: 'Public Holiday'
    },
    description: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Holiday', holidaySchema);
