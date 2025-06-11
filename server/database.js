const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

// Initialize database
const dbPath = path.join(__dirname, 'db', 'database.sqlite');
const db = new Database(dbPath);

// Create tables
const createTables = () => {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      user_type TEXT CHECK(user_type IN ('recruiter', 'candidate')) NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      company TEXT,
      phone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Companies table
  db.exec(`
    CREATE TABLE IF NOT EXISTS companies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      website TEXT,
      location TEXT,
      logo_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Jobs table
  db.exec(`
    CREATE TABLE IF NOT EXISTS jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      company_id INTEGER,
      recruiter_id INTEGER,
      location TEXT,
      job_type TEXT CHECK(job_type IN ('full-time', 'part-time', 'contract', 'internship')),
      salary_min INTEGER,
      salary_max INTEGER,
      requirements TEXT,
      benefits TEXT,
      status TEXT CHECK(status IN ('active', 'closed', 'draft')) DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies (id),
      FOREIGN KEY (recruiter_id) REFERENCES users (id)
    )
  `);

  console.log('Database tables created successfully');
};

// User service functions
const userService = {
  // Create new user
  createUser: async (userData) => {
    const { email, password, userType, firstName, lastName, company, phone } = userData;
    
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const stmt = db.prepare(`
        INSERT INTO users (email, password, user_type, first_name, last_name, company, phone)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      
      const result = stmt.run(email, hashedPassword, userType, firstName, lastName, company || null, phone || null);
      
      return { id: result.lastInsertRowid, email, userType, firstName, lastName };
    } catch (error) {
      throw new Error('Error creating user: ' + error.message);
    }
  },

  // Authenticate user
  authenticateUser: async (email, password) => {
    try {
      const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
      const user = stmt.get(email);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      const isValidPassword = await bcrypt.compare(password, user.password);
      
      if (!isValidPassword) {
        throw new Error('Invalid password');
      }
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      throw new Error('Authentication failed: ' + error.message);
    }
  },

  // Get user by ID
  getUserById: (id) => {
    const stmt = db.prepare('SELECT id, email, user_type, first_name, last_name, company, phone, created_at FROM users WHERE id = ?');
    return stmt.get(id);
  },

  // Get user by email
  getUserByEmail: (email) => {
    const stmt = db.prepare('SELECT id, email, user_type, first_name, last_name, company, phone, created_at FROM users WHERE email = ?');
    return stmt.get(email);
  }
};

// Job service functions
const jobService = {
  // Get all active jobs
  getAllJobs: () => {
    const stmt = db.prepare(`
      SELECT j.*, c.name as company_name, u.first_name as recruiter_first_name, u.last_name as recruiter_last_name
      FROM jobs j
      LEFT JOIN companies c ON j.company_id = c.id
      LEFT JOIN users u ON j.recruiter_id = u.id
      WHERE j.status = 'active'
      ORDER BY j.created_at DESC
    `);
    return stmt.all();
  },

  // Search jobs
  searchJobs: (searchTerm, location) => {
    let query = `
      SELECT j.*, c.name as company_name, u.first_name as recruiter_first_name, u.last_name as recruiter_last_name
      FROM jobs j
      LEFT JOIN companies c ON j.company_id = c.id
      LEFT JOIN users u ON j.recruiter_id = u.id
      WHERE j.status = 'active'
    `;
    
    const params = [];
    
    if (searchTerm) {
      query += ` AND (j.title LIKE ? OR j.description LIKE ? OR c.name LIKE ?)`;
      const searchPattern = `%${searchTerm}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }
    
    if (location) {
      query += ` AND j.location LIKE ?`;
      params.push(`%${location}%`);
    }
    
    query += ` ORDER BY j.created_at DESC`;
    
    const stmt = db.prepare(query);
    return stmt.all(...params);
  }
};

// Initialize database on module load
createTables();

module.exports = {
  db,
  userService,
  jobService
};
