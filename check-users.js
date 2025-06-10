const Database = require('better-sqlite3');
const db = new Database('./server/db/database.sqlite');

console.log('=== USERS IN DATABASE ===');
const users = db.prepare('SELECT * FROM users').all();
users.forEach(user => {
  console.log(`ID: ${user.id}, Email: ${user.email}, Type: ${user.user_type}, Name: ${user.first_name} ${user.last_name}`);
});

console.log('\n=== USER TYPES COUNT ===');
const userTypes = db.prepare('SELECT user_type, COUNT(*) as count FROM users GROUP BY user_type').all();
userTypes.forEach(type => {
  console.log(`${type.user_type}: ${type.count}`);
});

db.close();
