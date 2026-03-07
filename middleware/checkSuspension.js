const User = require('../models/User');

const checkSuspension = async (req, res, next) => {
    if (req.user && req.user.suspendedUntil && req.user.suspendedUntil > new Date()) {
        const remainingTime = req.user.suspendedUntil - new Date();
        const days = Math.floor(remainingTime / (1000 * 60 * 60 * 24));
        const hours = Math.floor((remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        
        return res.status(403).json({ 
            message: `حسابك معلق. الوقت المتبقي: ${days} يوم و ${hours} ساعة`,
            suspended: true,
            suspendedUntil: req.user.suspendedUntil,
            reason: req.user.banReason || 'غير محدد'
        });
    }
    next();
};

module.exports = checkSuspension;
