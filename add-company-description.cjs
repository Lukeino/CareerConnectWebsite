const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'server', 'db', 'database.sqlite');
console.log('🔧 Adding company_description field to jobs table...');

try {
  const db = new Database(dbPath);
  
  // Check if the column already exists
  const columns = db.prepare("PRAGMA table_info(jobs)").all();
  const hasCompanyDescription = columns.some(col => col.name === 'company_description');
  
  if (hasCompanyDescription) {
    console.log('✅ Campo company_description già esistente nella tabella jobs');
  } else {
    // Add the company_description column
    db.exec('ALTER TABLE jobs ADD COLUMN company_description TEXT');
    console.log('✅ Campo company_description aggiunto con successo alla tabella jobs');
  }
  
  // Verify the update
  const updatedColumns = db.prepare("PRAGMA table_info(jobs)").all();
  console.log('\n📋 Struttura aggiornata della tabella jobs:');
  updatedColumns.forEach(col => {
    console.log(`   ${col.name}: ${col.type}${col.notnull ? ' NOT NULL' : ''}${col.dflt_value ? ` DEFAULT ${col.dflt_value}` : ''}`);
  });
  
  db.close();
} catch (error) {
  console.error('❌ Errore nell\'aggiornamento del database:', error.message);
}
