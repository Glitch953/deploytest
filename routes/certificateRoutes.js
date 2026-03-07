const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificateController');
const authMiddleware = require('../middleware/authMiddleware');

// User routes
router.get('/my-certificates', authMiddleware, certificateController.getMyCertificates);

// Admin routes
router.get('/all', authMiddleware, certificateController.getAllCertificates);
router.post('/issue', authMiddleware, certificateController.issueCertificate);
router.delete('/:id', authMiddleware, certificateController.deleteCertificate);

module.exports = router;
