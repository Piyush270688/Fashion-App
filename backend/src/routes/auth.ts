import { Router } from 'express';
import bcrypt from 'bcryptjs';
import db from '../db';
import { generateToken, authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

router.post('/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    return res.status(409).json({ error: 'Email already registered' });
  }

  const hash = bcrypt.hashSync(password, 10);
  const result = db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)').run(name, email, hash);
  const token = generateToken(result.lastInsertRowid as number);

  res.status(201).json({
    token,
    user: { id: result.lastInsertRowid, name, email },
  });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = generateToken(user.id);
  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email },
  });
});

router.get('/me', authMiddleware, (req: AuthRequest, res) => {
  const user = db.prepare('SELECT id, name, email, address, created_at FROM users WHERE id = ?').get(req.userId) as any;
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

router.put('/me', authMiddleware, (req: AuthRequest, res) => {
  const { name, address } = req.body;
  db.prepare('UPDATE users SET name = COALESCE(?, name), address = COALESCE(?, address) WHERE id = ?')
    .run(name, address, req.userId);
  const user = db.prepare('SELECT id, name, email, address FROM users WHERE id = ?').get(req.userId);
  res.json(user);
});

export default router;
