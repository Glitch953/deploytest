const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const checkSuspension = require('../middleware/checkSuspension');
const quizController = require('../controllers/quizController');


// All routes require authentication
router.use(authMiddleware);
router.use(checkSuspension);


// Room management
router.post('/create', quizController.createRoom);
router.post('/join/:code', quizController.joinRoom);
router.get('/room/:code', quizController.getRoomState);

// Game actions
router.post('/room/:code/start', quizController.startGame);
router.post('/room/:code/answer', quizController.submitAnswer);
router.post('/room/:code/next', quizController.nextQuestion);

// Questions
router.post('/room/:code/add-questions', quizController.addQuestions);
router.get('/preset-questions', quizController.getPresetQuestions);

// User search
router.get('/search-users', quizController.searchUsers);

module.exports = router;
