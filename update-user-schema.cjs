const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'server', 'db', 'database.sqlite');
console.log('🔧 Updating database schema to support admin users...');
console.log('Database path:', dbPath);

try {
  const db = new Database(dbPath);
  
  // First, let's check current users
  console.log('\n=== CURRENT USERS ===');
  const users = db.prepare('SELECT id, email, user_type, first_name, last_name FROM users').all();
  users.forEach(user => {
    console.log(`ID: ${user.id}, Email: ${user.email}, Type: ${user.user_type}, Name: ${user.first_name} ${user.last_name}`);
  });
  
  // Create a new table with the updated constraint
  console.log('\n🔄 Creating new users table with admin support...');
  
  // Step 1: Create new table with updated constraint
  db.exec(`
    CREATE TABLE users_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      user_type TEXT CHECK(user_type IN ('recruiter', 'candidate', 'admin')) NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      company TEXT,
      phone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Step 2: Copy data from old table to new table
  console.log('📋 Copying existing data...');
  db.exec(`
    INSERT INTO users_new (id, email, password, user_type, first_name, last_name, company, phone, created_at, updated_at)
    SELECT id, email, password, user_type, first_name, last_name, company, phone, created_at, updated_at
    FROM users
  `);
  
  // Step 3: Drop old table and rename new table
  console.log('🔄 Replacing old table...');
  db.exec('DROP TABLE users');
  db.exec('ALTER TABLE users_new RENAME TO users');
  
  // Verify the change
  console.log('\n✅ Schema updated! Checking users again:');
  const updatedUsers = db.prepare('SELECT id, email, user_type, first_name, last_name FROM users').all();
  updatedUsers.forEach(user => {
    console.log(`ID: ${user.id}, Email: ${user.email}, Type: ${user.user_type}, Name: ${user.first_name} ${user.last_name}`);
  });
  
  console.log('\n🎉 Database schema successfully updated to support admin users!');
  
  db.close();
  
} catch (error) {
  console.error('❌ Error updating database schema:', error);
}
