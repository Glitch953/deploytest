const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    issuer: {
        type: String,
        required: true,
        default: 'EYF (ملتقى شباب التميز)',
        trim: true
    },
    dateIssued: {
        type: Date,
        default: Date.now
    },
    description: {
        type: String,
        default: ''
    },
    certificateUrl: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

const Certificate = mongoose.model('Certificate', certificateSchema);
module.exports = Certificate;
