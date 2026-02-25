require('dotenv').config();
const mongoose = require('mongoose');
const ReimbursementCategory = require('./models/ReimbursementCategory');
const connectDB = require('./config/db');

const categories = [
    { name: 'Travel', maxLimit: 5000, requiresReceipt: true },
    { name: 'Food', maxLimit: 1000, requiresReceipt: true },
    { name: 'Medical', maxLimit: 10000, requiresReceipt: true },
    { name: 'Internet', maxLimit: 1500, requiresReceipt: false },
    { name: 'Other', maxLimit: null, requiresReceipt: true }
];

const seedCategories = async () => {
    try {
        await connectDB();

        // Remove existing ones to avoid duplicates if re-running
        await ReimbursementCategory.deleteMany();

        await ReimbursementCategory.insertMany(categories);

        console.log('Reimbursement Categories Seeded Successfully!');
        process.exit();
    } catch (error) {
        console.error('Error seeding categories:', error);
        process.exit(1);
    }
};

seedCategories();
