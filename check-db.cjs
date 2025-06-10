const Database = require('better-sqlite3');
const path = require('path');

try {
  const dbPath = path.join(__dirname, 'server', 'db', 'database.sqlite');
  console.log('Percorso database:', dbPath);
  
  const db = new Database(dbPath);
  
  console.log('=== JOBS NEL DATABASE ===');
  const jobs = db.prepare('SELECT id, title, created_at FROM jobs ORDER BY id DESC LIMIT 10').all();
  
  console.log(`Trovati ${jobs.length} job nel database`);
  
  jobs.forEach(job => {
    const date = new Date(job.created_at);
    const now = new Date();
    const diffMs = now - date;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    console.log(`ID: ${job.id}`);
    console.log(`  Title: ${job.title}`);
    console.log(`  Created: ${job.created_at}`);
    console.log(`  Tempo fa: ${diffHours} ore, ${diffMinutes % 60} minuti`);
    console.log('---');
  });
  
  db.close();
} catch (error) {
  console.error('Errore:', error.message);
  console.error('Stack:', error.stack);
}
