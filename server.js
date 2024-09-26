const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const validateLogin = require('./backend/login-validation');
const session = require('express-session');
require('dotenv').config();

const app = express();

app.use(session({
    secret: 'CPE107L-1.A361',
    resave: false,
    saveUninitialized: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'frontend')));


function isAuthenticated(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/login');
    }
}

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

app.listen(3000, () => {
    console.log('Server running on port 3000');
    console.log('login page: http://localhost:3000/login');
});
