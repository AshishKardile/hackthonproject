const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

let dbInstance = null;

async function getDb() {
  if (!dbInstance) {
    dbInstance = await open({
      filename: path.join(__dirname, '../database.sqlite'),
      driver: sqlite3.Database
    });
  }
  return dbInstance;
}

const pool = {
  query: async (sql, params = []) => {
    try {
      const db = await getDb();
      // Simple heuristic to distinguish SELECT from INSERT/UPDATE/DELETE
      const isSelect = sql.trim().toUpperCase().startsWith('SELECT');
      if (isSelect) {
        const rows = await db.all(sql, params);
        return [rows, []];
      } else {
        const result = await db.run(sql, params);
        return [{ insertId: result.lastID, affectedRows: result.changes }, []];
      }
    } catch (error) {
      console.error("Database query failed:");
      console.error(sql);
      console.error(error);
      throw error;
    }
  },
  execute: async (sql, params = []) => {
    return pool.query(sql, params);
  }
};

module.exports = pool;
