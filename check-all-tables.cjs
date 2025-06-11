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
  
  // Check each table structure
  for (const table of tables) {
    console.log(`\n🔍 Structure of table: ${table.name}`);
    const columns = db.prepare(`PRAGMA table_info(${table.name})`).all();
    console.table(columns);
  }
  
  db.close();
} catch (error) {
  console.error('❌ Error checking tables:', error.message);
}
