// --------------------------------------------------------------------------------------------------------------------
//        ROUTERS
// --------------------------------------------------------------------------------------------------------------------

// Fetch game results
function findGameData(app, db) {
app.get('/api/gamedata', async (req, res) => {
  try {
    const rows = await db.all("SELECT * FROM gamedata");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
}

// Allowed values for a submitted game result
const MODES = ["nameflag", "flag"];
const REGIONS = ["europe", "africa", "asia"];
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

// Save a game result
function postGameData(app, db) {
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
    res.status(500).json({ error: err.message });
  }
});
}

// Europe
function findEurope(app, db) {
app.get('/api/europe', async (req, res) => {
  try {
    const rows = await db.all("SELECT * FROM europe");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
}

// Africa
function findAfrica(app, db) {
app.get('/api/africa', async (req, res) => {
  try {
    const rows = await db.all("SELECT * FROM africa");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
}

// Asia
function findAsia(app, db) {
app.get('/api/asia', async (req, res) => {
  try {
    const rows = await db.all("SELECT * FROM asia");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
}

module.exports = {
  findGameData,
  postGameData,
  findEurope,
  findAfrica,
  findAsia
};