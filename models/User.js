const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    customId: {
        type: String,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    firstName: {
        type: String,
        trim: true,
        default: ''
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    userType: {
        type: String,
        default: '\u0645\u0633\u062a\u062e\u062f\u0645 \u0639\u0627\u062f\u064a'
    },
    profilePhoto: {
        type: String,
        default: ''
    },
    bio: {
        type: String,
        default: ''
    },
    phone: {
        type: String,
        default: ''
    },
    points: {
        type: Number,
        default: 0
    },
    quizPoints: {
        type: Number,
        default: 0
    },
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    privacySettings: {
        showFollowers: {
            type: Boolean,
            default: true
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    suspendedUntil: {
        type: Date,
        default: null
    },
    banReason: {
        type: String,
        default: ''
    },
    socialLinks: {
        facebook: { type: String, default: '' },
        twitter: { type: String, default: '' },
        instagram: { type: String, default: '' },
        linkedin: { type: String, default: '' },
        website: { type: String, default: '' }
    }

});

// Hash password before saving and generate customId
userSchema.pre('save', async function (next) {
    if (this.isNew && !this.customId) {
        const year = new Date().getFullYear();
        const count = await mongoose.model('User').countDocuments();
        this.customId = `EYF-${year}-${(count + 1).toString().padStart(4, '0')}`;
    }

    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
