const mongoose = require('mongoose');

const quizRoomSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        length: 6
    },
    host: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    players: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        score: {
            type: Number,
            default: 0
        },
        answers: [{
            questionIndex: Number,
            answerIndex: Number,
            correct: Boolean,
            timeMs: Number
        }]
    }],
    questions: [{
        question: {
            type: String,
            required: true
        },
        options: [{
            type: String,
            required: true
        }],
        correctAnswer: {
            type: Number,
            required: true
        },
        category: {
            type: String,
            default: 'عام'
        }
    }],
    status: {
        type: String,
        enum: ['waiting', 'playing', 'finished'],
        default: 'waiting'
    },
    currentQuestion: {
        type: Number,
        default: 0
    },
    questionTimer: {
        type: Number,
        default: 15
    },
    questionStartedAt: {
        type: Date,
        default: null
    },
    maxPlayers: {
        type: Number,
        default: 10
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 86400 // auto-delete after 24h
    }
});

const QuizRoom = mongoose.model('QuizRoom', quizRoomSchema);
module.exports = QuizRoom;
