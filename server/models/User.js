const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false
    },
    role: {
        type: String,
        enum: ['Employee', 'Manager', 'Admin'],
        default: 'Employee'
    },
    department: {
        type: String,
        required: [true, 'Please add a department']
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    salaryBalance: {
        type: Number,
        default: 0
    },
    managerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

// Encrypt password using bcrypt - only re-hash if password field was changed
// ⚠️  Mongoose 7+ async pre-hooks do NOT receive `next`.
// Calling next() inside an async function throws "TypeError: next is not a function"
// which silently breaks ALL login / register attempts.
// Simply return from the async function — Mongoose handles the rest.
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
