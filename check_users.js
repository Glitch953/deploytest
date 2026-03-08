const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

async function checkUsers() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');
        
        const users = await User.find({}, 'username email role status isApproved suspendedUntil');
        console.log('Users in database:');
        console.table(users.map(u => ({
            username: u.username,
            email: u.email,
            role: u.role,
            status: u.status,
            isApproved: u.isApproved,
            suspendedUntil: u.suspendedUntil
        })));
        
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

checkUsers();
