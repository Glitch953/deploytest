require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function migrate() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const users = await User.find({ customId: { $exists: false } });
        console.log(`Found ${users.length} users without customId`);

        const year = new Date().getFullYear();
        let count = await User.countDocuments({ customId: { $exists: true } });

        for (let user of users) {
            count++;
            user.customId = `EYF-${year}-${count.toString().padStart(4, '0')}`;
            await user.save();
            console.log(`Updated user ${user.username} with ID ${user.customId}`);
        }

        console.log('Migration completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
