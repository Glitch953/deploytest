const User = require('../models/User');

/**
 * Generates a unique EYF ID
 */
const generateEYFId = () => {
    const random = Math.floor(100000 + Math.random() * 900000); // 6 digits
    return `EYF-${random}`;
};

/**
 * Finds users without a customId and populates one for them.
 */
exports.populateMissingUserIDs = async () => {
    try {
        const usersToUpdate = await User.find({
            $or: [
                { customId: { $exists: false } },
                { customId: null },
                { customId: '' }
            ]
        });

        if (usersToUpdate.length === 0) {
            console.log('Migration: All users already have unique IDs.');
            return;
        }

        console.log(`Migration: Found ${usersToUpdate.length} users with missing IDs. Starting population...`);

        let updatedCount = 0;
        for (const user of usersToUpdate) {
            let customId = generateEYFId();

            // Ensure uniqueness
            let idExists = await User.findOne({ customId });
            while (idExists) {
                customId = generateEYFId();
                idExists = await User.findOne({ customId });
            }

            user.customId = customId;
            await user.save();
            updatedCount++;
        }

        console.log(`Migration: Successfully populated IDs for ${updatedCount} users.`);
    } catch (error) {
        console.error('Migration Error (populateMissingUserIDs):', error);
    }
};
