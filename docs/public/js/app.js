const API_URL = 'http://localhost:3000/api';
let currentUser = null;
let token = localStorage.getItem('token');

// Page state
const state = {
    questions: null,
    answers: { ils: {}, mbti: {} },
    currentTest: 'ils' // or 'mbti'
};

async function init() {
    if (token) {
        currentUser = localStorage.getItem('username');
        showPage('dashboard');
    } else {
        showPage('login');
    }
}

function showPage(page) {
    const main = document.getElementById('main-content');
    const nav = document.getElementById('navbar');
    
    if (page === 'login' || page === 'register') {
        nav.classList.add('hidden');
    } else {
        nav.classList.remove('hidden');
    }

    switch(page) {
        case 'login':
            main.innerHTML = `
                <div class="auth-container">
                    <h1 class="glitch">Нэвтрэх</h1>
                    <input type="text" id="login-user" placeholder="Хэрэглэгчийн нэр">
                    <input type="password" id="login-pass" placeholder="Нууц үг">
                    <button onclick="login()">Нэвтрэх</button>
                    <p>Бүртгэлгүй юу? <a href="#" onclick="showPage('register')">Бүртгүүлэх</a></p>
                </div>
            `;
            break;
        case 'register':
            main.innerHTML = `
                <div class="auth-container">
                    <h1 class="glitch">Бүртгүүлэх</h1>
                    <input type="text" id="reg-user" placeholder="Хэрэглэгчийн нэр">
                    <input type="password" id="reg-pass" placeholder="Нууц үг">
                    <button onclick="register()">Бүртгүүлэх</button>
                    <p>Бүртгэлтэй юу? <a href="#" onclick="showPage('login')">Нэвтрэх</a></p>
                </div>
            `;
            break;
        case 'dashboard':
            renderDashboard();
            break;
        case 'test':
            renderTest();
            break;
    }
}

// Auth Functions
async function login() {
    const username = document.getElementById('login-user').value;
    const password = document.getElementById('login-pass').value;
    try {
        const res = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (res.ok) {
            token = data.token;
            currentUser = data.username;
            localStorage.setItem('token', token);
            localStorage.setItem('username', currentUser);
            showPage('dashboard');
        } else {
            alert(data.message);
        }
    } catch (e) { alert('Сервертэй холбогдоход алдаа гарлаа'); }
}

async function register() {
    const username = document.getElementById('reg-user').value;
    const password = document.getElementById('reg-pass').value;
    try {
        const res = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (res.ok) {
            alert('Бүртгэл амжилттай! Одоо нэвтэрнэ үү.');
            showPage('login');
        } else {
            alert(data.message);
        }
    } catch (e) { alert('Сервертэй холбогдоход алдаа гарлаа'); }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    token = null;
    currentUser = null;
    showPage('login');
}

// Test Functions
async function renderTest() {
    const main = document.getElementById('main-content');
    if (!state.questions) {
        const res = await fetch(`${API_URL}/questions`);
        state.questions = await res.json();
    }

    const questions = state.currentTest === 'ils' ? state.questions.ils : state.questions.mbti;
    const title = state.currentTest === 'ils' ? 'ILS Суралцах хэв маягийн тест' : 'MBTI Зан төлөвийн тест';

    let html = `<div class="test-container">
        <h2 class="neon-text">${title}</h2>
        <div id="questions-list">`;

    questions.forEach(q => {
        html += `
            <div class="question-card">
                <p>${q.id}. ${q.text}</p>
                ${q.options.map(opt => `
                    <button class="option-btn ${state.answers[state.currentTest][q.id] === opt.value ? 'selected' : ''}" 
                            onclick="selectOption('${state.currentTest}', ${q.id}, '${opt.value}')">
                        ${opt.text}
                    </button>
                `).join('')}
            </div>
        `;
    });

    html += `</div>
        <button onclick="submitTest()">Үр дүнг харах</button>
    </div>`;
    main.innerHTML = html;
}

function selectOption(testType, qId, value) {
    state.answers[testType][qId] = value;
    renderTest();
}

async function submitTest() {
    const questions = state.currentTest === 'ils' ? state.questions.ils : state.questions.mbti;
    if (Object.keys(state.answers[state.currentTest]).length < questions.length) {
        alert('Бүх асуултанд хариулна уу!');
        return;
    }

    if (state.currentTest === 'ils') {
        state.currentTest = 'mbti';
        renderTest();
    } else {
        // Calculate and Save
        const ilsScore = calculateILS(state.answers.ils);
        const mbtiType = calculateMBTI(state.answers.mbti);
        
        const res = await fetch(`${API_URL}/results`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ ilsScore, mbtiType })
        });
        
        if (res.ok) {
            alert('Тест амжилттай дууслаа!');
            showPage('dashboard');
        }
    }
}

function calculateILS(answers) {
    // Simplified calculation for demo
    const scores = { act_ref: 0, sen_int: 0, vis_ver: 0, seq_glo: 0 };
    Object.values(answers).forEach(val => {
        if (val === 'active') scores.act_ref++;
        if (val === 'sensing') scores.sen_int++;
        if (val === 'visual') scores.vis_ver++;
        if (val === 'sequential') scores.seq_glo++;
    });
    return scores;
}

function calculateMBTI(answers) {
    const counts = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
    Object.values(answers).forEach(val => counts[val]++);
    let type = '';
    type += counts.E >= counts.I ? 'E' : 'I';
    type += counts.S >= counts.N ? 'S' : 'N';
    type += counts.T >= counts.F ? 'T' : 'F';
    type += counts.J >= counts.P ? 'J' : 'P';
    return type;
}

// Dashboard Functions
async function renderDashboard() {
    const main = document.getElementById('main-content');
    const res = await fetch(`${API_URL}/history`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const history = await res.json();

    main.innerHTML = `
        <div class="dashboard-container">
            <h1 class="glitch">Сайн уу, ${currentUser}!</h1>
            <div class="stats-grid">
                <div class="card">
                    <h3>Сүүлийн үр дүн</h3>
                    ${history.length > 0 ? renderLatestResult(history[history.length-1]) : '<p>Тест өгөөгүй байна.</p>'}
                </div>
                <div class="card">
                    <h3>Тестийн түүх</h3>
                    <div id="history-list">
                        ${history.map(h => `
                            <div class="history-item">
                                <span>${h.date}</span>
                                <span>MBTI: ${h.mbtiType}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
            <button onclick="startNewTest()">Шинэ тест эхлэх</button>
        </div>
    `;

    if (history.length > 0) {
        renderChart(history[history.length-1]);
    }
}

function renderLatestResult(result) {
    return `
        <div class="latest-res">
            <p><strong>MBTI Төрөл:</strong> ${result.mbtiType}</p>
            <canvas id="resultChart"></canvas>
            <div class="interpretation">
                <h4>Тайлбар:</h4>
                <p>${getMBTIInterpretation(result.mbtiType)}</p>
            </div>
        </div>
    `;
}

function getMBTIInterpretation(type) {
    const interpretations = {
        'INTJ': 'Архитектор: Бүх зүйлд төлөвлөгөөтэй ханддаг, стратегийн сэтгэгч.',
        'ENFP': 'Ухуулагч: Эрч хүчтэй, бүтээлч, нийтэч сэтгэлгээтэй.',
        'ISTJ': 'Логистикч: Бодит байдалд тулгуурладаг, хариуцлагатай.',
        'ESTP': 'Бизнесмэн: Эрсдэлд дуртай, эрч хүчтэй, хурдтай.'
        // ... can add more
    };
    return interpretations[type] || 'Таны зан төлөвийн онцлог маш өвөрмөц юм.';
}

function renderChart(result) {
    const ctx = document.getElementById('resultChart').getContext('2d');
    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['Active', 'Sensing', 'Visual', 'Sequential'],
            datasets: [{
                label: 'ILS Score',
                data: [result.ilsScore.act_ref, result.ilsScore.sen_int, result.ilsScore.vis_ver, result.ilsScore.seq_glo],
                backgroundColor: 'rgba(255, 0, 127, 0.2)',
                borderColor: 'rgba(255, 0, 127, 1)',
                borderWidth: 2
            }]
        },
        options: {
            scales: {
                r: {
                    beginAtZero: true,
                    max: 5,
                    grid: { color: '#444' },
                    angleLines: { color: '#444' }
                }
            }
        }
    });
}

function startNewTest() {
    state.answers = { ils: {}, mbti: {} };
    state.currentTest = 'ils';
    showPage('test');
}

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    document.body.classList.toggle('light-mode');
}

init();
