const pool = require('./config/db');
const bcrypt = require('bcryptjs');

async function test() {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('test', salt);
    
    console.log("Checking if user exists...");
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', ['test2@eduwell.com']);
    console.log("Existing users:", existing);

    console.log("Inserting user...");
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role, department, year_level) VALUES (?, ?, ?, ?, ?, ?)',
      ['Test', 'test2@eduwell.com', hashedPassword, 'student', null, null]
    );
    console.log("Insert result:", result);

    console.log("Inserting gamification...");
    await pool.query(
      'INSERT INTO gamification (user_id, points, level, streak_days) VALUES (?, 0, 1, 0)',
      [result.insertId]
    );
    console.log("Gamification created.");
  } catch(e) {
    console.error("FAILED:", e);
  }
}
test();
