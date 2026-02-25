const mongoose = require('mongoose');

const leaveBalanceSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    sickLeave: {
        type: Number,
        default: 12
    },
    casualLeave: {
        type: Number,
        default: 10
    },
    annualLeave: {
        type: Number,
        default: 15
    },
    maternityLeave: {
        type: Number,
        default: 90
    },
    paternityLeave: {
        type: Number,
        default: 15
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('LeaveBalance', leaveBalanceSchema);
