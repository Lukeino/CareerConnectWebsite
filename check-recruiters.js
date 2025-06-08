const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./server/db/database.sqlite');

db.all('SELECT id, first_name, last_name, email, user_type, company FROM users WHERE user_type = ?', ['recruiter'], (err, rows) => {
  if (err) {
    console.error(err);
  } else {
    console.log('Recruiters in database:');
    console.table(rows);
  }
  db.close();
});
