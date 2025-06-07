import bcrypt from 'bcryptjs';

// Hybrid database service - tries API first, falls back to localStorage
class HybridDatabase {
  constructor() {
    this.baseURL = 'http://localhost:3001/api';
    this.initializeLocalData();
  }

  initializeLocalData() {
    // Check if local data already exists
    if (!localStorage.getItem('careerconnect_users')) {
      const defaultUsers = [
        {
          id: 1,
          email: 'recruiter@techcorp.com',
          password: bcrypt.hashSync('password123', 10),
          user_type: 'recruiter',
          first_name: 'Marco',
          last_name: 'Rossi',
          company: 'TechCorp',
          phone: '+39 02 1234567',
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          email: 'candidate@email.com',
          password: bcrypt.hashSync('password123', 10),
          user_type: 'candidate',
          first_name: 'Giulia',
          last_name: 'Bianchi',
          company: null,
          phone: '+39 333 7654321',
          created_at: new Date().toISOString()
        }
      ];

      localStorage.setItem('careerconnect_users', JSON.stringify(defaultUsers));
    }
  }

  async isServerAvailable() {
    try {
      const response = await fetch(`${this.baseURL}/health`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  generateId() {
    const users = JSON.parse(localStorage.getItem('careerconnect_users') || '[]');
    return users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
  }
}

const db = new HybridDatabase();

export const userService = {
  createUser: async (userData) => {
    const { email, password, userType, firstName, lastName, company, phone } = userData;
    
    // Try API first
    const serverAvailable = await db.isServerAvailable();
    if (serverAvailable) {
      try {
        console.log('🌐 Creating user via API...');
        const response = await fetch(`${db.baseURL}/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
        });
        
        const data = await response.json();
        if (data.success) {
          console.log('✅ User created via API:', data.user);
          return data.user;
        } else {
          throw new Error(data.error);
        }
      } catch (error) {
        console.log('❌ API failed, falling back to localStorage:', error.message);
      }
    }
    
    // Fallback to localStorage
    console.log('💾 Creating user via localStorage...');
    try {
      const users = JSON.parse(localStorage.getItem('careerconnect_users') || '[]');
      
      // Check if user already exists
      if (users.find(u => u.email === email)) {
        throw new Error('Email already exists');
      }
      
      const hashedPassword = bcrypt.hashSync(password, 10);
      
      const newUser = {
        id: db.generateId(),
        email,
        password: hashedPassword,
        user_type: userType,
        first_name: firstName,
        last_name: lastName,
        company: company || null,
        phone: phone || null,
        created_at: new Date().toISOString()
      };
      
      users.push(newUser);
      localStorage.setItem('careerconnect_users', JSON.stringify(users));
      
      const { password: _, ...userWithoutPassword } = newUser;
      console.log('✅ User created via localStorage:', userWithoutPassword);
      return userWithoutPassword;
    } catch (error) {
      throw new Error('Error creating user: ' + error.message);
    }
  },

  authenticateUser: async (email, password) => {
    // Try API first
    const serverAvailable = await db.isServerAvailable();
    if (serverAvailable) {
      try {
        console.log('🌐 Authenticating via API...');
        const response = await fetch(`${db.baseURL}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });
        
        const data = await response.json();
        if (data.success) {
          console.log('✅ User authenticated via API:', data.user);
          return data.user;
        } else {
          throw new Error(data.error);
        }
      } catch (error) {
        console.log('❌ API failed, falling back to localStorage:', error.message);
      }
    }
    
    // Fallback to localStorage
    console.log('💾 Authenticating via localStorage...');
    try {
      const users = JSON.parse(localStorage.getItem('careerconnect_users') || '[]');
      const user = users.find(u => u.email === email);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      const isValidPassword = bcrypt.compareSync(password, user.password);
      
      if (!isValidPassword) {
        throw new Error('Invalid password');
      }
      
      const { password: _, ...userWithoutPassword } = user;
      console.log('✅ User authenticated via localStorage:', userWithoutPassword);
      return userWithoutPassword;
    } catch (error) {
      throw new Error('Authentication failed: ' + error.message);
    }
  }
};

// Default export for compatibility
export default {
  userService
};
