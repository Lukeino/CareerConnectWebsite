const Database = require('better-sqlite3');
const path = require('path');

// Test SQLite timestamps
const dbPath = path.join(__dirname, 'server', 'db', 'database.sqlite');
const db = new Database(dbPath);

console.log('=== TIMESTAMP DEBUG SQLite ===');
console.log('Ora attuale JavaScript:', new Date().toISOString());
console.log('Ora locale Italia:', new Date().toLocaleString('it-IT', { timeZone: 'Europe/Rome' }));

// Test SQLite current timestamp
const currentTimestampResult = db.prepare("SELECT CURRENT_TIMESTAMP as current_time").get();
console.log('\nSQLite CURRENT_TIMESTAMP:', currentTimestampResult.current_time);

// Test datetime('now') 
const nowResult = db.prepare("SELECT datetime('now') as now_time").get();
console.log('SQLite datetime(now):', nowResult.now_time);

// Test datetime('now', 'localtime')
const localTimeResult = db.prepare("SELECT datetime('now', 'localtime') as local_time").get();
console.log('SQLite datetime(now, localtime):', localTimeResult.local_time);

// Ora controlliamo i job nel database
console.log('\n=== JOB TIMESTAMPS DAL DATABASE ===');
const jobs = db.prepare("SELECT id, title, created_at FROM jobs ORDER BY id DESC LIMIT 3").all();

jobs.forEach((job, index) => {
  console.log(`\nJob ${index + 1} (ID: ${job.id}):`);
  console.log('  Titolo:', job.title);
  console.log('  created_at (raw):', job.created_at);
  console.log('  Tipo:', typeof job.created_at);
  
  // Test parsing in JavaScript
  const dateNormal = new Date(job.created_at);
  console.log('  new Date():', dateNormal.toISOString());
  console.log('  toLocaleString IT:', dateNormal.toLocaleString('it-IT', { timeZone: 'Europe/Rome' }));
  
  // Test con Z aggiunto
  const dateWithZ = new Date(job.created_at + 'Z');
  console.log('  new Date() + Z:', dateWithZ.toISOString());
  console.log('  toLocaleString IT + Z:', dateWithZ.toLocaleString('it-IT', { timeZone: 'Europe/Rome' }));
});

// Test inserimento nuovo timestamp
console.log('\n=== TEST INSERIMENTO TIMESTAMP ===');
try {
  const insertTest = db.prepare("INSERT INTO jobs (title, description, location, job_type, status) VALUES (?, ?, ?, ?, ?)");
  const result = insertTest.run('Test Timestamp Job', 'Job di test per debug timestamp', 'Test Location', 'full-time', 'active');
  
  console.log('Job inserito con ID:', result.lastInsertRowid);
  
  // Recupera il job appena inserito
  const newJob = db.prepare("SELECT id, title, created_at FROM jobs WHERE id = ?").get(result.lastInsertRowid);
  console.log('Nuovo job created_at:', newJob.created_at);
  
  // Cleanup - elimina il job di test
  db.prepare("DELETE FROM jobs WHERE id = ?").run(result.lastInsertRowid);
  console.log('Job di test eliminato');
  
} catch (error) {
  console.error('Errore nel test di inserimento:', error);
}

db.close();
