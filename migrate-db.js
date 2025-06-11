const Database = require('better-sqlite3');
const path = require('path');

// Initialize database
const dbPath = path.join(__dirname, 'server', 'db', 'database.sqlite');
const db = new Database(dbPath);

console.log('Starting database migration...');

try {
  // Check if cv_filename column exists
  const tableInfo = db.prepare("PRAGMA table_info(users)").all();
  const hasCV = tableInfo.some(column => column.name === 'cv_filename');
  
  if (!hasCV) {
    console.log('Adding cv_filename column to users table...');
    db.exec('ALTER TABLE users ADD COLUMN cv_filename TEXT');
    console.log('✅ cv_filename column added successfully');
  } else {
    console.log('✅ cv_filename column already exists');
  }
  
  // Verify the column was added
  const updatedTableInfo = db.prepare("PRAGMA table_info(users)").all();
  console.log('Current users table structure:');
  updatedTableInfo.forEach(column => {
    console.log(`  - ${column.name}: ${column.type}${column.notnull ? ' NOT NULL' : ''}${column.dflt_value ? ` DEFAULT ${column.dflt_value}` : ''}`);
  });
  
} catch (error) {
  console.error('❌ Migration failed:', error);
} finally {
  db.close();
  console.log('Migration completed');
}
