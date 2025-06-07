const { userService, jobService } = require('./database.js');

// Function to create sample data
const createSampleData = async () => {
  try {
    console.log('Creating sample data...');

    // Create sample users
    const sampleUsers = [
      {
        email: 'recruiter@techcorp.com',
        password: 'password123',
        userType: 'recruiter',
        firstName: 'Marco',
        lastName: 'Rossi',
        company: 'TechCorp',
        phone: '+39 02 1234567'
      },
      {
        email: 'candidate@email.com',
        password: 'password123',
        userType: 'candidate',
        firstName: 'Giulia',
        lastName: 'Bianchi',
        phone: '+39 333 7654321'
      },
      {
        email: 'hr@innovatelab.com',
        password: 'password123',
        userType: 'recruiter',
        firstName: 'Laura',
        lastName: 'Verdi',
        company: 'InnovateLab',
        phone: '+39 06 9876543'
      }
    ];

    for (const userData of sampleUsers) {
      try {
        await userService.createUser(userData);
        console.log(`Created user: ${userData.email}`);
      } catch (error) {
        if (error.message.includes('UNIQUE constraint failed')) {
          console.log(`User ${userData.email} already exists, skipping...`);
        } else {
          console.error(`Error creating user ${userData.email}:`, error.message);
        }
      }
    }

    console.log('Sample data creation completed!');
  } catch (error) {
    console.error('Error creating sample data:', error);
  }
};

// Run if this file is executed directly
if (require.main === module) {
  createSampleData();
}

module.exports = { createSampleData };
