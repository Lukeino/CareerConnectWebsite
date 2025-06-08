const Database = require('better-sqlite3');
const path = require('path');

// Initialize database
const dbPath = path.join(__dirname, 'server', 'db', 'database.sqlite');
console.log('Migration script - Database path:', dbPath);

try {
  const db = new Database(dbPath);
  console.log('✅ Database connection established');

  // Get all unique companies from existing recruiters
  const getCompaniesStmt = db.prepare(`
    SELECT DISTINCT company 
    FROM users 
    WHERE user_type = 'recruiter' 
    AND company IS NOT NULL 
    AND company != ''
  `);
  
  const existingCompanies = getCompaniesStmt.all();
  console.log(`🔍 Found ${existingCompanies.length} unique companies from recruiters:`, existingCompanies.map(c => c.company));

  // Check which companies already exist in companies table
  const checkCompanyStmt = db.prepare('SELECT name FROM companies WHERE name = ?');
  const insertCompanyStmt = db.prepare(`
    INSERT INTO companies (name, description, website, location)
    VALUES (?, ?, ?, ?)
  `);

  let migratedCount = 0;
  let skippedCount = 0;

  for (const companyData of existingCompanies) {
    const companyName = companyData.company.trim();
    const existingCompany = checkCompanyStmt.get(companyName);
    
    if (!existingCompany) {
      // Create company entry
      const description = `Azienda specializzata nel settore IT con focus su innovation e tecnologie moderne.`;
      const website = `https://${companyName.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')}.com`;
      
      insertCompanyStmt.run(
        companyName,
        description,
        website,
        'Italia'
      );
      
      console.log(`✅ Migrated company: ${companyName}`);
      migratedCount++;
    } else {
      console.log(`⏭️ Skipped (already exists): ${companyName}`);
      skippedCount++;
    }
  }

  console.log(`\n📊 Migration Summary:`);
  console.log(`   • Companies migrated: ${migratedCount}`);
  console.log(`   • Companies skipped: ${skippedCount}`);
  console.log(`   • Total companies processed: ${existingCompanies.length}`);

  // Verify the migration
  const verifyStmt = db.prepare('SELECT COUNT(*) as count FROM companies');
  const totalCompanies = verifyStmt.get();
  console.log(`\n🔍 Total companies in companies table: ${totalCompanies.count}`);

  db.close();
  console.log('\n🎉 Migration completed successfully!');

} catch (error) {
  console.error('❌ Migration error:', error.message);
  process.exit(1);
}
