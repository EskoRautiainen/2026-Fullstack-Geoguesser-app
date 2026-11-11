// --------------------------------------------------------------------------------------------------------------------
//        PERSISTENT SQL DATABASE CONNECTION
// --------------------------------------------------------------------------------------------------------------------

const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require("path");

let db;
async function createConnection() {
try {

  if (db) return db; // Prevent creating a new connection if one already exists
  db = await open({
    // DB_PATH lets Docker keep the database on a volume. Defaults to backend/database.db.
    filename: process.env.DB_PATH || path.join(__dirname, 'database.db'),
    driver: sqlite3.Database,
  });

  console.log('Connected to SQLite database!');
  return db;
} catch (err) {
    console.error('Connection failed:', err.message);
    // Throw err crashes createConnection immediately. Without throw err, createConnection will return undefined.
    throw err;
}
};

module.exports = createConnection;