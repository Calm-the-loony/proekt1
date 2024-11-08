const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');
const { JWT_SECRET } = require('./config'); // секрет для JWT

const app = express();
const PORT = 3307;

app.use(cors());
app.use(bodyParser.json());

// Регистрация пользователя
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Хешируем пароль перед сохранением
    const hashedPassword = await bcrypt.hash(password, 10);

    // Сохраняем пользователя с хешированным паролем в базе данных
    await db.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );

    res.status(200).json({ message: 'Регистрация прошла успешно!' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(409).json({ message: 'Пользователь с таким email уже существует.' });
    } else {
      res.status(500).json({ message: 'Ошибка на сервере, попробуйте позже.' });
    }
  }
});

// Авторизация пользователя
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    const userData = rows[0];

    // Проверяем, найден ли пользователь и соответствует ли пароль
    if (userData && await bcrypt.compare(password, userData.password)) {
      // Генерируем токен
      const token = jwt.sign({ userId: userData.id }, JWT_SECRET, { expiresIn: '1h' });
      res.json({ token, message: 'Авторизация прошла успешно!' });
    } else {
      res.status(400).json({ message: 'Неверный email или пароль' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Ошибка на сервере, попробуйте позже.' });
  }
});

// Пример защищенного маршрута (проверка JWT)
app.get('/api/protected', (req, res) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ message: 'Токен не предоставлен.' });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Неверный токен.' });

    req.userId = decoded.userId;
    res.json({ message: 'Доступ разрешен.' });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
