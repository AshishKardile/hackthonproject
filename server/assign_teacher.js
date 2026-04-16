const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`INSERT OR IGNORE INTO teacher_subjects (teacher_id, subject_name) 
          VALUES ((SELECT id FROM users WHERE email = 'robert@eduwell.com'), 'Data Structures and Algorithms (DSA)')`);
  console.log('Teacher subject assigned successfully.');
});

db.close();
