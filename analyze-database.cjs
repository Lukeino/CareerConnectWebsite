const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'server', 'db', 'database.sqlite');
console.log('🔧 Checking all database tables...');

try {
  const db = new Database(dbPath);
  
  // Get all tables
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all();
  console.log('\n📋 All tables in database:');
  tables.forEach(table => {
    console.log(`   • ${table.name}`);
  });
  
  console.log('\n=== DETAILED TABLE ANALYSIS ===');
  
  // Check users table specifically
  if (tables.some(t => t.name === 'users')) {
    console.log('\n👥 USERS table structure:');
    const userColumns = db.prepare("PRAGMA table_info(users)").all();
    userColumns.forEach(col => {
      console.log(`   ${col.name}: ${col.type}${col.notnull ? ' NOT NULL' : ''}`);
    });
  }
  
  // Check jobs table specifically  
  if (tables.some(t => t.name === 'jobs')) {
    console.log('\n💼 JOBS table structure:');
    const jobColumns = db.prepare("PRAGMA table_info(jobs)").all();
    jobColumns.forEach(col => {
      console.log(`   ${col.name}: ${col.type}${col.notnull ? ' NOT NULL' : ''}`);
    });
  }
  
  // Check companies table
  if (tables.some(t => t.name === 'companies')) {
    console.log('\n🏢 COMPANIES table structure:');
    const companyColumns = db.prepare("PRAGMA table_info(companies)").all();
    companyColumns.forEach(col => {
      console.log(`   ${col.name}: ${col.type}${col.notnull ? ' NOT NULL' : ''}`);
    });
  }
  
  // Check applications table
  if (tables.some(t => t.name === 'applications')) {
    console.log('\n📝 APPLICATIONS table structure:');
    const appColumns = db.prepare("PRAGMA table_info(applications)").all();
    appColumns.forEach(col => {
      console.log(`   ${col.name}: ${col.type}${col.notnull ? ' NOT NULL' : ''}`);
    });
  }
  
  db.close();
  console.log('\n✅ Database analysis complete!');
  
} catch (error) {
  console.error('❌ Error checking tables:', error.message);
}
