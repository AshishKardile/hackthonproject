const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function initDB() {
  try {
    // Create connection without specifying the database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true
    });
    
    console.log('Connected to MySQL server.');

    const schemaPath = path.join(__dirname, 'models', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('Executing schema.sql...');
    await connection.query(schema);
    
    console.log('Database initialized successfully.');
    await connection.end();
  } catch (err) {
    console.error('Error initializing database: ', err.message);
    process.exit(1);
  }
}

initDB();
