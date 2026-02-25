require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function seed() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const User = require('./models/User');

    const EMAIL = 'admin@company.com';
    const PASSWORD = 'Admin@123';

    const existing = await User.findOne({ email: EMAIL });

    if (existing) {
        // Force reset the password directly (bypass pre-hook via updateOne to test)
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(PASSWORD, salt);
        await User.updateOne({ email: EMAIL }, { password: hashed });
        console.log(`✅ Password reset for existing user: ${EMAIL}`);
    } else {
        // Create fresh — pre-hook will hash it
        await User.create({
            name: 'System Admin',
            email: EMAIL,
            password: PASSWORD,
            role: 'Admin',
            department: 'Administration'
        });
        console.log('✅ Admin user created!');
    }

    console.log('\n📋 Use these credentials to login:');
    console.log(`   Email:    ${EMAIL}`);
    console.log(`   Password: ${PASSWORD}`);
    console.log('\n🌐 Go to: http://localhost:5174/login\n');
    process.exit(0);
}

seed().catch(err => { console.error('❌', err.message); process.exit(1); });
