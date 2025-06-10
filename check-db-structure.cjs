const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'server', 'db', 'database.sqlite');

function checkDatabaseStructure() {
  try {
    const db = new Database(dbPath);
    
    console.log('📋 Current users table structure:');
    const tableInfo = db.prepare("PRAGMA table_info(users)").all();
    console.table(tableInfo);
    
    // Check if is_blocked column exists
    const hasBlockedColumn = tableInfo.some(column => column.name === 'is_blocked');
    console.log(`\n🔍 is_blocked column exists: ${hasBlockedColumn ? 'YES' : 'NO'}`);
    
    if (!hasBlockedColumn) {
      console.log('\n🔧 Adding is_blocked column...');
      db.exec(`ALTER TABLE users ADD COLUMN is_blocked BOOLEAN DEFAULT FALSE`);
      console.log('✅ is_blocked column added successfully');
      
      // Verify the addition
      const updatedTableInfo = db.prepare("PRAGMA table_info(users)").all();
      console.log('\n📋 Updated table structure:');
      console.table(updatedTableInfo);
    }
    
    // Show sample users with blocking status
    console.log('\n👥 Current users with blocking status:');
    const users = db.prepare(`
      SELECT id, email, user_type, first_name, last_name, is_blocked 
      FROM users
    `).all();
    console.table(users);
    
    db.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkDatabaseStructure();
