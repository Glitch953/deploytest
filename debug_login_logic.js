const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const User = require('./models/User');
const ActivityLog = require('./models/ActivityLog');

async function debugLogin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const email = 'bravelight02@gmail.com'; // One from check_users
        const user = await User.findOne({ email });
        
        if (!user) {
            console.log('User not found');
            return;
        }

        console.log('User found:', user.username);
        console.log('User status:', user.status);
        console.log('User role:', user.role);

        // Simulation of login logic
        try {
            // Note: We don't have the password, so we just check the blocks
            if (user.role !== 'admin') {
                if (user.status === 'pending') console.log('Sim: Pending');
                if (user.status === 'rejected') console.log('Sim: Rejected');
                if (user.suspendedUntil && user.suspendedUntil > new Date()) {
                    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
                    const dateStr = user.suspendedUntil.toLocaleString('ar-JO', options);
                    console.log('Sim: Suspended until', dateStr);
                }
            }

            const token = jwt.sign(
                { id: user._id, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );
            console.log('Sim: Token generated');

            const activity = new ActivityLog({
                userId: user._id,
                action: 'LOGIN',
                details: `Debug simulation login: ${user.username}`,
                ip: '127.0.0.1'
            });
            await activity.save();
            console.log('Sim: Activity log saved');

        } catch (innerError) {
            console.error('INNER ERROR:', innerError.message);
            console.error(innerError.stack);
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error('OUTER ERROR:', err.message);
    }
}

debugLogin();
