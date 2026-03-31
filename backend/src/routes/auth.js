const { Router } = require('express');
const bcrypt = require('bcryptjs');
const { getDb, allRows, getRow } = require('../db');
const { generateToken, authMiddleware } = require('../middleware/auth');

const router = Router();

router.post('/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Name, email, and password are required' });
  const db = getDb();
  const existing = getRow(db.exec("SELECT id FROM users WHERE email = ?", [email]));
  if (existing) return res.status(409).json({ error: 'Email already registered' });
  const hash = bcrypt.hashSync(password, 10);
  db.run('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hash]);
  const user = getRow(db.exec("SELECT last_insert_rowid() as id"));
  const userId = user.id;
  const token = generateToken(userId);
  res.status(201).json({ token, user: { id: userId, name, email } });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
  const db = getDb();
  const user = getRow(db.exec("SELECT * FROM users WHERE email = ?", [email]));
  if (!user || !bcrypt.compareSync(password, user.password)) return res.status(401).json({ error: 'Invalid email or password' });
  const token = generateToken(user.id);
  res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

router.get('/me', authMiddleware, (req, res) => {
  const db = getDb();
  const user = getRow(db.exec("SELECT id, name, email, address, created_at FROM users WHERE id = ?", [req.userId]));
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

module.exports = router;
