// --------------------------------------------------------------------------------------------------------------------
//        PERSISTENT SQL DATABASE CONNECTION
// --------------------------------------------------------------------------------------------------------------------
const path = require("path");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

let db;

// Open the database once and reuse the connection. Errors are handled by the caller (index.js).
async function createConnection() {
  if (db) return db;

  db = await open({
    // DB_PATH lets Docker keep the database on a volume. Defaults to backend/database.db.
    filename: process.env.DB_PATH || path.join(__dirname, "database.db"),
    driver: sqlite3.Database,
  });

  console.log("Connected to SQLite database!");
  return db;
}

module.exports = createConnection;
