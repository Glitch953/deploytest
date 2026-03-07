const QuizRoom = require('../models/QuizRoom');
const User = require('../models/User');

// ==================== Preset Questions ====================
const presetQuestions = {
    'برمجة': [
        { question: 'ما هي لغة البرمجة المستخدمة لتنسيق صفحات الويب؟', options: ['JavaScript', 'CSS', 'Python', 'Java'], correctAnswer: 1, category: 'برمجة' },
        { question: 'ما الوسم المستخدم لإنشاء رابط في HTML؟', options: ['<link>', '<a>', '<href>', '<url>'], correctAnswer: 1, category: 'برمجة' },
        { question: 'أي من التالي ليس نوع بيانات في JavaScript؟', options: ['String', 'Boolean', 'Float', 'Undefined'], correctAnswer: 2, category: 'برمجة' },
        { question: 'ما هو الناتج: typeof null؟', options: ['null', 'undefined', 'object', 'string'], correctAnswer: 2, category: 'برمجة' },
        { question: 'أي دالة تُستخدم لتحويل JSON إلى كائن JavaScript؟', options: ['JSON.stringify()', 'JSON.parse()', 'JSON.convert()', 'JSON.decode()'], correctAnswer: 1, category: 'برمجة' },
        { question: 'ما هو Git؟', options: ['لغة برمجة', 'نظام إدارة قواعد بيانات', 'نظام تحكم بالإصدارات', 'إطار عمل ويب'], correctAnswer: 2, category: 'برمجة' },
        { question: 'ما هي قيمة 0.1 + 0.2 === 0.3 في JavaScript؟', options: ['true', 'false', 'خطأ', 'undefined'], correctAnswer: 1, category: 'برمجة' },
        { question: 'ما الفرق بين == و === في JavaScript؟', options: ['لا فرق', '=== تقارن النوع والقيمة', '== أسرع', '=== للنصوص فقط'], correctAnswer: 1, category: 'برمجة' },
        { question: 'ما هو DOM؟', options: ['لغة برمجة', 'نموذج كائن المستند', 'قاعدة بيانات', 'بروتوكول شبكة'], correctAnswer: 1, category: 'برمجة' },
        { question: 'أي CSS Property يُستخدم لإخفاء عنصر مع الحفاظ على مساحته؟', options: ['display: none', 'visibility: hidden', 'opacity: 0', 'hidden: true'], correctAnswer: 1, category: 'برمجة' },
    ],
    'أمن سيبراني': [
        { question: 'ما هو هجوم التصيد الاحتيالي (Phishing)؟', options: ['فيروس كمبيوتر', 'محاولة خداع للحصول على معلومات', 'هجوم DDoS', 'اختراق الشبكة'], correctAnswer: 1, category: 'أمن سيبراني' },
        { question: 'ما هو الـ Firewall؟', options: ['برنامج مكافحة فيروسات', 'جدار حماية للشبكة', 'نظام تشغيل', 'متصفح آمن'], correctAnswer: 1, category: 'أمن سيبراني' },
        { question: 'ما هو أفضل طول لكلمة المرور القوية؟', options: ['4 أحرف', '6 أحرف', '8 أحرف فأكثر', '12 حرف فأكثر'], correctAnswer: 3, category: 'أمن سيبراني' },
        { question: 'ما هو الـ VPN؟', options: ['فيروس', 'شبكة خاصة افتراضية', 'بروتوكولURL', 'نوع تشفير'], correctAnswer: 1, category: 'أمن سيبراني' },
        { question: 'ما هو هجوم DDoS؟', options: ['سرقة بيانات', 'إغراق الخادم بطلبات وهمية', 'تصيد احتيالي', 'برنامج فدية'], correctAnswer: 1, category: 'أمن سيبراني' },
        { question: 'ما هو التشفير End-to-End؟', options: ['تشفير الملفات فقط', 'تشفير من المرسل للمستقبل فقط', 'تشفير الشبكة', 'تشفير كلمة المرور'], correctAnswer: 1, category: 'أمن سيبراني' },
        { question: 'ما هو الـ SQL Injection؟', options: ['نوع قاعدة بيانات', 'حقن أوامر SQL خبيثة', 'لغة برمجة', 'أداة تحليل'], correctAnswer: 1, category: 'أمن سيبراني' },
        { question: 'ما هو الـ HTTPS؟', options: ['بروتوكول غير آمن', 'بروتوكول نقل آمن', 'نوع ملف', 'اسم نطاق'], correctAnswer: 1, category: 'أمن سيبراني' },
        { question: 'ما هي المصادقة الثنائية (2FA)؟', options: ['كلمتا مرور', 'طبقة حماية إضافية', 'اسم مستخدم مزدوج', 'تشفير مزدوج'], correctAnswer: 1, category: 'أمن سيبراني' },
        { question: 'ما هو الـ Malware؟', options: ['برنامج مفيد', 'برنامج ضار', 'نظام تشغيل', 'أداة حماية'], correctAnswer: 1, category: 'أمن سيبراني' },
    ],
    'ثقافة عامة': [
        { question: 'ما هي عاصمة الأردن؟', options: ['إربد', 'عمّان', 'الزرقاء', 'العقبة'], correctAnswer: 1, category: 'ثقافة عامة' },
        { question: 'كم عدد قارات العالم؟', options: ['5', '6', '7', '8'], correctAnswer: 2, category: 'ثقافة عامة' },
        { question: 'ما هو أطول نهر في العالم؟', options: ['النيل', 'الأمازون', 'المسيسيبي', 'الدانوب'], correctAnswer: 0, category: 'ثقافة عامة' },
        { question: 'في أي سنة تأسست الأمم المتحدة؟', options: ['1940', '1945', '1950', '1955'], correctAnswer: 1, category: 'ثقافة عامة' },
        { question: 'ما هي أكبر دولة في العالم من حيث المساحة؟', options: ['كندا', 'الصين', 'روسيا', 'الولايات المتحدة'], correctAnswer: 2, category: 'ثقافة عامة' },
        { question: 'ما هو العنصر الكيميائي الأكثر وفرة في الكون؟', options: ['أكسجين', 'كربون', 'هيدروجين', 'نيتروجين'], correctAnswer: 2, category: 'ثقافة عامة' },
        { question: 'ما هي اللغة الأكثر تحدثاً في العالم؟', options: ['الإنجليزية', 'الصينية', 'الإسبانية', 'العربية'], correctAnswer: 1, category: 'ثقافة عامة' },
        { question: 'كم عدد أسنان الإنسان البالغ؟', options: ['28', '30', '32', '34'], correctAnswer: 2, category: 'ثقافة عامة' },
        { question: 'ما هو أصغر كوكب في المجموعة الشمسية؟', options: ['المريخ', 'عطارد', 'بلوتو', 'الزهرة'], correctAnswer: 1, category: 'ثقافة عامة' },
        { question: 'ما هي العملة الرسمية لليابان؟', options: ['يوان', 'وون', 'ين', 'روبية'], correctAnswer: 2, category: 'ثقافة عامة' },
    ],
    'رياضيات': [
        { question: 'ما هو ناتج 15 × 15؟', options: ['200', '215', '225', '250'], correctAnswer: 2, category: 'رياضيات' },
        { question: 'ما هو الجذر التربيعي لـ 144؟', options: ['10', '11', '12', '13'], correctAnswer: 2, category: 'رياضيات' },
        { question: 'كم يساوي π (باي) تقريباً؟', options: ['3.14', '2.71', '1.62', '3.41'], correctAnswer: 0, category: 'رياضيات' },
        { question: 'ما هو 2 أس 10؟', options: ['512', '1024', '2048', '256'], correctAnswer: 1, category: 'رياضيات' },
        { question: 'ما هو مجموع زوايا المثلث؟', options: ['90°', '180°', '270°', '360°'], correctAnswer: 1, category: 'رياضيات' },
        { question: 'ما هو العدد التالي: 1, 1, 2, 3, 5, 8, ...؟', options: ['10', '11', '12', '13'], correctAnswer: 3, category: 'رياضيات' },
        { question: 'كم يساوي 7! (مضروب 7)؟', options: ['720', '5040', '40320', '362880'], correctAnswer: 1, category: 'رياضيات' },
        { question: 'ما هو 25% من 200؟', options: ['25', '40', '50', '75'], correctAnswer: 2, category: 'رياضيات' },
        { question: 'ما هو المضاعف المشترك الأصغر لـ 4 و 6؟', options: ['8', '10', '12', '24'], correctAnswer: 2, category: 'رياضيات' },
        { question: 'كم يساوي log₂(8)؟', options: ['2', '3', '4', '8'], correctAnswer: 1, category: 'رياضيات' },
    ]
};

// Generate 6-char room code
function generateRoomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// ==================== Controllers ====================

// Create a new quiz room
exports.createRoom = async (req, res) => {
    try {
        const { questionTimer, maxPlayers } = req.body;
        let code;
        let exists = true;

        // Generate unique code
        while (exists) {
            code = generateRoomCode();
            exists = await QuizRoom.findOne({ code });
        }

        const room = new QuizRoom({
            code,
            host: req.user._id,
            players: [{ user: req.user._id, score: 0, answers: [] }],
            questionTimer: questionTimer || 15,
            maxPlayers: maxPlayers || 10
        });

        await room.save();

        res.status(201).json({
            code: room.code,
            message: 'تم إنشاء الغرفة بنجاح'
        });
    } catch (error) {
        console.error('Create room error:', error);
        res.status(500).json({ message: 'فشل في إنشاء الغرفة' });
    }
};

// Join a room by code
exports.joinRoom = async (req, res) => {
    try {
        const { code } = req.params;
        const room = await QuizRoom.findOne({ code: code.toUpperCase() });

        if (!room) {
            return res.status(404).json({ message: 'الغرفة غير موجودة' });
        }
        if (room.status !== 'waiting') {
            return res.status(400).json({ message: 'اللعبة بدأت بالفعل' });
        }
        if (room.players.length >= room.maxPlayers) {
            return res.status(400).json({ message: 'الغرفة ممتلئة' });
        }

        // Check if already joined
        const alreadyJoined = room.players.some(p => p.user.toString() === req.user._id.toString());
        if (alreadyJoined) {
            return res.json({ code: room.code, message: 'أنت موجود بالفعل في الغرفة' });
        }

        room.players.push({ user: req.user._id, score: 0, answers: [] });
        await room.save();

        res.json({ code: room.code, message: 'تم الانضمام للغرفة بنجاح' });
    } catch (error) {
        console.error('Join room error:', error);
        res.status(500).json({ message: 'فشل في الانضمام للغرفة' });
    }
};

// Get room state (polling endpoint)
exports.getRoomState = async (req, res) => {
    try {
        const { code } = req.params;
        const room = await QuizRoom.findOne({ code: code.toUpperCase() })
            .populate('host', 'username profilePhoto')
            .populate('players.user', 'username profilePhoto userType');

        if (!room) {
            return res.status(404).json({ message: 'الغرفة غير موجودة' });
        }

        // Build response
        const response = {
            code: room.code,
            host: room.host,
            players: room.players.map(p => ({
                user: p.user,
                score: p.score,
                answered: room.status === 'playing'
                    ? p.answers.some(a => a.questionIndex === room.currentQuestion)
                    : false
            })),
            status: room.status,
            currentQuestion: room.currentQuestion,
            totalQuestions: room.questions.length,
            questionTimer: room.questionTimer,
            maxPlayers: room.maxPlayers
        };

        // Include current question data if playing
        if (room.status === 'playing' && room.questions[room.currentQuestion]) {
            const q = room.questions[room.currentQuestion];
            response.question = {
                question: q.question,
                options: q.options,
                category: q.category,
                index: room.currentQuestion
            };
            response.questionStartedAt = room.questionStartedAt;

            // Check if all players answered
            const allAnswered = room.players.every(p =>
                p.answers.some(a => a.questionIndex === room.currentQuestion)
            );
            response.allAnswered = allAnswered;

            // If all answered, include correct answer
            if (allAnswered) {
                response.question.correctAnswer = q.correctAnswer;
            }
        }

        // Include final results if finished
        if (room.status === 'finished') {
            response.results = room.players
                .map(p => ({
                    user: p.user,
                    score: p.score,
                    totalCorrect: p.answers.filter(a => a.correct).length
                }))
                .sort((a, b) => b.score - a.score);
        }

        res.json(response);
    } catch (error) {
        console.error('Get room state error:', error);
        res.status(500).json({ message: 'فشل في تحميل حالة الغرفة' });
    }
};

// Host starts the game
exports.startGame = async (req, res) => {
    try {
        const { code } = req.params;
        const room = await QuizRoom.findOne({ code: code.toUpperCase() });

        if (!room) return res.status(404).json({ message: 'الغرفة غير موجودة' });
        if (room.host.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'فقط مُنشئ الغرفة يمكنه بدء اللعبة' });
        }
        if (room.questions.length === 0) {
            return res.status(400).json({ message: 'أضف أسئلة أولاً قبل بدء اللعبة' });
        }
        if (room.status !== 'waiting') {
            return res.status(400).json({ message: 'اللعبة بدأت بالفعل' });
        }

        room.status = 'playing';
        room.currentQuestion = 0;
        room.questionStartedAt = new Date();
        await room.save();

        res.json({ message: 'بدأت اللعبة!' });
    } catch (error) {
        console.error('Start game error:', error);
        res.status(500).json({ message: 'فشل في بدء اللعبة' });
    }
};

// Submit an answer
exports.submitAnswer = async (req, res) => {
    try {
        const { code } = req.params;
        const { answerIndex } = req.body;
        const room = await QuizRoom.findOne({ code: code.toUpperCase() });

        if (!room) return res.status(404).json({ message: 'الغرفة غير موجودة' });
        if (room.status !== 'playing') return res.status(400).json({ message: 'اللعبة لم تبدأ بعد' });

        const playerIndex = room.players.findIndex(p => p.user.toString() === req.user._id.toString());
        if (playerIndex === -1) return res.status(403).json({ message: 'أنت لست في هذه الغرفة' });

        // Check if already answered this question
        const alreadyAnswered = room.players[playerIndex].answers.some(
            a => a.questionIndex === room.currentQuestion
        );
        if (alreadyAnswered) return res.status(400).json({ message: 'لقد أجبت على هذا السؤال بالفعل' });

        const currentQ = room.questions[room.currentQuestion];
        const isCorrect = answerIndex === currentQ.correctAnswer;

        // Calculate time-based score
        const elapsed = Date.now() - new Date(room.questionStartedAt).getTime();
        const timeLimit = room.questionTimer * 1000;
        let points = 0;

        if (isCorrect && elapsed <= timeLimit) {
            // Faster = more points (max 1000, min 100)
            const timeRatio = Math.max(0, 1 - (elapsed / timeLimit));
            points = Math.round(100 + (900 * timeRatio));
        }

        room.players[playerIndex].answers.push({
            questionIndex: room.currentQuestion,
            answerIndex,
            correct: isCorrect,
            timeMs: elapsed
        });
        room.players[playerIndex].score += points;

        // Update user's total quiz points if correct
        if (isCorrect) {
            await User.findByIdAndUpdate(req.user._id, { $inc: { quizPoints: points } });
        }

        await room.save();

        res.json({
            correct: isCorrect,
            points,
            correctAnswer: currentQ.correctAnswer,
            totalScore: room.players[playerIndex].score
        });
    } catch (error) {
        console.error('Submit answer error:', error);
        res.status(500).json({ message: 'فشل في إرسال الإجابة' });
    }
};

// Host moves to next question
exports.nextQuestion = async (req, res) => {
    try {
        const { code } = req.params;
        const room = await QuizRoom.findOne({ code: code.toUpperCase() });

        if (!room) return res.status(404).json({ message: 'الغرفة غير موجودة' });
        if (room.host.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'فقط مُنشئ الغرفة يمكنه التقدم للسؤال التالي' });
        }

        if (room.currentQuestion >= room.questions.length - 1) {
            // Game over
            room.status = 'finished';
            await room.save();
            return res.json({ finished: true, message: 'انتهت اللعبة!' });
        }

        room.currentQuestion += 1;
        room.questionStartedAt = new Date();
        await room.save();

        res.json({ currentQuestion: room.currentQuestion, message: 'السؤال التالي' });
    } catch (error) {
        console.error('Next question error:', error);
        res.status(500).json({ message: 'فشل في الانتقال للسؤال التالي' });
    }
};

// Add custom questions
exports.addQuestions = async (req, res) => {
    try {
        const { code } = req.params;
        const { questions } = req.body;
        const room = await QuizRoom.findOne({ code: code.toUpperCase() });

        if (!room) return res.status(404).json({ message: 'الغرفة غير موجودة' });
        if (room.host.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'فقط مُنشئ الغرفة يمكنه إضافة أسئلة' });
        }
        if (room.status !== 'waiting') {
            return res.status(400).json({ message: 'لا يمكن إضافة أسئلة بعد بدء اللعبة' });
        }

        // Validate questions
        for (const q of questions) {
            if (!q.question || !q.options || q.options.length !== 4 || q.correctAnswer === undefined) {
                return res.status(400).json({ message: 'تنسيق السؤال غير صحيح' });
            }
        }

        room.questions.push(...questions);
        await room.save();

        res.json({
            message: `تم إضافة ${questions.length} سؤال`,
            totalQuestions: room.questions.length
        });
    } catch (error) {
        console.error('Add questions error:', error);
        res.status(500).json({ message: 'فشل في إضافة الأسئلة' });
    }
};

// Get preset questions
exports.getPresetQuestions = (req, res) => {
    const { category } = req.query;

    if (category && presetQuestions[category]) {
        return res.json({
            category,
            questions: presetQuestions[category]
        });
    }

    // Return categories list
    const categories = Object.keys(presetQuestions).map(cat => ({
        name: cat,
        count: presetQuestions[cat].length
    }));

    res.json({ categories });
};

// Search users to invite
exports.searchUsers = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || q.length < 2) {
            return res.json([]);
        }

        const users = await User.find({
            username: { $regex: q, $options: 'i' }
        })
            .select('username profilePhoto userType points quizPoints')
            .limit(10);

        res.json(users);
    } catch (error) {
        console.error('Search users error:', error);
        res.status(500).json({ message: 'فشل في البحث عن المستخدمين' });
    }
};
