const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'server', 'db', 'database.sqlite');
console.log('🔧 Adding CV field to users table...');
console.log('Database path:', dbPath);

try {
  const db = new Database(dbPath);
  
  // Check if cv_filename column already exists
  const tableInfo = db.prepare("PRAGMA table_info(users)").all();
  const hasCvColumn = tableInfo.some(column => column.name === 'cv_filename');
  
  if (!hasCvColumn) {
    console.log('📋 Adding cv_filename column to users table...');
    db.exec(`ALTER TABLE users ADD COLUMN cv_filename TEXT`);
    console.log('✅ cv_filename column added successfully');
    
    // Verify the addition
    const updatedTableInfo = db.prepare("PRAGMA table_info(users)").all();
    console.log('\n📋 Updated table structure:');
    console.table(updatedTableInfo);
  } else {
    console.log('✅ cv_filename column already exists');
  }
  
  db.close();
  console.log('🎉 Database update completed!');
  
} catch (error) {
  console.error('❌ Error updating database:', error);
}
