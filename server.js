const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY || 'your_secret_key';

app.use(bodyParser.json());
app.use(cors({
    origin: 'https://mute1.netlify.app', // اسم النطاق الخاص بك على Netlify
    credentials: true
}));
app.use(express.static('public'));

// إنشاء قاعدة بيانات SQLite
const db = new sqlite3.Database('./database.db');

// إنشاء جدول المستخدمين
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            profileImage TEXT DEFAULT 'profile-icon.png',
            lastNameChange TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS servers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            image TEXT,
            owner_id INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (owner_id) REFERENCES users(id)
        )
    `);
});

// تسجيل مستخدم جديد
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ message: 'الرجاء إدخال جميع الحقول المطلوبة' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    db.run(
        'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
        [username, email, hashedPassword],
        function (err) {
            if (err) {
                return res.status(400).json({ message: 'اسم المستخدم أو البريد الإلكتروني موجود مسبقًا' });
            }

            const token = jwt.sign({ id: this.lastID, username }, SECRET_KEY, { expiresIn: '1h' });
            res.status(201).json({ token, username });
        }
    );
});

// تسجيل الدخول
app.post('/login', (req, res) => {
    const { usernameOrEmail, password } = req.body;
    if (!usernameOrEmail || !password) {
        return res.status(400).json({ message: 'الرجاء إدخال جميع الحقول' });
    }

    db.get(
        'SELECT * FROM users WHERE username = ? OR email = ?',
        [usernameOrEmail, usernameOrEmail],
        async (err, user) => {
            if (err || !user) {
                return res.status(400).json({ message: 'اسم المستخدم أو البريد الإلكتروني غير صحيح' });
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(400).json({ message: 'كلمة المرور غير صحيحة' });
            }

            const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });
            res.json({ token, username: user.username, profileImage: user.profileImage, lastNameChange: user.lastNameChange });
        }
    );
});

// إنشاء سيرفر
app.post('/create-server', (req, res) => {
    const { name, image, ownerId } = req.body;
    if (!name || !ownerId) {
        return res.status(400).json({ message: 'الرجاء إدخال جميع الحقول المطلوبة' });
    }

    db.run(
        'INSERT INTO servers (name, image, owner_id) VALUES (?, ?, ?)',
        [name, image, ownerId],
        function (err) {
            if (err) {
                return res.status(400).json({ message: 'حدث خطأ أثناء إنشاء السيرفر' });
            }
            res.status(201).json({ message: 'تم إنشاء السيرفر بنجاح' });
        }
    );
});

// الصفحة الخاصة
app.get('/private', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'غير مصرح به' });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        db.get('SELECT * FROM users WHERE id = ?', [decoded.id], (err, user) => {
            if (err || !user) {
                return res.status(404).json({ message: 'المستخدم غير موجود' });
            }
            res.json(user);
        });
    } catch (err) {
        res.status(401).json({ message: 'توكن غير صالح' });
    }
});

// تشغيل الخادم
app.listen(PORT, () => {
    console.log(`الخادم يعمل على http://localhost:${PORT}`);
});