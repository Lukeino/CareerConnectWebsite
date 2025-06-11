const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

console.log('🔧 Starting admin password update...');

const dbPath = path.join(__dirname, 'server', 'db', 'database.sqlite');
console.log('📁 Database path:', dbPath);

const db = new Database(dbPath);
console.log('✅ Database connection established');

// Hash the correct password
console.log('🔐 Hashing password...');
const hashedPassword = bcrypt.hashSync('NullpointerTeams321', 10);
console.log('✅ Password hashed');

// Update admin password
console.log('🔄 Updating admin password...');
const updateAdmin = db.prepare('UPDATE users SET password = ? WHERE email = ? AND user_type = ?');
const result = updateAdmin.run(hashedPassword, 'admin@careerconnect.com', 'admin');

console.log('✅ Admin password updated!');
console.log('📊 Update result:', result);

// Verify the password
console.log('🔍 Verifying password...');
const adminUser = db.prepare('SELECT password FROM users WHERE email = ? AND user_type = ?').get('admin@careerconnect.com', 'admin');
const passwordMatch = bcrypt.compareSync('NullpointerTeams321', adminUser.password);

console.log(`✅ Password verification: ${passwordMatch ? 'SUCCESS' : 'FAILED'}`);

db.close();
console.log('🎉 Done! You can now login with:');
console.log('   Email: admin@careerconnect.com');
console.log('   Password: NullpointerTeams321');
