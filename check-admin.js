const Database = require('better-sqlite3');
const path = require('path');

// Create database connection
const dbPath = path.join(__dirname, 'server', 'db', 'database.sqlite');
const db = new Database(dbPath);

try {
  // Check all users, especially looking for admin
  const stmt = db.prepare('SELECT id, email, user_type, first_name, last_name, created_at FROM users');
  const users = stmt.all();
  
  console.log('👥 All users in database:');
  console.table(users);
  
  // Check if admin exists
  const adminStmt = db.prepare('SELECT * FROM users WHERE user_type = ?');
  const adminUsers = adminStmt.all('admin');
  
  if (adminUsers.length > 0) {
    console.log('✅ Admin users found:');
    console.table(adminUsers);
  } else {
    console.log('❌ No admin users found');
  }
  
} catch (error) {
  console.error('❌ Error checking users:', error.message);
} finally {
  db.close();
}
