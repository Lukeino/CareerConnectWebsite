const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

// Create database
const dbPath = path.join(__dirname, 'server', 'db', 'database.sqlite');
console.log('Creating database at:', dbPath);

try {
  const db = new Database(dbPath);
  console.log('Database connection established successfully');

// Create tables
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

// Add some sample data
async function addSampleData() {
  // Sample companies
  const insertCompany = db.prepare(`
    INSERT INTO companies (name, description, website, location, logo_url)
    VALUES (?, ?, ?, ?, ?)
  `);

  const companies = [
    ['TechCorp', 'Leading technology company', 'https://techcorp.com', 'Milano, Italy', null],
    ['InnovateLab', 'Innovation and research laboratory', 'https://innovatelab.com', 'Roma, Italy', null],
    ['StartupHub', 'Fast-growing startup', 'https://startuphub.com', 'Torino, Italy', null]
  ];

  companies.forEach(company => {
    insertCompany.run(...company);
  });

  // Sample users
  const insertUser = db.prepare(`
    INSERT INTO users (email, password, user_type, first_name, last_name, company, phone)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const users = [
    ['recruiter@techcorp.com', hashedPassword, 'recruiter', 'Marco', 'Rossi', 'TechCorp', '+39 123 456 7890'],
    ['candidate@email.com', hashedPassword, 'candidate', 'Laura', 'Bianchi', null, '+39 098 765 4321'],
    ['hr@innovatelab.com', hashedPassword, 'recruiter', 'Giulia', 'Verdi', 'InnovateLab', '+39 111 222 3333']
  ];

  users.forEach(user => {
    insertUser.run(...user);
  });

  // Sample jobs
  const insertJob = db.prepare(`
    INSERT INTO jobs (title, description, company_id, recruiter_id, location, job_type, salary_min, salary_max, requirements, benefits, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const jobs = [
    [
      'Frontend Developer',
      'Sviluppatore frontend con esperienza in React e TypeScript.',
      1, 1, 'Milano, Italy', 'full-time', 35000, 45000,
      'React, TypeScript, CSS, Git',
      'Assicurazione sanitaria, buoni pasto, smart working',
      'active'
    ],
    [
      'Backend Developer',
      'Sviluppatore backend per API REST e microservizi.',
      2, 3, 'Roma, Italy', 'full-time', 40000, 55000,
      'Node.js, Python, PostgreSQL, Docker',
      'Assicurazione sanitaria, formazione continua',
      'active'
    ],
    [
      'UI/UX Designer',
      'Designer per interfacce utente moderne e intuitive.',
      3, 1, 'Torino, Italy', 'part-time', 25000, 35000,
      'Figma, Adobe Creative Suite, Prototipazione',
      'Orari flessibili, ambiente creativo',
      'active'
    ]
  ];

  jobs.forEach(job => {
    insertJob.run(...job);
  });
}

// Execute
addSampleData().then(() => {
  console.log('Database created successfully with sample data!');
  console.log('Database file location:', dbPath);
  db.close();
}).catch(error => {
  console.error('Error creating database:', error);
  db.close();
});

} catch (error) {
  console.error('Failed to create database:', error);
}
