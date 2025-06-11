const Database = require('better-sqlite3');
const path = require('path');

console.log('Starting database check...');

// Initialize database
const dbPath = path.join(__dirname, 'server', 'db', 'database.sqlite');
console.log('Database path:', dbPath);
const db = new Database(dbPath);

try {
  console.log('Checking users table structure...');
  // Check current users table structure
  const tableInfo = db.prepare("PRAGMA table_info(users)").all();
  console.log('Current users table structure:');
  tableInfo.forEach(column => {
    console.log(`  - ${column.name}: ${column.type}${column.notnull ? ' NOT NULL' : ''}${column.dflt_value ? ` DEFAULT ${column.dflt_value}` : ''}`);
  });
  
  // Check if we have any users with CV data
  const users = db.prepare("SELECT id, email, user_type, cv_filename FROM users LIMIT 5").all();
  console.log('\nUsers in database:');
  users.forEach(user => {
    console.log(`  - ${user.email} (${user.user_type}): CV = ${user.cv_filename || 'none'}`);
  });
  
} catch (error) {
  console.error('❌ Error:', error);
} finally {
  db.close();
  console.log('Database check completed');
}
