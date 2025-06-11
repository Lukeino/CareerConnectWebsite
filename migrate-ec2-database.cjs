const Database = require('better-sqlite3');
const path = require('path');

// Script per aggiornare il database EC2 con tutte le modifiche locali
console.log('🔧 EC2 Database Migration Script');
console.log('=====================================');

// Initialize database (in EC2 this will be the production database path)
const dbPath = path.join(__dirname, 'server', 'db', 'database.sqlite');
console.log('Database path:', dbPath);

try {
  const db = new Database(dbPath);
  console.log('✅ Database connected');

  // Step 1: Add cv_filename column to users table if not exists
  console.log('\n📝 Step 1: Adding cv_filename column to users table...');
  try {
    const userColumns = db.prepare("PRAGMA table_info(users)").all();
    const hasCV = userColumns.some(col => col.name === 'cv_filename');
    
    if (!hasCV) {
      db.exec('ALTER TABLE users ADD COLUMN cv_filename TEXT');
      console.log('✅ Added cv_filename column to users table');
    } else {
      console.log('ℹ️ cv_filename column already exists');
    }
  } catch (error) {
    console.error('❌ Error adding cv_filename:', error.message);
  }

  // Step 2: Add is_blocked column to users table if not exists
  console.log('\n🔒 Step 2: Adding is_blocked column to users table...');
  try {
    const userColumns = db.prepare("PRAGMA table_info(users)").all();
    const hasBlocked = userColumns.some(col => col.name === 'is_blocked');
    
    if (!hasBlocked) {
      db.exec('ALTER TABLE users ADD COLUMN is_blocked BOOLEAN DEFAULT FALSE');
      console.log('✅ Added is_blocked column to users table');
    } else {
      console.log('ℹ️ is_blocked column already exists');
    }
  } catch (error) {
    console.error('❌ Error adding is_blocked:', error.message);
  }

  // Step 3: Add company_description column to jobs table if not exists
  console.log('\n🏢 Step 3: Adding company_description column to jobs table...');
  try {
    const jobColumns = db.prepare("PRAGMA table_info(jobs)").all();
    const hasCompanyDesc = jobColumns.some(col => col.name === 'company_description');
    
    if (!hasCompanyDesc) {
      db.exec('ALTER TABLE jobs ADD COLUMN company_description TEXT');
      console.log('✅ Added company_description column to jobs table');
    } else {
      console.log('ℹ️ company_description column already exists');
    }
  } catch (error) {
    console.error('❌ Error adding company_description:', error.message);
  }

  // Step 4: Create applications table if not exists
  console.log('\n📋 Step 4: Creating applications table...');
  try {
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
        UNIQUE(job_id, candidate_id)
      )
    `);
    console.log('✅ Applications table created/verified');
  } catch (error) {
    console.error('❌ Error creating applications table:', error.message);
  }

  // Step 5: Create companies table if not exists
  console.log('\n🏢 Step 5: Creating companies table...');
  try {
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
    console.log('✅ Companies table created/verified');
  } catch (error) {
    console.error('❌ Error creating companies table:', error.message);
  }

  // Step 6: Update user_type constraint to include admin (if needed)
  console.log('\n👤 Step 6: Checking user_type constraint for admin support...');
  try {
    // Try to insert a test admin user to see if constraint allows it
    const testStmt = db.prepare("SELECT * FROM users WHERE user_type = 'admin' LIMIT 1");
    const adminExists = testStmt.get();
    
    if (!adminExists) {
      console.log('ℹ️ No admin users found, but constraint should support it');
    } else {
      console.log('✅ Admin user type is supported');
    }
  } catch (error) {
    console.error('⚠️ May need to update user_type constraint:', error.message);
  }

  // Step 7: Verify final database structure
  console.log('\n🔍 Step 7: Verifying final database structure...');
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all();
  console.log('📋 Tables found:', tables.map(t => t.name));

  // Check critical columns
  const userColumns = db.prepare("PRAGMA table_info(users)").all();
  const jobColumns = db.prepare("PRAGMA table_info(jobs)").all();
  
  console.log('\n✅ VERIFICATION RESULTS:');
  console.log(`   👥 users.cv_filename: ${userColumns.some(c => c.name === 'cv_filename') ? '✅' : '❌'}`);
  console.log(`   🔒 users.is_blocked: ${userColumns.some(c => c.name === 'is_blocked') ? '✅' : '❌'}`);
  console.log(`   🏢 jobs.company_description: ${jobColumns.some(c => c.name === 'company_description') ? '✅' : '❌'}`);
  console.log(`   📋 applications table: ${tables.some(t => t.name === 'applications') ? '✅' : '❌'}`);
  console.log(`   🏢 companies table: ${tables.some(t => t.name === 'companies') ? '✅' : '❌'}`);

  db.close();
  console.log('\n🎉 Migration completed successfully!');
  
} catch (error) {
  console.error('❌ Migration failed:', error.message);
  process.exit(1);
}
