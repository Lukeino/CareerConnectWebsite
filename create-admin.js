const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

// Create database connection
const dbPath = path.join(__dirname, 'server', 'db', 'database.sqlite');
const db = new Database(dbPath);

async function createAdminUser() {
  try {
    // First, check if admin user already exists
    const checkStmt = db.prepare('SELECT * FROM users WHERE email = ?');
    const existingAdmin = checkStmt.get('admin@careerconnect.com');
    
    if (existingAdmin) {
      console.log('❌ Admin user already exists!');
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash('NullpointerTeams321', 10);
    
    // Add admin user type to the database schema if it doesn't exist
    // First check if the constraint allows admin
    try {
      const insertStmt = db.prepare(`
        INSERT INTO users (email, password, user_type, first_name, last_name, company, phone)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      
      const result = insertStmt.run(
        'admin@careerconnect.com',
        hashedPassword,
        'admin',
        'Career',
        'Admin',
        'CareerConnect',
        null
      );
      
      console.log('✅ Admin user created successfully!');
      console.log('📧 Email: admin@careerconnect.com');
      console.log('🔐 Password: NullpointerTeams321');
      console.log('👤 Name: CareerAdmin');
      console.log('🆔 ID:', result.lastInsertRowid);
      
    } catch (error) {
      if (error.message.includes('CHECK constraint failed')) {
        // Need to modify the user_type constraint to include admin
        console.log('🔧 Updating user_type constraint to include admin...');
        
        // Create a new table with the updated constraint
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
        
        // Copy data from old table
        db.exec(`
          INSERT INTO users_new (id, email, password, user_type, first_name, last_name, company, phone, created_at, updated_at)
          SELECT id, email, password, user_type, first_name, last_name, company, phone, created_at, updated_at
          FROM users
        `);
        
        // Drop old table and rename new table
        db.exec('DROP TABLE users');
        db.exec('ALTER TABLE users_new RENAME TO users');
        
        // Now insert the admin user
        const insertStmt = db.prepare(`
          INSERT INTO users (email, password, user_type, first_name, last_name, company, phone)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        
        const result = insertStmt.run(
          'admin@careerconnect.com',
          hashedPassword,
          'admin',
          'Career',
          'Admin',
          'CareerConnect',
          null
        );
        
        console.log('✅ Admin user created successfully with updated schema!');
        console.log('📧 Email: admin@careerconnect.com');
        console.log('🔐 Password: NullpointerTeams321');
        console.log('👤 Name: CareerAdmin');
        console.log('🆔 ID:', result.lastInsertRowid);
      } else {
        throw error;
      }
    }
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
  } finally {
    db.close();
  }
}

// Run the function
createAdminUser();
