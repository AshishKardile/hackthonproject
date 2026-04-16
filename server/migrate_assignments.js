const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run("ALTER TABLE assignments ADD COLUMN start_date DATETIME", (err) => {
    if (err) console.log('Column start_date already exists or err: ', err.message);
    else console.log('start_date added');
  });
});

db.close();
