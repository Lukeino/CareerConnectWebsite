const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, 'server', 'db', 'database.sqlite');
console.log('🔧 Creating admin user...');

async function createAdmin() {
  try {
    const db = new Database(dbPath);
    
    // Check if admin already exists
    const adminCheck = db.prepare('SELECT * FROM users WHERE user_type = ? OR email = ?');
    const existingAdmin = adminCheck.get('admin', 'admin@careerconnect.com');
      if (existingAdmin) {
      console.log('✅ Admin user exists, updating password...');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Type: ${existingAdmin.user_type}`);
      console.log(`   Name: ${existingAdmin.first_name} ${existingAdmin.last_name}`);
      
      // Update password to correct one
      const hashedPassword = await bcrypt.hash('NullpointerTeams321', 10);
      const updateAdmin = db.prepare('UPDATE users SET password = ? WHERE email = ? AND user_type = ?');
      updateAdmin.run(hashedPassword, 'admin@careerconnect.com', 'admin');
      console.log('🔐 Password updated to: NullpointerTeams321');
    } else {      // Create admin user
      console.log('👤 Creating new admin user...');
      const hashedPassword = await bcrypt.hash('NullpointerTeams321', 10);
      
      const insertAdmin = db.prepare(`
        INSERT INTO users (email, password, user_type, first_name, last_name, company, phone)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      
      const result = insertAdmin.run(
        'admin@careerconnect.com',
        hashedPassword,
        'admin',
        'Career',
        'Admin',
        'CareerConnect',
        null
      );
        console.log('✅ Admin user created successfully!');
      console.log(`   ID: ${result.lastInsertRowid}`);
      console.log('   Email: admin@careerconnect.com');
      console.log('   Password: NullpointerTeams321');
      console.log('   Type: admin');
    }
    
    // Show all users
    console.log('\n=== ALL USERS ===');
    const allUsers = db.prepare('SELECT id, email, user_type, first_name, last_name FROM users').all();
    allUsers.forEach(user => {
      console.log(`ID: ${user.id}, Email: ${user.email}, Type: ${user.user_type}, Name: ${user.first_name} ${user.last_name}`);
    });
    
    db.close();
  } catch (error) {
    console.error('❌ Error creating admin:', error);
  }
}

createAdmin();
