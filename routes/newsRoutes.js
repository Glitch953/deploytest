const express = require('express');
const router = express.Router();

const newsController = require('../controllers/newsController');
const authMiddleware = require('../middleware/authMiddleware');
const checkSuspension = require('../middleware/checkSuspension');


// PUBLIC ROUTES
router.get('/', newsController.getAllNews);
router.get('/:id', newsController.getNewsById);

// PROTECTED ROUTES
router.post('/', authMiddleware, newsController.createNews);
router.put('/:id', authMiddleware, newsController.updateNews);
router.delete('/:id', authMiddleware, newsController.deleteNews);
router.post('/:id/comments', authMiddleware, checkSuspension, newsController.addComment);
router.delete('/:id/comments/:commentId', authMiddleware, newsController.deleteComment);

module.exports = router;
