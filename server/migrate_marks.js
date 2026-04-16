const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run("ALTER TABLE academic_records ADD COLUMN cca INTEGER DEFAULT 0", (err) => {
    if (err) console.log('Column cca exists or err: ', err.message);
  });
  db.run("ALTER TABLE academic_records ADD COLUMN lca INTEGER DEFAULT 0", (err) => {
    if (err) console.log('Column lca exists or err: ', err.message);
  });
  db.run("ALTER TABLE academic_records ADD COLUMN project INTEGER DEFAULT 0", (err) => {
    if (err) console.log('Column project exists or err: ', err.message);
  });
  db.run("ALTER TABLE academic_records ADD COLUMN midsem INTEGER DEFAULT 0", (err) => {
    if (err) console.log('Column midsem exists or err: ', err.message);
  });
  db.run("ALTER TABLE academic_records ADD COLUMN endsem INTEGER DEFAULT 0", (err) => {
    if (err) console.log('Column endsem exists or err: ', err.message);
  });
  db.run("ALTER TABLE academic_records ADD COLUMN total_percentage DECIMAL(5,2) DEFAULT 0", (err) => {
    if (err) console.log('Column total_percentage exists or err: ', err.message);
  });
});

db.close();
