require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const adminEmail = 'admin@eyf.com';
        const adminPassword = 'admin123';

        let admin = await User.findOne({ email: adminEmail });
        if (admin) {
            console.log('Admin already exists');
            process.exit(0);
        }

        admin = new User({
            username: 'مدير الموقع',
            email: adminEmail,
            password: adminPassword,
            role: 'admin'
        });

        await admin.save();
        console.log('Admin created successfully!');
        console.log('Email:', adminEmail);
        console.log('Password:', adminPassword);
        process.exit(0);
    } catch (error) {
        console.error('Error creating admin:', error);
        process.exit(1);
    }
};

createAdmin();
