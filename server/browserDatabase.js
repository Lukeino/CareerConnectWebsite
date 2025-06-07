import bcrypt from 'bcryptjs';

// Simulate database with localStorage
class BrowserDatabase {
  constructor() {
    this.initializeData();
  }

  initializeData() {
    // Check if data already exists
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
        },
        {
          id: 3,
          email: 'hr@innovatelab.com',
          password: bcrypt.hashSync('password123', 10),
          user_type: 'recruiter',
          first_name: 'Laura',
          last_name: 'Verdi',
          company: 'InnovateLab',
          phone: '+39 06 9876543',
          created_at: new Date().toISOString()
        }
      ];

      localStorage.setItem('careerconnect_users', JSON.stringify(defaultUsers));
      
      const defaultJobs = [
        {
          id: 1,
          title: 'Senior Frontend Developer',
          description: 'We are looking for an experienced Frontend Developer to join our team...',
          company_name: 'TechCorp',
          recruiter_id: 1,
          location: 'Milano, Italy',
          job_type: 'full-time',
          salary_min: 45000,
          salary_max: 65000,
          requirements: 'React, TypeScript, 5+ years experience',
          benefits: 'Health insurance, Remote work, Learning budget',
          status: 'active',
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 2,
          title: 'Product Manager',
          description: 'Join our product team to drive innovation and deliver amazing user experiences...',
          company_name: 'InnovateLab',
          recruiter_id: 3,
          location: 'Roma, Italy',
          job_type: 'full-time',
          salary_min: 50000,
          salary_max: 70000,
          requirements: 'Product management experience, Analytics skills',
          benefits: 'Stock options, Flexible hours, Team events',
          status: 'active',
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 3,
          title: 'UX/UI Designer',
          description: 'Create beautiful and intuitive user interfaces for our digital products...',
          company_name: 'DesignStudio',
          recruiter_id: 1,
          location: 'Torino, Italy',
          job_type: 'full-time',
          salary_min: 35000,
          salary_max: 50000,
          requirements: 'Figma, Adobe Creative Suite, Portfolio required',
          benefits: 'Creative freedom, Modern office, Growth opportunities',
          status: 'active',
          created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];

      localStorage.setItem('careerconnect_jobs', JSON.stringify(defaultJobs));
      
      console.log('Sample data initialized in localStorage');
    }
  }

  getUsers() {
    const users = localStorage.getItem('careerconnect_users');
    return users ? JSON.parse(users) : [];
  }

  getJobs() {
    const jobs = localStorage.getItem('careerconnect_jobs');
    return jobs ? JSON.parse(jobs) : [];
  }

  saveUsers(users) {
    localStorage.setItem('careerconnect_users', JSON.stringify(users));
  }

  saveJobs(jobs) {
    localStorage.setItem('careerconnect_jobs', JSON.stringify(jobs));
  }

  getNextUserId() {
    const users = this.getUsers();
    return users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
  }

  getNextJobId() {
    const jobs = this.getJobs();
    return jobs.length > 0 ? Math.max(...jobs.map(j => j.id)) + 1 : 1;
  }
}

// Create database instance
const db = new BrowserDatabase();

// User service functions
export const userService = {
  // Create new user
  createUser: async (userData) => {
    const { email, password, userType, firstName, lastName, company, phone } = userData;
    
    try {
      const users = db.getUsers();
      
      // Check if user already exists
      const existingUser = users.find(u => u.email === email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }
      
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const newUser = {
        id: db.getNextUserId(),
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
      db.saveUsers(users);
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = newUser;
      return userWithoutPassword;
    } catch (error) {
      throw new Error('Error creating user: ' + error.message);
    }
  },

  // Authenticate user
  authenticateUser: async (email, password) => {
    try {
      const users = db.getUsers();
      const user = users.find(u => u.email === email);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      const isValidPassword = await bcrypt.compare(password, user.password);
      
      if (!isValidPassword) {
        throw new Error('Invalid password');
      }
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      throw new Error('Authentication failed: ' + error.message);
    }
  },

  // Get user by ID
  getUserById: (id) => {
    const users = db.getUsers();
    const user = users.find(u => u.id === id);
    if (user) {
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
    return null;
  },

  // Get user by email
  getUserByEmail: (email) => {
    const users = db.getUsers();
    const user = users.find(u => u.email === email);
    if (user) {
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
    return null;
  }
};

// Job service functions
export const jobService = {
  // Get all active jobs
  getAllJobs: () => {
    const jobs = db.getJobs();
    return jobs.filter(job => job.status === 'active');
  },

  // Search jobs
  searchJobs: (searchTerm, location) => {
    const jobs = db.getJobs();
    let filteredJobs = jobs.filter(job => job.status === 'active');
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filteredJobs = filteredJobs.filter(job => 
        job.title.toLowerCase().includes(searchLower) ||
        job.description.toLowerCase().includes(searchLower) ||
        job.company_name.toLowerCase().includes(searchLower)
      );
    }
    
    if (location) {
      const locationLower = location.toLowerCase();
      filteredJobs = filteredJobs.filter(job => 
        job.location.toLowerCase().includes(locationLower)
      );
    }
    
    return filteredJobs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  // Get job by ID
  getJobById: (id) => {
    const jobs = db.getJobs();
    return jobs.find(job => job.id === parseInt(id));
  }
};

export default { userService, jobService };
