const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();
const PORT = 3001;

// Initialize database
const dbPath = path.join(__dirname, 'server', 'db', 'database.sqlite');
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
      company_id = company ? company.id : null;
    }

    // Insert job
    const insertJobStmt = db.prepare(`
      INSERT INTO jobs (
        title, description, company_id, recruiter_id, location, 
        job_type, salary_min, salary_max, requirements, benefits, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insertJobStmt.run(
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

// Serve i file statici dal build React
app.use(express.static(path.join(__dirname, 'dist')));

// Per tutte le richieste non gestite dalle API, restituisci index.html (React Router friendly)
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  console.log(`📁 Database location: ${dbPath}`);
  console.log('✅ Ready to accept connections');
});

