require('dotenv').config();
const mongoose = require('mongoose');
const News = require('../models/News');
const ActivityLog = require('../models/ActivityLog');
const User = require('../models/User');

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing data (optional, but good for testing)
        // await News.deleteMany({});
        // await ActivityLog.deleteMany({});

        // Seed News
        const newsCount = await News.countDocuments();
        if (newsCount === 0) {
            console.log('Seeding news...');
            const sampleNews = [
                {
                    title: 'إطلاق برنامج القيادة الشامل 2024',
                    description: 'نعلن عن انطلاق النسخة الجديدة من برنامج القيادة الشامل الذي صمم خصيصًا لتطوير مهارات القيادة لدى الشباب. البرنامج يشمل ورش عمل متخصصة، جلسات إرشادية، وتحديات عملية.',
                    category: 'برامج قيادية',
                    date: '2024-01-15',
                    imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f',
                    time: '10:00'
                },
                {
                    title: 'فوز فريق المنتدى بجائزة التميز الشبابي',
                    description: 'فاز فريق المنتدى بجائزة التميز الشبابي على مستوى المنطقة العربية بعد منافسة قوية مع أكثر من 50 فريقاً من مختلف الدول.',
                    category: 'إنجازات',
                    date: '2024-02-10',
                    imageUrl: 'https://images.unsplash.com/photo-1556761175-b413da4baf72',
                    time: '14:30'
                },
                {
                    title: 'ورشة عمل حول الذكاء الاصطناعي',
                    description: 'انضم إلينا في ورشة عمل تفاعلية حول تطبيقات الذكاء الاصطناعي في مجال التعليم والتدريب، بمشاركة خبراء محليين ودوليين.',
                    category: 'تكنولوجيا',
                    date: '2024-03-05',
                    imageUrl: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0',
                    time: '09:00'
                },
                {
                    title: 'حملة شباب الخير التطوعية',
                    description: 'شارك معنا في حملة شباب الخير لتوزيع المساعدات العينية ومساندة الأسر المحتاجة خلال شهر رمضان المبارك.',
                    category: 'تطوع',
                    date: '2024-03-10',
                    imageUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433',
                    time: '16:00'
                },
                {
                    title: 'ندوة "مستقبل العمل الحر"',
                    description: 'ندوة حوارية لمناقشة تحديات وفرص العمل الحر في العالم العربي، وكيفية بناء مسار مهني ناجح كمستقل.',
                    category: 'ريادة أعمال',
                    date: '2024-03-15',
                    imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4',
                    time: '18:00'
                }
            ];
            await News.insertMany(sampleNews);
            console.log('Sample news seeded!');
        } else {
            console.log('News data already exists.');
        }

        // Seed Logs
        const logsCount = await ActivityLog.countDocuments();
        if (logsCount === 0) {
            console.log('Seeding activity logs...');

            // Get a user ID to associate logs with (e.g., admin)
            const admin = await User.findOne({ role: 'admin' });
            const adminId = admin ? admin._id : null;

            const sampleLogs = [
                {
                    userId: adminId,
                    action: 'LOGIN',
                    details: 'تم تسجيل دخول المشرف',
                    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
                },
                {
                    userId: adminId,
                    action: 'REGISTER',
                    details: 'تسجيل مستخدم جديد: Sarah',
                    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5) // 5 hours ago
                },
                {
                    userId: adminId,
                    action: 'LOGIN',
                    details: 'تم تسجيل دخول المشرف',
                    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1 day ago
                }
            ];
            await ActivityLog.insertMany(sampleLogs);
            console.log('Sample logs seeded!');
        } else {
            console.log('Activity logs already exist.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
