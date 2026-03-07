const User = require('../models/User');
const jwt = require('jsonwebtoken');
const ActivityLog = require('../models/ActivityLog');

// Register User
exports.register = async (req, res) => {
    try {
        const { username, email, firstName, password } = req.body;

        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'هذا المستخدم موجود مسبقاً' });
        }

        // Create new user
        user = new User({
            username,
            email,
            firstName,
            password
        });

        await user.save();

        // Log Activity
        const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || req.connection?.remoteAddress || '';
        await new ActivityLog({
            userId: user._id,
            action: 'REGISTER',
            details: `User registered: ${username} (Pending Approval)`,
            ip: clientIp
        }).save();

        res.status(201).json({ message: 'تم إنشاء الحساب بنجاح! حسابك قيد انتظار موافقة المسؤول.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'خطأ في السيرفر أثناء التسجيل' });
    }
};

// Login User
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'بيانات الاعتماد غير صالحة' });
        }

        // Compare password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'بيانات الاعتماد غير صالحة' });
        }

        // Check if user is approved (allow original admin to bypass if needed, but here we require everyone to be approved)
        // Since we default to false, we might want admin to bypass it, or we simply check isApproved.
        // Let's allow users with role 'admin' to bypass, just in case the sole admin gets locked out.
        if (user.role !== 'admin') {
            if (user.status === 'pending') {
                return res.status(403).json({ message: 'حسابك قيد انتظار موافقة المسؤول' });
            }
            if (user.status === 'rejected') {
                return res.status(403).json({ message: 'تم رفض حسابك من قبل المسؤول' });
            }
            if (user.suspendedUntil && user.suspendedUntil > new Date()) {
                const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
                const dateStr = user.suspendedUntil.toLocaleString('ar-JO', options);
                return res.status(403).json({ message: `حسابك موقف مؤقتاً حتى ${dateStr}` });
            }
        }

        // Create JWT Token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Log Activity
        const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || req.connection?.remoteAddress || '';
        await new ActivityLog({
            userId: user._id,
            action: 'LOGIN',
            details: `User logged in: ${user.username}`,
            ip: clientIp
        }).save();

        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                firstName: user.firstName,
                role: user.role,
                userType: user.userType,
                profilePhoto: user.profilePhoto,
                quizPoints: user.quizPoints || 0
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login: ' + error.message });
    }
};

exports.getMe = async (req, res) => {
    try {
        res.json(req.user);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
