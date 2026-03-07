const express = require('express');
const router = express.Router();

const eventController = require('../controllers/eventController');
const authMiddleware = require('../middleware/authMiddleware');

// PUBLIC ROUTES
router.get('/', eventController.getAllEvents);
router.get('/:id', eventController.getEventById);

// PROTECTED ROUTES
router.post('/', authMiddleware, eventController.createEvent);
router.put('/:id', authMiddleware, eventController.updateEvent);
router.delete('/:id', authMiddleware, eventController.deleteEvent); 
router.patch('/:id/toggle-status', authMiddleware, eventController.toggleEventStatus);
router.patch('/:id/active', authMiddleware, eventController.toggleActive);

module.exports = router;
