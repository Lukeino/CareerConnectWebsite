const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, 'server', 'db', 'database.sqlite');
console.log('🔧 Updating admin password...');

async function updateAdminPassword() {
  try {
    const db = new Database(dbPath);
    
    // Check if admin exists
    const adminCheck = db.prepare('SELECT * FROM users WHERE user_type = ? AND email = ?');
    const existingAdmin = adminCheck.get('admin', 'admin@careerconnect.com');
    
    if (existingAdmin) {
      console.log('👤 Admin found, updating password...');
      
      // Hash the correct password
      const hashedPassword = await bcrypt.hash('NullpointerTeams321', 10);
      
      // Update admin password
      const updateAdmin = db.prepare('UPDATE users SET password = ? WHERE email = ? AND user_type = ?');
      const result = updateAdmin.run(hashedPassword, 'admin@careerconnect.com', 'admin');
      
      console.log('✅ Admin password updated successfully!');
      console.log('   Email: admin@careerconnect.com');
      console.log('   New Password: NullpointerTeams321');
      console.log('   Type: admin');
      
      // Verify the update worked
      console.log('\n🔍 Verifying password...');
      const passwordMatch = await bcrypt.compare('NullpointerTeams321', hashedPassword);
      console.log(`   Password verification: ${passwordMatch ? '✅ CORRECT' : '❌ FAILED'}`);
      
    } else {
      console.log('❌ Admin user not found! Creating new admin...');
      
      // Create admin user with correct password
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
      
      console.log('✅ New admin user created!');
      console.log(`   ID: ${result.lastInsertRowid}`);
      console.log('   Email: admin@careerconnect.com');
      console.log('   Password: NullpointerTeams321');
      console.log('   Type: admin');
    }
    
    db.close();
    console.log('\n🎉 Admin setup completed!');
    console.log('You can now login with:');
    console.log('   Email: admin@careerconnect.com');
    console.log('   Password: NullpointerTeams321');
    
  } catch (error) {
    console.error('❌ Error updating admin:', error);
  }
}

updateAdminPassword();
