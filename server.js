require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');

const app = express();
app.set('trust proxy', 1);

// Security Middleware
app.use(helmet({
    contentSecurityPolicy: false, 
    crossOriginEmbedderPolicy: false // Disabled these two globally as they can block external CDN assets like fonts/icons unless specifically configured
}));
app.use(mongoSanitize());

// General Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());
app.use('/uploads', express.static('uploads'));

// Global Request Logger
app.use((req, res, next) => {
    if (req.url.startsWith('/api/')) {
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    }
    next();
});

// Whitelist allowed static files (only allowed as resources, not direct navigation)
const allowedFiles = [
    '/index.html',
    '/app.js',
    '/style.css',
    '/EYFV.mp4',
    '/scripts/lang.js'
];

// Advanced Security & Access Control
app.use((req, res, next) => {
    const url = req.path;
    const fetchDest = req.get('sec-fetch-dest'); // 'document', 'script', 'style', 'video', etc.
    
    // 1. Allow API routes to proceed to router
    if (url.startsWith('/api/')) {
        return next();
    }
    
    // 2. Block direct folder access (any URL ending with / or not having a dot)
    if (url.endsWith('/') && url !== '/') {
        return res.status(404).sendFile(__dirname + '/index.html');
    }

    // 3. Handle Direct Address Bar Navigation (Sec-Fetch-Dest: document)
    if (fetchDest === 'document') {
        // Allow root, index.html, or any SPA route (no dot in the last segment)
        const isFile = url.split('/').pop().includes('.');
        if (url === '/' || url === '/index.html' || !isFile) {
            return res.sendFile(__dirname + '/index.html');
        }
        
        // For any direct file URL (like typing /app.js or /EYFV.mp4)
        // serve index.html with 404 status to trigger the SPA's nice 404 page
        return res.status(404).sendFile(__dirname + '/index.html');
    }
    
    // 4. Handle Resource Loading (Images, Videos, Scripts, Styles)
    // Only serve if it's whitelisted OR in the uploads directory
    if (allowedFiles.includes(url) || url.startsWith('/uploads/')) {
        return res.sendFile(__dirname + url, (err) => {
            if (err && !res.headersSent) {
                res.status(404).sendFile(__dirname + '/index.html');
            }
        });
    }
    
    // 5. Default Catch-all: serve index.html with 404 for any other path
    res.status(404).sendFile(__dirname + '/index.html', (err) => {
        if (err && !res.headersSent) {
            res.status(404).send('404 Page Not Found');
        }
    });
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/news', require('./routes/newsRoutes'));
app.use('/api/user', require('./routes/userRoutes'));
app.use('/api/logs', require('./routes/logRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/registrations', require('./routes/registrationsRoutes'));
app.use('/api/quiz', require('./routes/quizRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api/archive', require('./routes/archiveRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/certificates', require('./routes/certificateRoutes'));


// Database Connection
const MONGODB_URI = process.env.MONGODB_URI;
mongoose.connect(MONGODB_URI)
    .then(() => console.log('Successfully connected to MongoDB Atlas!'))
    .catch((error) => console.error('Error connecting to MongoDB Atlas:', error));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
