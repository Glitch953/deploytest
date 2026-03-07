const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    action: {
        type: String,
        enum: [
            'REGISTER', 'LOGIN', 'UPDATE_POINTS', 'UPDATE_USER_ROLE',
            'DELETE_USER', 'CREATE_EVENT', 'UPDATE_EVENT', 'DELETE_EVENT',
            'CREATE_NEWS', 'UPDATE_NEWS', 'DELETE_NEWS', 'ADD_COMMENT',
            'DELETE_COMMENT', 'APPROVE_REGISTRATION', 'REJECT_REGISTRATION',
            'DELETE_REGISTRATION', 'BULK_UPDATE_REGISTRATIONS', 'ISSUE_CERTIFICATE',
            'DELETE_CERTIFICATE', 'APPROVE_USER', 'REJECT_USER', 'SUSPEND_USER', 'UNSUSPEND_USER'
        ],
        required: true
    },
    details: {
        type: String,
        required: false
    },
    ip: {
        type: String,
        default: ''
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('ActivityLog', activityLogSchema, 'activitylogs');
