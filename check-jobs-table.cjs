const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'server', 'db', 'database.sqlite');
console.log('🔧 Checking jobs table structure...');

try {
  const db = new Database(dbPath);
  
  // Check jobs table structure
  const jobsColumns = db.prepare("PRAGMA table_info(jobs)").all();
  console.log('\n📋 Jobs table structure:');
  console.table(jobsColumns);
  
  // Check if company_description column exists
  const hasCompanyDescription = jobsColumns.some(col => col.name === 'company_description');
  console.log(`\n🔍 company_description column exists: ${hasCompanyDescription ? '✅ YES' : '❌ NO'}`);
  
  // Show some sample jobs
  const jobs = db.prepare("SELECT id, title, company_description FROM jobs LIMIT 3").all();
  console.log('\n👷 Sample jobs:');
  console.table(jobs);
  
  db.close();
} catch (error) {
  console.error('❌ Error checking jobs table:', error.message);
}
