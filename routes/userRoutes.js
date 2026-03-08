const express = require('express');
const router = express.Router();
const User = require('../models/User');
const News = require('../models/News');
const ActivityLog = require('../models/ActivityLog');
const jwt = require('jsonwebtoken');
const upload = require('../utils/multer');
 
// Middleware to protect routes
const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
            if (!req.user) {
                return res.status(401).json({ message: 'User not found' });
            }
            next();
        } catch (error) {
            return res.status(401).json({ message: 'Not authorized' });
        }
    } else {
        return res.status(401).json({ message: 'No token' });
    }
};

// ===== STATIC ROUTES FIRST (before :id params) =====

// Get all users (Admin only)
router.get('/', protect, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized as admin' });
        }
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/change-password', protect, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check current password
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ message: 'كلمة المرور الحالية غير صحيحة' });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.json({ message: 'تم تغيير كلمة المرور بنجاح' });
    } catch (error) {
        console.error('Password change error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update Profile (must be before /:id)
router.put('/update', protect, async (req, res) => {
    try {
        const { username, email, profilePhoto, bio, phone } = req.body;
        const user = await User.findById(req.user.id);

        if (user) {
            user.username = username || user.username;
            user.email = email || user.email;
            if (profilePhoto !== undefined) user.profilePhoto = profilePhoto;
            if (bio !== undefined) user.bio = bio;
            if (phone !== undefined) user.phone = phone;
            if (req.body.socialLinks) {
                user.socialLinks = { ...user.socialLinks, ...req.body.socialLinks };
            }
            if (req.body.privacySettings) {
                user.privacySettings = { ...user.privacySettings, ...req.body.privacySettings };
            }

            const updatedUser = await user.save();

            // Update user info in all news comments
            try {
                await News.updateMany(
                    { 'comments.userId': user._id },
                    {
                        $set: {
                            'comments.$[elem].username': updatedUser.username,
                            'comments.$[elem].profilePhoto': updatedUser.profilePhoto
                        }
                    },
                    { arrayFilters: [{ 'elem.userId': user._id }] }
                );
            } catch (syncError) {
                console.error('Error syncing user info to comments:', syncError);
                // We don't block the profile update if comment sync fails
            }

            res.json({
                _id: updatedUser._id,
                username: updatedUser.username,
                email: updatedUser.email,
                role: updatedUser.role,
                userType: updatedUser.userType,
                profilePhoto: updatedUser.profilePhoto,
                bio: updatedUser.bio,
                phone: updatedUser.phone,
                socialLinks: updatedUser.socialLinks,
                customId: updatedUser.customId
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Upload Profile Photo (must be before /:id)
router.post('/upload-photo', protect, upload.single('photo'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        // Save the photo URL to the user's profile immediately
        const photoUrl = `/uploads/${req.file.filename}`;
        const user = await User.findById(req.user.id);
        if (user) {
            user.profilePhoto = photoUrl;
            await user.save();

            // Update user info in all news comments
            try {
                await News.updateMany(
                    { 'comments.userId': user._id },
                    {
                        $set: {
                            'comments.$[elem].profilePhoto': photoUrl
                        }
                    },
                    { arrayFilters: [{ 'elem.userId': user._id }] }
                );
            } catch (syncError) {
                console.error('Error syncing user info to comments:', syncError);
            }
        }
        res.json({ photoUrl });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Search Users (Public)
router.get('/search', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.json([]);

        // Search by username containing the query (case insensitive)
        const users = await User.find({
            username: { $regex: q, $options: 'i' }
        }).select('username profilePhoto _id userType bio points quizPoints phone customId socialLinks');

        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update User Points (Protected)
router.post('/points', protect, async (req, res) => {
    try {
        const { points } = req.body;
        const user = await User.findById(req.user.id);
        if (user) {
            // Add points to existing points
            user.points = (user.points || 0) + parseInt(points);
            await user.save();
            res.json({ points: user.points });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/me', protect, async (req, res) => {
    res.json(req.user);
});

// ===== DYNAMIC ROUTES (with :id param) =====

// Get User Profile (Public)
router.get('/:id/profile', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('username profilePhoto bio userType points quizPoints createdAt followers following phone customId socialLinks');
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Follow/Unfollow Toggle
router.post('/:id/follow', protect, async (req, res) => {
    try {
        const targetUserId = req.params.id;
        const currentUserId = req.user.id;

        if (targetUserId === currentUserId) {
            return res.status(400).json({ message: 'You cannot follow yourself' });
        }

        const targetUser = await User.findById(targetUserId);
        if (!targetUser) {
            return res.status(404).json({ message: 'Target user not found' });
        }

        const isFollowing = targetUser.followers.includes(currentUserId);

        if (isFollowing) {
            // Unfollow - Atomic update
            await User.findByIdAndUpdate(currentUserId, { $pull: { following: targetUserId } });
            const updatedTarget = await User.findByIdAndUpdate(targetUserId, { $pull: { followers: currentUserId } }, { new: true });
            res.json({
                message: 'Unfollowed',
                isFollowing: false,
                followersCount: updatedTarget.followers.length
            });
        } else {
            // Follow - Atomic update
            await User.findByIdAndUpdate(currentUserId, { $addToSet: { following: targetUserId } });
            const updatedTarget = await User.findByIdAndUpdate(targetUserId, { $addToSet: { followers: currentUserId } }, { new: true });
            res.json({
                message: 'Followed',
                isFollowing: true,
                followersCount: updatedTarget.followers.length
            });
        }
    } catch (error) {
        console.error('Follow error details:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete User (Admin only)
router.delete('/:id', protect, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized as admin' });
        }
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update User Role/Status (Admin only)
router.put('/:id/role', protect, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized as admin' });
        }

        const updateFields = {};
        if (req.body.role) updateFields.role = req.body.role;
        if (req.body.userType) updateFields.userType = req.body.userType;

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { $set: updateFields },
            { new: true, runValidators: true }
        );

        if (user) {
            // Log Activity
            await new ActivityLog({
                userId: req.user._id,
                action: req.body.role ? 'UPDATE_USER_ROLE' : 'UPDATE_USER_ROLE', // Using a generic ROLE action or differentiate if needed
                details: `Admin updated user ${user.username}: ${req.body.role ? 'Role to ' + req.body.role : ''} ${req.body.userType ? 'Type to ' + req.body.userType : ''}`,
                ip: req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || req.connection?.remoteAddress || ''
            }).save();

            res.json({ message: 'User updated' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Error updating user role:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
});

// Approve User (Admin only)
router.put('/:id/approve', protect, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized as admin' });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { $set: { status: 'approved' } },
            { new: true, runValidators: true }
        );

        if (user) {
            // Log Activity
            await new ActivityLog({
                userId: req.user._id,
                action: 'APPROVE_USER',
                details: `Admin approved user: ${user.username}`,
                ip: req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || req.connection?.remoteAddress || ''
            }).save();

            res.json({ message: 'User approved' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Error approving user:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
});

// Reject User (Admin only)
router.put('/:id/reject', protect, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized as admin' });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { $set: { status: 'rejected' } },
            { new: true, runValidators: true }
        );

        if (user) {
            // Log Activity
            await new ActivityLog({
                userId: req.user._id,
                action: 'REJECT_USER',
                details: `Admin rejected user: ${user.username}`,
                ip: req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || req.connection?.remoteAddress || ''
            }).save();

            res.json({ message: 'User rejected' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Error rejecting user:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
});

// Suspend User (Admin only) - Ban for 1 Month
router.put('/:id/suspend', protect, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized as admin' });
        }

        const { reason } = req.body;
        const oneMonthLater = new Date();
        oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { $set: { suspendedUntil: oneMonthLater, banReason: reason || '' } },
            { new: true }
        );

        if (user) {
            // Log Activity
            await new ActivityLog({
                userId: req.user._id,
                action: 'SUSPEND_USER',
                details: `Admin suspended user: ${user.username} until ${oneMonthLater.toLocaleDateString('ar-JO')}. Reason: ${reason || 'N/A'}`,
                ip: req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || req.connection?.remoteAddress || ''
            }).save();

            res.json({ message: 'تم إيقاف المستخدم لمدة شهر بنجاح', suspendedUntil: oneMonthLater, reason: reason });

        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Error suspending user:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
});

// Unsuspend User (Admin only)
router.put('/:id/unsuspend', protect, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized as admin' });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { $set: { suspendedUntil: null } },
            { new: true }
        );

        if (user) {
            // Log Activity
            await new ActivityLog({
                userId: req.user._id,
                action: 'UNSUSPEND_USER',
                details: `Admin unsuspended user: ${user.username}`,
                ip: req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || req.connection?.remoteAddress || ''
            }).save();

            res.json({ message: 'تم إلغاء إيقاف المستخدم بنجاح' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Error unsuspending user:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
});

// Get user followers
router.get('/:id/followers', protect, async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .populate('followers', 'username profilePhoto userType');

        if (!user) return res.status(404).json({ message: 'User not found' });

        const isSelf = req.user && req.user.id === user._id.toString();

        // Privacy check
        if (!user.privacySettings?.showFollowers && !isSelf) {
            return res.status(403).json({ message: 'هذه القائمة خاصة' });
        }

        res.json(user.followers);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get user following
router.get('/:id/following', protect, async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .populate('following', 'username profilePhoto userType');

        if (!user) return res.status(404).json({ message: 'User not found' });

        const isSelf = req.user && req.user.id === user._id.toString();

        // Privacy check
        if (!user.privacySettings?.showFollowers && !isSelf) {
            return res.status(403).json({ message: 'هذه القائمة خاصة' });
        }

        res.json(user.following);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
