 const express = require('express');
 const router = express.Router();
 
 const registrationsController = require('../controllers/registrationsController');
 const authMiddleware = require('../middleware/authMiddleware');
const checkSuspension = require('../middleware/checkSuspension');

 
 // PUBLIC ROUTES
 router.get('/', registrationsController.getAllRegistrations);
 router.post('/', authMiddleware, checkSuspension, registrationsController.createRegistration);
 router.get('/event/:eventId', registrationsController.getRegistrationsByEvent);


// PROTECTED ROUTES
router.get('/user/:userId', authMiddleware, registrationsController.getRegistrationsByUser);
router.put('/:id', authMiddleware, registrationsController.updateRegistration);
router.delete('/:id', authMiddleware, registrationsController.deleteRegistration);
router.patch('/:id/approve', authMiddleware, registrationsController.approveRegistration);
router.patch('/:id/reject', authMiddleware, registrationsController.rejectRegistration);
router.post('/bulk-update', authMiddleware, registrationsController.bulkUpdateRegistrations);

 module.exports = router;
