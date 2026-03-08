const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');


router.post('/', async (req, res) => {
    try {
        const { name, email, message, type } = req.body;

        const newContact = new Contact({
            name,
            email,
            message,
            type
        });

        await newContact.save();

        res.status(200).json({ success: true, message: 'Message saved successfully' });

    } catch (error) {
        console.error('Contact error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
