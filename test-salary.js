const Database = require('better-sqlite3');
const db = new Database('./server/db/database.sqlite');

const stmt = db.prepare(`
  SELECT 
    id, 
    title, 
    salary_min, 
    salary_max,
    CASE 
      WHEN salary_min IS NOT NULL AND salary_max IS NOT NULL THEN 
        '€' || salary_min || ' - €' || salary_max
      WHEN salary_min IS NOT NULL THEN 
        'Da €' || salary_min
      WHEN salary_max IS NOT NULL THEN 
        'Fino a €' || salary_max
      ELSE 'Stipendio da concordare'
    END as salary_range
  FROM jobs 
  LIMIT 5
`);

console.log('Jobs with salary_range:');
console.log(stmt.all());
db.close();
