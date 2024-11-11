//IMPORT FOR SERVER
import express from 'express';
import 'dotenv/config';
import path from 'path';
import session from 'express-session';
import { fileURLToPath } from 'url';
import cors from 'cors';

//login-validation [BACKEND]
import validateLogin from './backend/login-validation.js';

//question-bank [BACKEND]
import { fetchPrograms, fetchCourses, fetchYears, insertQuizData } from './backend/question-bank.js';

//exam-builder [BACKEND]
import { getCourseQuestions, getQuestionnaire } from './backend/exam-builder.js';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

//MIDDLEWARE
app.use(express.json());
app.use(cors())

//QUESTION POOL FETCH
app.get('/api/programs', fetchPrograms);
app.get('/api/courses', fetchCourses);
app.get('/api/years', fetchYears);
app.post('/api/quiz', insertQuizData);

//EXAM BUILDER FETCH
app.post('/api/generate', getCourseQuestions);
app.get('/get-questions/:id', getQuestionnaire)
app.use(session({
    secret: 'CPE107L-1.A361',
    resave: false,
    saveUninitialized: true,
}));


app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'frontend')));
app.use('/backend', express.static(path.join(__dirname, 'backend')));

function isAuthenticated(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/login');
    }
}

// AUTHENTICATION ROUTES
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    validateLogin(username, password, (err, row) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Internal Server Error');
        }

        if (row) {
            req.session.user = {
                username: row.Username,
                role: row.Role,
            };
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

app.get('/admin', isAuthenticated, (req, res) => {
    if (req.session.user.role === 'Admin') {
        res.sendFile(path.join(__dirname, 'frontend', 'pages', 'adminPage.html'));
    } else {
        res.status(403).send('Forbidden');
    }
});

app.get('/student', isAuthenticated, (req, res) => {
    if (req.session.user.role === 'Student') {
        res.sendFile(path.join(__dirname, 'frontend', 'pages', 'studentPage.html'));
    } else {
        res.status(403).send('Forbidden');
    }
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'pages', 'login.html'));
});

app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).send('Could not log out.');
        }
        res.status(200).send('Logout successful');
    });
});

app.get('/paper', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'pages', 'questionnaireFormat.html'));
});

app.get('/analyze-data', isAuthenticated, (req, res) => {

    if (req.session.user && req.session.user.role === 'Admin') {
        res.sendFile(path.join(__dirname, 'frontend', 'pages', 'analyzeData.html')); 
    } else {
        res.status(403).send('Access Denied');
    }
});


app.listen(3000, () => {
    console.log('Server running on port 3000');
    console.log('login page: http://localhost:3000/login');
});
