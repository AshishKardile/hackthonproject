const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const fs = require('fs');
const path = require('path');

async function initDB() {
  try {
    const dbPath = path.join(__dirname, 'database.sqlite');
    if (fs.existsSync(dbPath)) {
      console.log('Database already exists. Deleting it to re-initialize...');
      fs.unlinkSync(dbPath);
    }

    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    const schemaPath = path.join(__dirname, 'models', 'sqlite-schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('Executing schema...');
    await db.exec(schema);

    console.log('Database initialized successfully with test accounts!');
    await db.close();
  } catch (err) {
    console.error('Error initializing database:', err);
    process.exit(1);
  }
}

initDB();
