const mongoose = require('mongoose');
require('dotenv').config();

async function testConn() {
    console.log('Testing connection to:', process.env.MONGODB_URI ? 'URI found' : 'URI MISSING');
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000
        });
        console.log('SUCCESS: Connected to MongoDB');
        process.exit(0);
    } catch (err) {
        console.error('FAILURE:', err.message);
        process.exit(1);
    }
}

testConn();
