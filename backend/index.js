// --------------------------------------------------------------------------------------------------------------------
//        SET UP EXPRESS SERVER
// --------------------------------------------------------------------------------------------------------------------
// Import Express framework - minimal Node.js web server library
const express = require('express')

// Import database connection
const createConnection = require('./connection')

// Import routes
const { findGameData, postGameData, findEurope, findAfrica, findAsia} = require('./routes')

// Import SQLite logic
const { addContinent} = require('./countriesSQLite')

// Node.js path module for resolving file paths
const path = require("path");

// Define default port and its backup
// While in developement, we use port 3000. Render will generate its own .env file.
const port = process.env.PORT || 3000;

// Create an Express app
const app = express()

// Parse json requests
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// Define database outside of function. Can be accessed globally.
let db;


// --------------------------------------------------------------------------------------------------------------------
//        LAUNCH SERVER
// --------------------------------------------------------------------------------------------------------------------
// Open the SQLite database file and connect to it
async function startServer() {
db = await createConnection();


// --------------------------------------------------------------------------------------------------------------------
//        CREATE SQL TABLES & INSERT INTO THEM
// --------------------------------------------------------------------------------------------------------------------
try {
  // Create gamedata table
  await db.exec(`CREATE TABLE IF NOT EXISTS gamedata (
    gameId INTEGER PRIMARY KEY AUTOINCREMENT,
    points INTEGER NOT NULL,
    region TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    mode TEXT NOT NULL,
    time INTEGER NOT NULL,
    username TEXT NOT NULL
  )`);

  // Add countries to SQLite. App.jsx will use it later.
  await addContinent(db, "europe");
  await addContinent(db, "africa");
  await addContinent(db, "asia");


// --------------------------------------------------------------------------------------------------------------------
//        REGISTER ROUTE HANDLERS
// --------------------------------------------------------------------------------------------------------------------
  findGameData(app, db);
  postGameData(app, db);
  findEurope(app, db);
  findAfrica(app, db);
  findAsia(app, db);

  // Serve index.html for client-side routes (/play, /scores), so refreshing those pages does not return 404.
  // Paths under /api/ are excluded, so unknown API endpoints still return 404.
  app.get(/^\/(?!api\/).*/, (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
  });

// Listen to port
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
} catch (err) {
    console.error("Server startup failed:", err.message);
    process.exit(1);
    }
}

// Start server
startServer();

// Close the database cleanly when the server is stopped with Ctrl+C (SIGINT) or by Docker (SIGTERM)
async function shutdown(signal) {
  console.log(`${signal} received, shutting down.`);
  if (db) {
    await db.close(); // db is undefined if startup failed before connecting
    console.log("Database connection closed.");
  }
  process.exit(0);
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));