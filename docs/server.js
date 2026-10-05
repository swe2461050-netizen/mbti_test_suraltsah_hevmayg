const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 3000;
const SECRET_KEY = 'super-secret-key-for-mbti-app';

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

const USERS_FILE = path.join(__dirname, 'data', 'users.json');
const RESULTS_FILE = path.join(__dirname, 'data', 'results.json');
const QUESTIONS_FILE = path.join(__dirname, 'data', 'questions.json');

// Helper functions to read/write JSON files
const readJSON = (file) => {
    if (!fs.existsSync(file)) return [];
    const content = fs.readFileSync(file, 'utf8');
    if (!content) return [];
    try {
        return JSON.parse(content);
    } catch (e) {
        return [];
    }
};

const writeJSON = (file, data) => {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
};

// Middleware to verify token
const authenticate = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ message: 'No token provided' });
    const token = authHeader.split(' ')[1];
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(401).json({ message: 'Invalid token' });
        req.userId = decoded.id;
        req.username = decoded.username;
        next();
    });
};

// Auth Endpoints
app.post('/api/register', (req, res) => {
    const { username, password } = req.body;
    const users = readJSON(USERS_FILE);
    if (users.find(u => u.username === username)) {
        return res.status(400).json({ message: 'Хэрэглэгчийн нэр бүртгэлтэй байна' });
    }
    const hashedPassword = bcrypt.hashSync(password, 8);
    const newUser = { id: Date.now(), username, password: hashedPassword };
    users.push(newUser);
    writeJSON(USERS_FILE, users);
    res.json({ message: 'Амжилттай бүртгэгдлээ' });
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const users = readJSON(USERS_FILE);
    const user = users.find(u => u.username === username);
    if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ message: 'Нэвтрэх нэр эсвэл нууц үг буруу байна' });
    }
    const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '24h' });
    res.json({ token, username: user.username });
});

// Questions Endpoint
app.get('/api/questions', (req, res) => {
    const questions = JSON.parse(fs.readFileSync(QUESTIONS_FILE, 'utf8'));
    res.json(questions);
});

// Save Result Endpoint
app.post('/api/results', authenticate, (req, res) => {
    const { ilsScore, mbtiType } = req.body;
    const results = readJSON(RESULTS_FILE);
    const newResult = {
        id: Date.now(),
        userId: req.userId,
        username: req.username,
        ilsScore,
        mbtiType,
        date: new Date().toLocaleString('mn-MN')
    };
    results.push(newResult);
    writeJSON(RESULTS_FILE, results);
    res.json({ message: 'Үр дүн хадгалагдлаа', result: newResult });
});

// Get User History Endpoint
app.get('/api/history', authenticate, (req, res) => {
    const results = readJSON(RESULTS_FILE);
    const userHistory = results.filter(r => r.userId === req.userId);
    res.json(userHistory);
});

// Root path serving index.html
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
