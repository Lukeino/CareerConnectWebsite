const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();
const PORT = 3001;

// Initialize database
const dbPath = path.join(__dirname, 'src', 'database.sqlite');
console.log('Database path:', dbPath);
const db = new Database(dbPath);

// Middleware
app.use(cors());
app.use(express.json());

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    console.log('Registration request:', req.body);
    const { email, password, userType, firstName, lastName, company, phone } = req.body;
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const stmt = db.prepare(`
      INSERT INTO users (email, password, user_type, first_name, last_name, company, phone)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(email, hashedPassword, userType, firstName, lastName, company || null, phone || null);
    
    const user = { id: result.lastInsertRowid, email, userType, firstName, lastName };
    console.log('User created successfully:', user);
    res.status(201).json({ success: true, user });
  } catch (error) {
    console.error('Registration error:', error.message);
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('Login request for:', req.body.email);
    const { email, password } = req.body;
    
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    const user = stmt.get(email);
    
    if (!user) {
      return res.status(401).json({ success: false, error: 'User not found' });
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ success: false, error: 'Invalid password' });
    }
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    console.log('User authenticated successfully:', userWithoutPassword.email);
    res.json({ success: true, user: userWithoutPassword });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(401).json({ success: false, error: error.message });
  }
});

// Get all users (for debugging)
app.get('/api/users', (req, res) => {
  try {
    const stmt = db.prepare('SELECT id, email, user_type, first_name, last_name, company, phone, created_at FROM users');
    const users = stmt.all();
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running', dbPath });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📁 Database location: ${dbPath}`);
  console.log('✅ Ready to accept connections');
});
