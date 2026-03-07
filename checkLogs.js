require('dotenv').config();
const mongoose = require('mongoose');
const ActivityLog = require('./models/ActivityLog');

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const logs = await ActivityLog.find({}).sort({ timestamp: -1 }).limit(10);
        console.log(JSON.stringify(logs, null, 2));
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}
check();
