const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = 3001;

// Initialize database
const dbPath = path.join(__dirname, 'server', 'db', 'database.sqlite');
console.log('Database path:', dbPath);
const db = new Database(dbPath);

// Create applications table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_id INTEGER NOT NULL,
    candidate_id INTEGER NOT NULL,
    candidate_name TEXT NOT NULL,
    candidate_email TEXT NOT NULL,
    applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'pending',
    FOREIGN KEY (job_id) REFERENCES jobs (id),
    FOREIGN KEY (candidate_id) REFERENCES users (id),
    UNIQUE(job_id, candidate_id)  )
`);

// CORS configuration to allow both localhost and production
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174',
    'https://careerconnectproject.netlify.app',
    'https://main--careerconnectproject.netlify.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Configure multer for CV uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'uploads');
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename: userId_timestamp_originalname
    const userId = req.body.userId;
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const filename = `cv_${userId}_${timestamp}${ext}`;
    cb(null, filename);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Only allow PDF files
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed!'), false);
    }
  }
});

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// === CV UPLOAD ENDPOINT ===
app.post('/api/upload-cv', upload.single('cv'), async (req, res) => {
  try {
    const { userId } = req.body;
    const file = req.file;

    console.log('CV Upload request:', { userId, file: file ? file.filename : 'no file' });

    if (!file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    // Check if user exists and is a candidate
    const userStmt = db.prepare('SELECT id, user_type, cv_filename FROM users WHERE id = ?');
    const user = userStmt.get(userId);

    if (!user) {
      // Delete uploaded file if user doesn't exist
      fs.unlinkSync(file.path);
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (user.user_type !== 'candidate') {
      // Delete uploaded file if user is not a candidate
      fs.unlinkSync(file.path);
      return res.status(403).json({ success: false, error: 'Only candidates can upload CVs' });
    }

    // Delete old CV file if exists
    if (user.cv_filename) {
      const oldFilePath = path.join(__dirname, 'uploads', user.cv_filename);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
        console.log('Old CV file deleted:', user.cv_filename);
      }
    }

    // Update user record with new CV filename
    const updateStmt = db.prepare('UPDATE users SET cv_filename = ? WHERE id = ?');
    const result = updateStmt.run(file.filename, userId);

    if (result.changes > 0) {
      console.log('CV uploaded successfully:', file.filename);
      res.json({
        success: true,
        message: 'CV uploaded successfully',
        filename: file.filename,
        downloadUrl: `/uploads/${file.filename}`
      });
    } else {
      // Delete uploaded file if database update failed
      fs.unlinkSync(file.path);
      res.status(500).json({ success: false, error: 'Failed to update user record' });
    }

  } catch (error) {
    console.error('Error uploading CV:', error);
    
    // Delete uploaded file if there was an error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, error: 'File too large. Maximum size is 5MB.' });
    }

    if (error.message === 'Only PDF files are allowed!') {
      return res.status(400).json({ success: false, error: 'Only PDF files are allowed.' });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to upload CV',
      details: error.message
    });  }
});

// Get user CV info
app.get('/api/user/:userId/cv', (req, res) => {
  try {
    const { userId } = req.params;
    
    const stmt = db.prepare('SELECT cv_filename FROM users WHERE id = ? AND user_type = ?');
    const user = stmt.get(userId, 'candidate');
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    res.json({
      success: true,
      hasCV: !!user.cv_filename,
      filename: user.cv_filename,
      downloadUrl: user.cv_filename ? `/uploads/${user.cv_filename}` : null
    });
    
  } catch (error) {
    console.error('Error getting user CV info:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get CV info',
      details: error.message
    });  }
});

// Delete user CV
app.delete('/api/user/:userId/cv', (req, res) => {
  try {
    const { userId } = req.params;
    
    const stmt = db.prepare('SELECT cv_filename FROM users WHERE id = ? AND user_type = ?');
    const user = stmt.get(userId, 'candidate');
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    if (!user.cv_filename) {
      return res.status(400).json({ success: false, error: 'No CV to delete' });
    }
    
    // Delete file from filesystem
    const filePath = path.join(__dirname, 'uploads', user.cv_filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log('CV file deleted:', user.cv_filename);
    }
    
    // Update database
    const updateStmt = db.prepare('UPDATE users SET cv_filename = NULL WHERE id = ?');
    const result = updateStmt.run(userId);
    
    if (result.changes > 0) {
      res.json({
        success: true,
        message: 'CV deleted successfully'
      });
    } else {
      res.status(500).json({ success: false, error: 'Failed to update user record' });
    }
    
  } catch (error) {
    console.error('Error deleting CV:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete CV',
      details: error.message
    });
  }
});

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    console.log('Registration request:', req.body);
    const { email, password, userType, firstName, lastName, company, phone } = req.body;
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert user
    const stmt = db.prepare(`
      INSERT INTO users (email, password, user_type, first_name, last_name, company, phone)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(email, hashedPassword, userType, firstName, lastName, company || null, phone || null);
    
    // If it's a recruiter with a company, save the company to companies table
    if (userType === 'recruiter' && company && company.trim() !== '') {
      try {
        // Check if company already exists
        const checkCompanyStmt = db.prepare('SELECT id FROM companies WHERE name = ?');
        const existingCompany = checkCompanyStmt.get(company.trim());
        
        if (!existingCompany) {
          // Insert new company
          const insertCompanyStmt = db.prepare(`
            INSERT INTO companies (name, description, website, location)
            VALUES (?, ?, ?, ?)
          `);
          const companyDescription = `Azienda specializzata nel settore IT con focus su innovation e tecnologie moderne.`;
          const companyWebsite = `https://${company.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')}.com`;
          
          insertCompanyStmt.run(
            company.trim(),
            companyDescription,
            companyWebsite,
            'Italia' // Default location
          );
          console.log(`✅ Company "${company}" saved to companies table`);
        } else {
          console.log(`ℹ️ Company "${company}" already exists in companies table`);
        }
      } catch (companyError) {
        console.error('Error saving company:', companyError.message);
        // Don't fail the registration if company save fails
      }
    }
    
    const user = { 
      id: result.lastInsertRowid, 
      email, 
      user_type: userType, 
      first_name: firstName, 
      last_name: lastName,
      company: company || null,
      phone: phone || null
    };
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
    
    // Check if user is blocked
    if (user.is_blocked) {
      console.log('❌ Login denied - user is blocked:', user.email);
      return res.status(403).json({ 
        success: false, 
        error: 'Il tuo account è stato sospeso. Contatta l\'amministratore per ulteriori informazioni.' 
      });
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

// Get single user by ID
app.get('/api/user/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const stmt = db.prepare('SELECT id, email, user_type, first_name, last_name, company, phone, cv_filename, created_at FROM users WHERE id = ?');
    const user = stmt.get(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Jobs routes
app.get('/api/jobs', (req, res) => {
  try {
    // Join jobs with users table to get company name from recruiter
    const stmt = db.prepare(`
      SELECT 
        j.*,
        u.company as company_name,
        u.first_name || ' ' || u.last_name as recruiter_name
      FROM jobs j
      LEFT JOIN users u ON j.recruiter_id = u.id
      ORDER BY j.created_at DESC
    `);
    const jobs = stmt.all();
    res.json(jobs);
  } catch (error) {
    console.error('Error fetching jobs:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/jobs/:id', (req, res) => {
  try {
    const { id } = req.params;
    const stmt = db.prepare(`
      SELECT 
        j.*,
        u.company as company_name,
        u.first_name || ' ' || u.last_name as recruiter_name
      FROM jobs j
      LEFT JOIN users u ON j.recruiter_id = u.id
      WHERE j.id = ?
    `);
    const job = stmt.get(id);
    
    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }
    
    res.json(job);
  } catch (error) {
    console.error('Error fetching job:', error.message);
    res.status(500).json({ success: false, error: error.message });  }
});

// Get jobs by recruiter
app.get('/api/jobs/recruiter/:recruiterId', (req, res) => {
  try {
    const { recruiterId } = req.params;
    console.log(`Fetching jobs for recruiter ID: ${recruiterId}`);    const stmt = db.prepare(`
      SELECT 
        j.*,
        u.company as company_name,
        u.first_name || ' ' || u.last_name as recruiter_name,
        COALESCE(COUNT(a.id), 0) as applications_count,
        CASE 
          WHEN j.salary_min IS NOT NULL AND j.salary_max IS NOT NULL THEN 
            '€' || j.salary_min || ' - €' || j.salary_max
          WHEN j.salary_min IS NOT NULL THEN 
            'Da €' || j.salary_min
          WHEN j.salary_max IS NOT NULL THEN 
            'Fino a €' || j.salary_max
          ELSE 'Stipendio da concordare'
        END as salary_range
      FROM jobs j
      LEFT JOIN users u ON j.recruiter_id = u.id
      LEFT JOIN applications a ON j.id = a.job_id
      WHERE j.recruiter_id = ?
      GROUP BY j.id, u.company, u.first_name, u.last_name
      ORDER BY j.created_at DESC
    `);
    
    const jobs = stmt.all(recruiterId);
    console.log(`Found ${jobs.length} jobs for recruiter ${recruiterId}`);
    res.json(jobs);
  } catch (error) {
    console.error('Error fetching recruiter jobs:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete job (for recruiters and admin)
app.delete('/api/jobs/:id', (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Deleting job ID: ${id}`);
    
    // First check if job exists
    const checkStmt = db.prepare('SELECT id, title, recruiter_id FROM jobs WHERE id = ?');
    const job = checkStmt.get(id);
    
    if (!job) {
      console.log(`Job ${id} not found`);
      return res.status(404).json({ success: false, error: 'Job not found' });
    }
    
    console.log(`Found job: ${job.title} (ID: ${job.id})`);
    
    // Delete related applications first (to avoid foreign key constraints)
    const deleteApplicationsStmt = db.prepare('DELETE FROM applications WHERE job_id = ?');
    const applicationsResult = deleteApplicationsStmt.run(id);
    console.log(`Deleted ${applicationsResult.changes} applications for job ${id}`);
    
    // Now delete the job
    const deleteJobStmt = db.prepare('DELETE FROM jobs WHERE id = ?');
    const result = deleteJobStmt.run(id);
    
    if (result.changes > 0) {
      console.log(`Job ${id} deleted successfully`);
      res.json({ success: true, message: 'Job deleted successfully' });
    } else {
      console.log(`Failed to delete job ${id}`);
      res.status(500).json({ success: false, error: 'Failed to delete job' });
    }
  } catch (error) {
    console.error('Error deleting job:', error.message);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create new job (for recruiters)
app.post('/api/jobs', async (req, res) => {
  try {
    console.log('=== JOB CREATION REQUEST ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('Content-Type:', req.headers['content-type']);
      const { 
      title, 
      description, 
      location, 
      job_type, 
      salary_min, 
      salary_max, 
      requirements, 
      benefits, 
      company_description,
      recruiter_id 
    } = req.body;

    console.log('Extracted fields:', {
      title, description, recruiter_id, location, job_type
    });

    // Validate required fields
    if (!title || !description || !recruiter_id) {
      console.log('❌ Validation failed - missing required fields');
      return res.status(400).json({ 
        success: false, 
        error: 'Title, description, and recruiter_id are required' 
      });
    }

    // Get recruiter info to find company_id
    const recruiterStmt = db.prepare('SELECT id, company FROM users WHERE id = ? AND user_type = ?');
    const recruiter = recruiterStmt.get(recruiter_id, 'recruiter');
    
    if (!recruiter) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid recruiter or user is not a recruiter' 
      });
    }

    // Get company_id from companies table
    let company_id = null;
    if (recruiter.company) {
      const companyStmt = db.prepare('SELECT id FROM companies WHERE name = ?');
      const company = companyStmt.get(recruiter.company);
      company_id = company ? company.id : null;    }    // Insert job with local timestamp
    const insertJobStmt = db.prepare(`
      INSERT INTO jobs (
        title, description, company_id, recruiter_id, location, 
        job_type, salary_min, salary_max, requirements, benefits, company_description, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', 'localtime'))
    `);    const result = insertJobStmt.run(
      title,
      description,
      company_id,
      recruiter_id,
      location || null,
      job_type || 'full-time',
      salary_min || null,
      salary_max || null,
      requirements || null,
      benefits || null,
      company_description || null,
      'active'
    );

    // Return the created job
    const createdJobStmt = db.prepare(`
      SELECT 
        j.*,
        u.company as company_name,
        u.first_name || ' ' || u.last_name as recruiter_name
      FROM jobs j
      LEFT JOIN users u ON j.recruiter_id = u.id
      WHERE j.id = ?
    `);
    
    const createdJob = createdJobStmt.get(result.lastInsertRowid);
    
    console.log('✅ Job created successfully:', createdJob);
    res.status(201).json({ success: true, job: createdJob });
  } catch (error) {
    console.error('Error creating job:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Companies routes
app.get('/api/companies', (req, res) => {
  try {
    // Get companies with job counts from companies table
    const stmt = db.prepare(`
      SELECT 
        c.id,
        c.name,
        c.name as company_name,
        c.description,
        c.website,
        c.location,
        c.created_at,
        COUNT(j.id) as job_count,
        GROUP_CONCAT(DISTINCT j.location) as job_locations
      FROM companies c
      LEFT JOIN users u ON u.company = c.name AND u.user_type = 'recruiter'
      LEFT JOIN jobs j ON j.recruiter_id = u.id AND j.status = 'active'
      GROUP BY c.id, c.name, c.description, c.website, c.location, c.created_at
      ORDER BY job_count DESC, c.name ASC
    `);
    const companies = stmt.all();
    
    // Process locations and add additional data
    const processedCompanies = companies.map(company => ({
      ...company,
      locations: company.job_locations ? 
        [...new Set(company.job_locations.split(',').map(loc => loc.trim()).filter(Boolean))] : 
        [company.location].filter(Boolean),
      description: company.description || `Azienda leader nel settore con ${company.job_count} posizioni attive`,
      website: company.website || `https://${company.name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')}.com`,
      founded_date: company.created_at
    }));

    console.log(`📊 Found ${processedCompanies.length} companies from companies table`);
    res.json(processedCompanies);
  } catch (error) {
    console.error('Error fetching companies:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get company details
app.get('/api/companies/:name', (req, res) => {
  try {
    const { name } = req.params;
    const decodedName = decodeURIComponent(name);
    
    // Get company info from companies table
    const companyStmt = db.prepare(`
      SELECT 
        c.id,
        c.name,
        c.name as company_name,
        c.description,
        c.website,
        c.location,
        c.created_at,
        COUNT(j.id) as job_count,
        GROUP_CONCAT(DISTINCT j.location) as job_locations
      FROM companies c
      LEFT JOIN users u ON u.company = c.name AND u.user_type = 'recruiter'
      LEFT JOIN jobs j ON j.recruiter_id = u.id AND j.status = 'active'
      WHERE c.name = ?
      GROUP BY c.id, c.name, c.description, c.website, c.location, c.created_at
    `);
    
    const company = companyStmt.get(decodedName);
    
    if (!company) {
      return res.status(404).json({ success: false, error: 'Company not found' });
    }
    
    // Get company jobs
    const jobsStmt = db.prepare(`
      SELECT 
        j.*,
        u.company as company_name,
        u.first_name || ' ' || u.last_name as recruiter_name
      FROM jobs j
      LEFT JOIN users u ON j.recruiter_id = u.id
      WHERE u.company = ? AND j.status = 'active'
      ORDER BY j.created_at DESC
    `);
    
    const jobs = jobsStmt.all(decodedName);
    
    const companyDetails = {
      ...company,
      locations: company.job_locations ? 
        [...new Set(company.job_locations.split(',').map(loc => loc.trim()).filter(Boolean))] : 
        [company.location].filter(Boolean),
      description: company.description || `Azienda leader nel settore con ${company.job_count} posizioni attive`,
      website: company.website || `https://${company.name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')}.com`,
      founded_date: company.created_at,
      jobs
    };
    
    res.json(companyDetails);
  } catch (error) {
    console.error('Error fetching company details:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running', dbPath });
});

// DEBUG ENDPOINT - Clear all database tables (DANGEROUS!)
app.post('/api/debug/clear-database', (req, res) => {  try {
    console.log('🔥 DEBUG: Clearing all database tables...');
    
    // Disable foreign key constraints temporarily
    db.pragma('foreign_keys = OFF');
    
    // First, check what tables exist
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all();
    console.log('📋 Found tables:', tables.map(t => t.name));
      // Delete all records from existing tables
    tables.forEach(table => {
      try {
        const result = db.prepare(`DELETE FROM [${table.name}]`).run();
        console.log(`🗑️ Cleared ${result.changes} records from ${table.name}`);
      } catch (tableError) {
        console.error(`❌ Error clearing table ${table.name}:`, tableError.message);
      }
    });
    
    // Reset auto-increment counters for the tables we cleared
    const tableNames = tables.map(t => `'${t.name}'`).join(', ');
    if (tableNames) {
      db.prepare(`DELETE FROM sqlite_sequence WHERE name IN (${tableNames})`).run();
      console.log('🔄 Reset auto-increment counters');
    }
    
    // Re-enable foreign key constraints
    db.pragma('foreign_keys = ON');
    
    console.log('✅ DEBUG: All database tables cleared successfully');
    res.json({ 
      success: true, 
      message: 'All database tables cleared successfully',
      clearedTables: tables.map(t => t.name),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ DEBUG: Error clearing database:', error.message);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to clear database',
      details: error.message 
    });  }
});

// === APPLICATION ENDPOINTS ===

// Submit job application
app.post('/api/applications', async (req, res) => {
  try {
    const { job_id, candidate_id } = req.body;
    
    console.log('Application request:', { job_id, candidate_id });
      // Get candidate info
    const candidateStmt = db.prepare('SELECT id, first_name, last_name, email FROM users WHERE id = ? AND user_type = ?');
    const candidate = candidateStmt.get(candidate_id, 'candidate');
    
    if (!candidate) {
      return res.status(404).json({ success: false, error: 'Candidate not found' });
    }
    
    // Check if job exists
    const jobStmt = db.prepare('SELECT id FROM jobs WHERE id = ?');
    const job = jobStmt.get(job_id);
    
    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }
    
    // Insert application (UNIQUE constraint will prevent duplicates)
    const insertStmt = db.prepare(`
      INSERT INTO applications (job_id, candidate_id, candidate_name, candidate_email)
      VALUES (?, ?, ?, ?)
    `);
    
    const candidateName = `${candidate.first_name} ${candidate.last_name}`;
    const result = insertStmt.run(job_id, candidate_id, candidateName, candidate.email);
    
    console.log('Application created:', { id: result.lastInsertRowid });
    
    res.json({ 
      success: true, 
      message: 'Application submitted successfully',
      application_id: result.lastInsertRowid
    });
    
  } catch (error) {
    console.error('Error submitting application:', error);
    
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(400).json({ 
        success: false, 
        error: 'You have already applied for this job' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: 'Failed to submit application',
      details: error.message 
    });
  }
});

// Get applications for a specific job (for recruiters)
app.get('/api/jobs/:jobId/applications', async (req, res) => {
  try {
    const { jobId } = req.params;
    console.log('Getting applications for job:', jobId);
      const stmt = db.prepare(`
      SELECT 
        a.id,
        a.candidate_name,
        a.candidate_email,
        a.applied_at,
        a.status,
        u.phone,
        u.cv_filename
      FROM applications a
      LEFT JOIN users u ON a.candidate_id = u.id
      WHERE a.job_id = ?
      ORDER BY a.applied_at DESC
    `);
    
    const applications = stmt.all(jobId);
    console.log(`Found ${applications.length} applications for job ${jobId}`);
    
    res.json({ success: true, applications });
    
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch applications',
      details: error.message 
    });
  }
});

// Delete application (for recruiters - removes application without notifying candidate)
app.delete('/api/applications/:applicationId', async (req, res) => {
  try {
    const { applicationId } = req.params;
    
    console.log('Deleting application:', { applicationId });
    
    const stmt = db.prepare('DELETE FROM applications WHERE id = ?');
    const result = stmt.run(applicationId);
    
    if (result.changes > 0) {
      res.json({ success: true, message: 'Application deleted successfully' });
    } else {
      res.status(404).json({ success: false, error: 'Application not found' });
    }
    
  } catch (error) {
    console.error('Error deleting application:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update application status',
      details: error.message 
    });
  }
});

// Check if user has applied for a job
app.get('/api/applications/check/:jobId/:candidateId', async (req, res) => {
  try {
    const { jobId, candidateId } = req.params;
    
    const stmt = db.prepare('SELECT id FROM applications WHERE job_id = ? AND candidate_id = ?');
    const application = stmt.get(jobId, candidateId);
    
    res.json({ 
      success: true, 
      hasApplied: !!application,
      applicationId: application?.id || null
    });
    
  } catch (error) {
    console.error('Error checking application status:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to check application status' 
    });
  }
});

// === ADMIN ENDPOINTS ===

// Get applications count for admin dashboard
app.get('/api/admin/applications-count', async (req, res) => {
  try {
    const stmt = db.prepare('SELECT COUNT(*) as count FROM applications');
    const result = stmt.get();
    res.json({ success: true, count: result.count });
  } catch (error) {
    console.error('Error getting applications count:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get applications count',
      details: error.message 
    });
  }
});

// Get admin statistics
app.get('/api/admin/stats', async (req, res) => {
  try {
    // Get user statistics
    const usersStmt = db.prepare(`
      SELECT 
        user_type,
        COUNT(*) as count
      FROM users 
      WHERE user_type != 'admin'
      GROUP BY user_type
    `);
    const userStats = usersStmt.all();
    
    // Get job statistics
    const jobsStmt = db.prepare(`
      SELECT 
        status,
        COUNT(*) as count
      FROM jobs
      GROUP BY status
    `);
    const jobStats = jobsStmt.all();
    
    // Get applications count
    const applicationsStmt = db.prepare('SELECT COUNT(*) as count FROM applications');
    const applicationsCount = applicationsStmt.get();
    
    // Get recent activity (last 30 days)
    const recentUsersStmt = db.prepare(`
      SELECT COUNT(*) as count 
      FROM users 
      WHERE created_at >= datetime('now', '-30 days')
      AND user_type != 'admin'
    `);
    const recentUsers = recentUsersStmt.get();
    
    const recentJobsStmt = db.prepare(`
      SELECT COUNT(*) as count 
      FROM jobs 
      WHERE created_at >= datetime('now', '-30 days')
    `);
    const recentJobs = recentJobsStmt.get();
    
    res.json({
      success: true,
      stats: {
        users: userStats,
        jobs: jobStats,
        applications: applicationsCount.count,
        recentActivity: {
          users: recentUsers.count,
          jobs: recentJobs.count
        }
      }
    });
  } catch (error) {
    console.error('Error getting admin stats:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get admin statistics',
      details: error.message 
    });
  }
});

// === ADMIN USER MANAGEMENT ===

// Block/Unblock user (Admin only)
app.patch('/api/admin/users/:id/block', (req, res) => {
  try {
    const { id } = req.params;
    const { isBlocked } = req.body;
    
    console.log(`${isBlocked ? 'Blocking' : 'Unblocking'} user ID: ${id}`);
    
    // Check if user exists
    const checkStmt = db.prepare('SELECT id, email, user_type, first_name, last_name FROM users WHERE id = ?');
    const user = checkStmt.get(id);
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    // Don't allow blocking admin users
    if (user.user_type === 'admin') {
      return res.status(403).json({ 
        success: false, 
        error: 'Cannot block admin users' 
      });
    }
      // Update user blocked status
    const updateStmt = db.prepare('UPDATE users SET is_blocked = ? WHERE id = ?');
    const result = updateStmt.run(isBlocked ? 1 : 0, id);
    
    if (result.changes > 0) {
      console.log(`✅ User ${user.email} ${isBlocked ? 'blocked' : 'unblocked'} successfully`);
      res.json({ 
        success: true, 
        message: `User ${isBlocked ? 'blocked' : 'unblocked'} successfully`,
        user: { ...user, is_blocked: isBlocked }
      });
    } else {
      res.status(500).json({ success: false, error: 'Failed to update user status' });
    }
    
  } catch (error) {
    console.error('Error blocking/unblocking user:', error);    res.status(500).json({ 
      success: false, 
      error: 'Failed to update user status',
      details: error.message 
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Admin dashboard: http://localhost:${PORT}/admin`);
  console.log(`🔗 API available at: http://localhost:${PORT}/api`);
});

