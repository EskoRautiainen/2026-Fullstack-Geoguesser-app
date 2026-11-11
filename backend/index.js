// --------------------------------------------------------------------------------------------------------------------
//        SET UP EXPRESS SERVER
// --------------------------------------------------------------------------------------------------------------------
const path = require("path");
const express = require("express");
const createConnection = require("./connection");
const { registerRoutes } = require("./routes");
const { seedCountries } = require("./countriesSQLite");

// Hosting platforms set PORT; 3000 is the local default
const port = process.env.PORT || 3000;

const app = express();
app.use(express.json());

// Serve the built frontend (copied into public/ by the Docker build)
app.use(express.static(path.join(__dirname, "public")));

// Kept at module level so shutdown() can close it
let db;

// --------------------------------------------------------------------------------------------------------------------
//        LAUNCH SERVER
// --------------------------------------------------------------------------------------------------------------------
async function startServer() {
  try {
    db = await createConnection();

    // points is REAL because final scores have one decimal
    await db.exec(`CREATE TABLE IF NOT EXISTS gamedata (
      gameId INTEGER PRIMARY KEY AUTOINCREMENT,
      points REAL NOT NULL,
      region TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      mode TEXT NOT NULL,
      time INTEGER NOT NULL,
      username TEXT NOT NULL
    )`);

    await seedCountries(db);
    registerRoutes(app, db);

    // Serve index.html for client-side routes (/play, /scores), so refreshing those pages does not return 404.
    // Paths under /api/ are excluded, so unknown API endpoints still return 404.
    app.get(/^\/(?!api\/).*/, (req, res) => {
      res.sendFile(path.join(__dirname, "public", "index.html"));
    });

    app.listen(port, () => {
      console.log(`Server listening on http://localhost:${port}`);
    });
  } catch (err) {
    console.error("Server startup failed:", err.message);
    process.exit(1);
  }
}

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
