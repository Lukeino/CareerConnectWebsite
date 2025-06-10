const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'server', 'db', 'database.sqlite');

function addUserBlocking() {
  try {
    const db = new Database(dbPath);
    
    console.log('🔧 Adding user blocking functionality...');
    
    // Check if the column already exists
    const tableInfo = db.prepare("PRAGMA table_info(users)").all();
    const hasBlockedColumn = tableInfo.some(column => column.name === 'is_blocked');
    
    if (hasBlockedColumn) {
      console.log('✅ Column is_blocked already exists');
    } else {
      // Add the is_blocked column with default value FALSE
      db.exec(`
        ALTER TABLE users 
        ADD COLUMN is_blocked BOOLEAN DEFAULT FALSE
      `);
      console.log('✅ Column is_blocked added successfully');
    }
    
    // Update any existing users to ensure they have is_blocked = FALSE
    const updateStmt = db.prepare(`
      UPDATE users 
      SET is_blocked = FALSE 
      WHERE is_blocked IS NULL
    `);
    const result = updateStmt.run();
    console.log(`✅ Updated ${result.changes} users to set is_blocked = FALSE`);
    
    // Show updated table structure
    console.log('\n📋 Updated users table structure:');
    const updatedTableInfo = db.prepare("PRAGMA table_info(users)").all();
    updatedTableInfo.forEach(column => {
      console.log(`  ${column.name}: ${column.type}${column.dflt_value ? ` DEFAULT ${column.dflt_value}` : ''}${column.notnull ? ' NOT NULL' : ''}`);
    });
    
    // Show sample data
    console.log('\n👥 Sample users with blocking status:');
    const sampleUsers = db.prepare(`
      SELECT id, email, user_type, first_name, last_name, is_blocked 
      FROM users 
      LIMIT 5
    `).all();
    
    sampleUsers.forEach(user => {
      console.log(`  ${user.id}: ${user.email} (${user.user_type}) - Blocked: ${user.is_blocked ? 'YES' : 'NO'}`);
    });
    
    db.close();
    console.log('\n🎉 User blocking functionality added successfully!');
    
  } catch (error) {
    console.error('❌ Error adding user blocking:', error.message);
  }
}

addUserBlocking();
