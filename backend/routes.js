// --------------------------------------------------------------------------------------------------------------------
//        ROUTES
// --------------------------------------------------------------------------------------------------------------------
const { REGIONS } = require("./countriesSQLite");

// Allowed values for a submitted game result
const MODES = ["nameflag", "flag"];
const DIFFICULTIES = ["easy", "hard"];
const MAX_USERNAME_LENGTH = 30;

// Returns an error message for an invalid game result, or null if it is valid
function validateGameData({ points, mode, region, difficulty, time, username } = {}) {
  if (!Number.isFinite(points) || points < 0) return "points must be a non-negative number";
  if (!Number.isInteger(time) || time < 0) return "time must be a non-negative integer";
  if (!MODES.includes(mode)) return `mode must be one of: ${MODES.join(", ")}`;
  if (!REGIONS.includes(region)) return `region must be one of: ${REGIONS.join(", ")}`;
  if (!DIFFICULTIES.includes(difficulty)) return `difficulty must be one of: ${DIFFICULTIES.join(", ")}`;
  if (typeof username !== "string" || !username.trim() || username.trim().length > MAX_USERNAME_LENGTH) {
    return `username must be 1-${MAX_USERNAME_LENGTH} characters`;
  }
  return null;
}

// Log the real error on the server, but don't send database internals to the client
function sendServerError(res, err) {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
}

function registerRoutes(app, db) {
  // List all game results
  app.get("/api/gamedata", async (req, res) => {
    try {
      res.json(await db.all("SELECT * FROM gamedata"));
    } catch (err) {
      sendServerError(res, err);
    }
  });

  // Save a game result
  app.post("/api/gamedata", async (req, res) => {
    try {
      const error = validateGameData(req.body);
      if (error) return res.status(400).json({ error });

      const { points, mode, region, difficulty, time, username } = req.body;
      const result = await db.run(
        `INSERT INTO gamedata (points, mode, region, difficulty, time, username)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [points, mode, region, difficulty, time, username.trim()]
      );
      res.status(201).json({ gameId: result.lastID });
    } catch (err) {
      sendServerError(res, err);
    }
  });

  // List the countries of one region: /api/europe, /api/africa or /api/asia
  app.get("/api/:region", async (req, res, next) => {
    const { region } = req.params;
    // The region becomes a table name, so only known regions may reach the query
    if (!REGIONS.includes(region)) return next();

    try {
      res.json(await db.all(`SELECT * FROM ${region}`));
    } catch (err) {
      sendServerError(res, err);
    }
  });
}

module.exports = { registerRoutes };
