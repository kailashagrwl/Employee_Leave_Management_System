const mongoose = require('mongoose');

const reimbursementCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    maxLimit: {
        type: Number,
        default: null
    },
    requiresReceipt: {
        type: Boolean,
        default: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('ReimbursementCategory', reimbursementCategorySchema);
