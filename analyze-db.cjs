const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'server', 'db', 'database.sqlite');
console.log('🔧 Database analysis starting...');

try {
  const db = new Database(dbPath);
  
  // Get all tables
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all();
  console.log('\n📋 Tables found:', tables.map(t => t.name));
  
  // USERS table
  console.log('\n👥 USERS table:');
  const userColumns = db.prepare("PRAGMA table_info(users)").all();
  const hasBlocked = userColumns.some(col => col.name === 'is_blocked');
  const hasCV = userColumns.some(col => col.name === 'cv_filename');
  console.log(`   ✅ is_blocked: ${hasBlocked ? 'YES' : 'NO'}`);
  console.log(`   ✅ cv_filename: ${hasCV ? 'YES' : 'NO'}`);
  
  // JOBS table
  console.log('\n💼 JOBS table:');
  const jobColumns = db.prepare("PRAGMA table_info(jobs)").all();
  const hasCompanyDesc = jobColumns.some(col => col.name === 'company_description');
  console.log(`   ✅ company_description: ${hasCompanyDesc ? 'YES' : 'NO'}`);
  
  // APPLICATIONS table
  const hasApplications = tables.some(t => t.name === 'applications');
  console.log(`\n📝 APPLICATIONS table: ${hasApplications ? 'YES' : 'NO'}`);
  
  // COMPANIES table
  const hasCompanies = tables.some(t => t.name === 'companies');
  console.log(`🏢 COMPANIES table: ${hasCompanies ? 'YES' : 'NO'}`);
  
  db.close();
  console.log('\n✅ Analysis complete!');
  
} catch (error) {
  console.error('❌ Error:', error.message);
}
