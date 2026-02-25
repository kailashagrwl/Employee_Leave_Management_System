const mongoose = require('mongoose');

const reimbursementSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    category: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    fromDate: {
        type: Date
    },
    toDate: {
        type: Date
    },
    receiptUrl: {
        type: String
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    managerRemark: {
        type: String
    },
    adminRemark: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Reimbursement', reimbursementSchema);
