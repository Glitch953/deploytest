const express = require('express');
const router = express.Router();
const ActivityLog = require('../models/ActivityLog');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');




// Get all logs
router.get('/', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized as admin' });
        }

        const logs = await ActivityLog.find()
            .populate('userId', 'username email')
            .sort({ timestamp: -1 })
            .limit(50);
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
