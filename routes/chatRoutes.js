const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const Group = require('../models/Group');
const jwt = require('jsonwebtoken');
const checkSuspension = require('../middleware/checkSuspension');
const upload = require('../utils/multer');


// Auth middleware
const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
            if (!req.user) return res.status(401).json({ message: 'User not found' });
            next();
        } catch (error) {
            return res.status(401).json({ message: 'Not authorized' });
        }
    } else {
        return res.status(401).json({ message: 'No token' });
    }
};

// Get conversations list (unique users you've chatted with)
router.get('/conversations', protect, async (req, res) => {
    try {
        const userId = req.user._id;

        // Find all unique users this user has chatted with
        const sent = await Message.distinct('receiver', { sender: userId });
        const received = await Message.distinct('sender', { receiver: userId });

        // Merge unique user IDs
        const userIds = [...new Set([...sent.map(id => id.toString()), ...received.map(id => id.toString())])];

        // Get user info and last message + unread count for each
        const privateConversations = await Promise.all(userIds.map(async (otherUserId) => {
            const user = await User.findById(otherUserId).select('username profilePhoto userType');
            if (!user) return null;

            const lastMessage = await Message.findOne({
                $or: [
                    { sender: userId, receiver: otherUserId },
                    { sender: otherUserId, receiver: userId }
                ]
            }).sort({ createdAt: -1 });

            const unreadCount = await Message.countDocuments({
                sender: otherUserId,
                receiver: userId,
                read: false
            });

            return {
                id: otherUserId,
                user,
                lastMessage,
                unreadCount,
                type: 'private'
            };
        }));

        // Get groups this user belongs to
        const groups = await Group.find({ members: userId });
        const groupConversations = await Promise.all(groups.map(async (group) => {
            const lastMessage = await Message.findOne({ groupId: group._id }).sort({ createdAt: -1 });

            // For now, simplicity: count all messages unread in group? 
            // Better: we'd need a lastSeen timestamp per user per group.
            // Keeping it simple for now, just 0 unread for groups unless implemented.
            const unreadCount = 0;

            return {
                id: group._id,
                group,
                lastMessage,
                unreadCount,
                type: 'group'
            };
        }));

        // Merge, filter nulls and sort by last message time
        const allConversations = [...privateConversations, ...groupConversations]
            .filter(c => c !== null)
            .sort((a, b) => new Date(b.lastMessage?.createdAt || 0) - new Date(a.lastMessage?.createdAt || 0));

        res.json(allConversations);
    } catch (error) {
        console.error('Conversations error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get messages with a specific user
router.get('/messages/:userId', protect, async (req, res) => {
    try {
        const userId = req.user._id;
        const otherUserId = req.params.userId;

        const messages = await Message.find({
            $or: [
                { sender: userId, receiver: otherUserId },
                { sender: otherUserId, receiver: userId }
            ]
        }).sort({ createdAt: 1 }).limit(100);

        // Mark received messages as read
        await Message.updateMany(
            { sender: otherUserId, receiver: userId, read: false },
            { $set: { read: true } }
        );

        res.json(messages);
    } catch (error) {
        console.error('Messages error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Send a message
router.post('/send', protect, checkSuspension, upload.single('image'), async (req, res) => {
    try {
        const { receiverId, content } = req.body;
        const imageUrl = req.file ? req.file.path : null;

        if (!receiverId || (!content && !imageUrl)) {
            return res.status(400).json({ message: 'Receiver and content or image required' });
        }

        const receiver = await User.findById(receiverId);
        if (!receiver) return res.status(404).json({ message: 'User not found' });

        const messageData = {
            sender: req.user._id,
            receiver: receiverId
        };
        
        if (content) messageData.content = content.trim();
        if (imageUrl) messageData.imageUrl = imageUrl;

        const message = new Message(messageData);
        await message.save();
        res.status(201).json(message);
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get unread count
router.get('/unread-count', protect, async (req, res) => {
    try {
        const count = await Message.countDocuments({
            receiver: req.user._id,
            read: false
        });
        res.json({ count });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get messages for a group
router.get('/group-messages/:groupId', protect, async (req, res) => {
    try {
        const groupId = req.params.groupId;
        const messages = await Message.find({ groupId })
            .populate('sender', 'username profilePhoto userType')
            .sort({ createdAt: 1 })
            .limit(100);
        res.json(messages);
    } catch (error) {
        console.error('Group messages error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create a group
router.post('/groups', protect, checkSuspension, async (req, res) => {
    try {
        const { name, description, memberIds } = req.body;
        if (!name) return res.status(400).json({ message: 'Group name required' });

        const members = [...new Set([...(memberIds || []), req.user._id.toString()])];

        const group = new Group({
            name,
            description,
            createdBy: req.user._id,
            members
        });

        await group.save();
        res.status(201).json(group);
    } catch (error) {
        console.error('Create group error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Send a message to a group
router.post('/send-group', protect, checkSuspension, upload.single('image'), async (req, res) => {
    try {
        const { groupId, content } = req.body;
        const imageUrl = req.file ? req.file.path : null;

        if (!groupId || (!content && !imageUrl)) {
            return res.status(400).json({ message: 'Group and content or image required' });
        }

        const group = await Group.findById(groupId);
        if (!group) return res.status(404).json({ message: 'Group not found' });

        const messageData = {
            sender: req.user._id,
            groupId: groupId
        };

        if (content) messageData.content = content.trim();
        if (imageUrl) messageData.imageUrl = imageUrl;

        const message = new Message(messageData);
        await message.save();

        const populated = await Message.findById(message._id)
            .populate('sender', 'username profilePhoto userType');

        res.status(201).json(populated);

    } catch (error) {
        console.error('Send group message error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
