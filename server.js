// ─────────────────────────────────────────────
//  VORTEX Backend — server.js
//  Stack: Node.js + Express + SQLite (dev) / Postgres (prod)
// ─────────────────────────────────────────────

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'vortex_jwt_secret_change_in_prod';

// ─── MIDDLEWARE ───
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // serve frontend

// ─── DATABASE SETUP ───
const db = new Database('./vortex.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT,
    body TEXT NOT NULL,
    status TEXT DEFAULT 'new',
    ip TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Seed admin user if not exists
const adminExists = db.prepare("SELECT id FROM users WHERE email = 'admin@vortex.com'").get();
if (!adminExists) {
  const hash = bcrypt.hashSync('vortex123', 10);
  db.prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)")
    .run('Admin', 'admin@vortex.com', hash, 'admin');
}

// ─── AUTH MIDDLEWARE ───
function requireAuth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    next();
  });
}

// ─── ROUTES ───

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── AUTH ──

// Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  });
});

// Register
app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  if (password.length < 6) return res.status(400).json({ error: 'Password must be 6+ characters' });

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) return res.status(409).json({ error: 'Email already registered' });

  const hash = bcrypt.hashSync(password, 10);
  const result = db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)').run(name || 'User', email, hash);

  const token = jwt.sign(
    { id: result.lastInsertRowid, email, role: 'user', name: name || 'User' },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.status(201).json({ token, user: { id: result.lastInsertRowid, name, email, role: 'user' } });
});

// Get current user
app.get('/api/auth/me', requireAuth, (req, res) => {
  const user = db.prepare('SELECT id, name, email, role, created_at FROM users WHERE id = ?').get(req.user.id);
  res.json(user);
});

// ── CONTACT / MESSAGES ──

// Submit contact form
app.post('/api/contact', (req, res) => {
  const { name, email, subject, body } = req.body;
  if (!name || !email || !body) return res.status(400).json({ error: 'Name, email, and message required' });

  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const result = db.prepare(
    'INSERT INTO messages (name, email, subject, body, ip) VALUES (?, ?, ?, ?, ?)'
  ).run(name, email, subject || 'No subject', body, ip);

  res.status(201).json({
    success: true,
    id: result.lastInsertRowid,
    message: 'Your message has been received. We\'ll respond within 24 hours.'
  });
});

// Get all messages (admin only)
app.get('/api/messages', requireAdmin, (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  let query = 'SELECT * FROM messages';
  const params = [];
  if (status) { query += ' WHERE status = ?'; params.push(status); }
  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(Number(limit), offset);

  const messages = db.prepare(query).all(...params);
  const total = db.prepare('SELECT COUNT(*) as count FROM messages' + (status ? ' WHERE status = ?' : '')).get(...(status ? [status] : []));

  res.json({ messages, total: total.count, page: Number(page), limit: Number(limit) });
});

// Get message stats (admin only)
app.get('/api/messages/stats', requireAdmin, (req, res) => {
  const total = db.prepare('SELECT COUNT(*) as count FROM messages').get().count;
  const unread = db.prepare("SELECT COUNT(*) as count FROM messages WHERE status = 'new'").get().count;
  const today = db.prepare("SELECT COUNT(*) as count FROM messages WHERE DATE(created_at) = DATE('now')").get().count;
  res.json({ total, unread, today });
});

// Mark message as read (admin only)
app.patch('/api/messages/:id', requireAdmin, (req, res) => {
  const { status } = req.body;
  db.prepare('UPDATE messages SET status = ? WHERE id = ?').run(status, req.params.id);
  res.json({ success: true });
});

// Delete message (admin only)
app.delete('/api/messages/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM messages WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ── USERS (admin) ──
app.get('/api/users', requireAdmin, (req, res) => {
  const users = db.prepare('SELECT id, name, email, role, created_at FROM users').all();
  res.json(users);
});

// ─── FALLBACK → serve frontend ───
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ─── START ───
app.listen(PORT, () => {
  console.log(`\n🚀 VORTEX Backend running on http://localhost:${PORT}`);
  console.log(`   → API health: http://localhost:${PORT}/api/health`);
  console.log(`   → Admin:      admin@vortex.com / vortex123\n`);
});

module.exports = app;
