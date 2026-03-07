const Certificate = require('../models/Certificate');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const { getClientIp } = require('../utils/ipUtils');

exports.issueCertificate = async (req, res) => {
    try {
        const { userId, title, issuer, dateIssued, description, certificateUrl } = req.body;
        const normalizedUserId = userId ? userId.trim() : '';

        const user = await User.findOne({ customId: normalizedUserId });
        if (!user) {
            return res.status(404).json({ message: 'المستخدم غير موجود' });
        }

        const certificate = new Certificate({
            userId: user._id,
            title,
            issuer,
            dateIssued: dateIssued || Date.now(),
            description,
            certificateUrl
        });

        await certificate.save();

        // Log activity
        await new ActivityLog({
            userId: req.user?._id,
            action: 'ISSUE_CERTIFICATE',
            details: `Admin issued certificate: ${title} to user: ${user.username}`,
            ip: getClientIp(req)
        }).save();

        res.status(201).json({ message: 'تم إصدار الشهادة بنجاح', certificate });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getMyCertificates = async (req, res) => {
    try {
        const certificates = await Certificate.find({ userId: req.user._id }).sort({ dateIssued: -1 });
        res.json(certificates);
        console.log("LOGGED USER:", req.user._id);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteCertificate = async (req, res) => {
    try {
        const { id } = req.params;
        const cert = await Certificate.findByIdAndDelete(id);
        if (!cert) return res.status(404).json({ message: 'الشهادة غير موجودة' });

        // Log activity
        await new ActivityLog({
            userId: req.user?._id,
            action: 'DELETE_CERTIFICATE',
            details: `Admin deleted certificate ID: ${id}`,
            ip: getClientIp(req)
        }).save();

        res.json({ message: 'تم حذف الشهادة' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAllCertificates = async (req, res) => {
    try {
        const certificates = await Certificate.find()
            .populate('userId', 'username email customId')
            .sort({ dateIssued: -1 });
        res.json(certificates);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
