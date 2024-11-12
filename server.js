// Import required modules for server setup
import express from 'express';
import 'dotenv/config';
import path from 'path';
import session from 'express-session';
import { fileURLToPath } from 'url';
import cors from 'cors';
import fileUpload from 'express-fileupload';

// Import login validation functionality
import validateLogin from './backend/login-validation.js';

// Import question bank related functions
import { fetchPrograms, fetchCourses, fetchYears, insertQuizData, fetchQuestions } from './backend/question-bank.js';

// Import exam builder related functions
import { getCourseQuestions, getQuestionnaire } from './backend/exam-builder.js';
import { createClient } from '@supabase/supabase-js';

// Import data analysis related functions
import { analyzeData, getPrograms } from './backend/analyze-data.js';

// Configure Supabase client with environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

// Set up directory paths for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express application
const app = express();

// Configure middleware
app.use(express.json());
app.use(cors())
app.use(fileUpload({
    createParentPath: true,
    limits: { 
        fileSize: 2 * 1024 * 1024 // Limit file size to 2MB
    },
}));

// Question pool API endpoints
app.get('/api/programs', fetchPrograms);
app.get('/api/courses', fetchCourses);
app.get('/api/years', fetchYears);
app.post('/api/quiz', insertQuizData);
app.get('/api/questions', fetchQuestions);

// Exam builder API endpoints
app.post('/api/generate', getCourseQuestions);
app.get('/get-questions/:id', getQuestionnaire)
app.use(session({
    secret: 'CPE107L-1.A361',
    resave: false,
    saveUninitialized: true,
}));

// Additional middleware setup
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'frontend')));
app.use('/backend', express.static(path.join(__dirname, 'backend')));

// Authentication middleware
function isAuthenticated(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/login');
    }
}

// Authentication routes
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    validateLogin(username, password, (err, row) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Internal Server Error');
        }

        if (row) {
            // Store user session data
            req.session.user = {
                username: row.Username,
                role: row.Role,
            };
            // Redirect based on user role
            if (row.Role === 'Admin') {
                res.redirect('/admin');
            } else if (row.Role === 'Student') {
                res.redirect('/student');
            } else {
                res.send('Invalid role');
            }
        } else {
            res.send('Invalid credentials');
        }
    });
});

// Protected admin route
app.get('/admin', isAuthenticated, (req, res) => {
    if (req.session.user.role === 'Admin') {
        res.sendFile(path.join(__dirname, 'frontend', 'pages', 'adminPage.html'));
    } else {
        res.status(403).send('Forbidden');
    }
});

// Protected student route
app.get('/student', isAuthenticated, (req, res) => {
    if (req.session.user.role === 'Student') {
        res.sendFile(path.join(__dirname, 'frontend', 'pages', 'studentPage.html'));
    } else {
        res.status(403).send('Forbidden');
    }
});

// Login page route
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'pages', 'login.html'));
});

// Logout route
app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).send('Could not log out.');
        }
        res.status(200).send('Logout successful');
    });
});

// Paper/questionnaire route
app.get('/paper', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'pages', 'questionnaireFormat.html'));
});

// Protected data analysis route
app.get('/analyze-data', isAuthenticated, (req, res) => {
    if (req.session.user && req.session.user.role === 'Admin') {
        res.sendFile(path.join(__dirname, 'frontend', 'pages', 'analyzeData.html')); 
    } else {
        res.status(403).send('Access Denied');
    }
});

// Data analysis API endpoints
app.post('/api/analyze-data', analyzeData);
app.get('/api/analyze-programs', getPrograms);

// Start the server
app.listen(3000, () => {
    console.log('Server running on port 3000');
    console.log('login page: http://localhost:3000/login');
});
