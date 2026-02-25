const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Holiday = require('./models/Holiday');

dotenv.config();

const holidays = [
    { name: 'New Year', date: new Date('2026-01-01'), type: 'Public', description: 'New Year Celebration' },
    { name: 'Republic Day', date: new Date('2026-01-26'), type: 'Public', description: 'National Holiday' },
    { name: 'Holi', date: new Date('2026-03-14'), type: 'Public', description: 'Festival of Colors' },
    { name: 'Independence Day', date: new Date('2026-08-15'), type: 'Public', description: 'National Holiday' },
    { name: 'Christmas', date: new Date('2026-12-25'), type: 'Public', description: 'Global Holiday' },
    { name: 'Annual Founder Day', date: new Date('2026-06-12'), type: 'Company', description: 'Company Anniversary' }
];

const seedHolidays = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        await Holiday.deleteMany();
        await Holiday.insertMany(holidays);
        console.log('Holidays Seeded Successfully!');
        process.exit();
    } catch (error) {
        console.error('Error seeding holidays:', error);
        process.exit(1);
    }
};

seedHolidays();
