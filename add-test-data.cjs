const Database = require('better-sqlite3');
const path = require('path');

console.log('Adding test CV data...');

// Initialize database
const dbPath = path.join(__dirname, 'server', 'db', 'database.sqlite');
const db = new Database(dbPath);

try {
  // Find a candidate user to add CV data to
  const candidate = db.prepare("SELECT id, email FROM users WHERE user_type = 'candidate' LIMIT 1").get();
  
  if (candidate) {
    console.log(`Found candidate: ${candidate.email} (ID: ${candidate.id})`);
    
    // Update the candidate with test CV filename
    const updateStmt = db.prepare('UPDATE users SET cv_filename = ? WHERE id = ?');
    const result = updateStmt.run('test-cv.pdf', candidate.id);
    
    console.log(`Updated ${result.changes} row(s) with test CV filename`);
    
    // Now let's create a test application to see if CV viewing works
    // First, get a job posted by a recruiter
    const job = db.prepare("SELECT id, title FROM jobs WHERE status = 'active' LIMIT 1").get();
    
    if (job) {
      console.log(`Found job: ${job.title} (ID: ${job.id})`);
      
      // Create a test application if it doesn't exist
      const existingApp = db.prepare("SELECT id FROM applications WHERE job_id = ? AND candidate_id = ?").get(job.id, candidate.id);
      
      if (!existingApp) {
        const insertApp = db.prepare(`
          INSERT INTO applications (job_id, candidate_id, candidate_name, candidate_email)
          VALUES (?, ?, ?, ?)
        `);
        
        const candidateDetails = db.prepare("SELECT first_name, last_name, email FROM users WHERE id = ?").get(candidate.id);
        const appResult = insertApp.run(
          job.id, 
          candidate.id,
          `${candidateDetails.first_name} ${candidateDetails.last_name}`,
          candidateDetails.email
        );
        
        console.log(`Created test application with ID: ${appResult.lastInsertRowid}`);
      } else {
        console.log(`Application already exists with ID: ${existingApp.id}`);
      }
    } else {
      console.log('No active jobs found - you may need to create one first');
    }
    
  } else {
    console.log('No candidate users found');
  }
  
} catch (error) {
  console.error('❌ Error:', error);
} finally {
  db.close();
  console.log('Test data creation completed');
}
