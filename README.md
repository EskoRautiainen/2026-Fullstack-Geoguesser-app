# Fullstack GeoGuesser

A geography game for learning countries and flags. Players find countries on an interactive world map and earn points for accuracy and speed. Results are saved to a SQLite database and shown on a scoreboard.

The project is an npm workspaces monorepo with a **React** frontend and a **Node.js / Express** REST API.

<img width="938" height="986" alt="Game screen with the world map, score, timer and target country" src="https://github.com/user-attachments/assets/78d28209-9cee-4623-aa80-81bcfd688dbc" />

**Screencast:** https://www.youtube.com/watch?v=hbnEBjjn8ZU

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) 20.11 or newer (includes npm)
- [Docker](https://www.docker.com/) (optional, only for running the production build in a container)

### Run in development mode

```bash
npm install
```

```bash
npm start
```

Then open http://localhost:5173.

`npm start` uses [concurrently](https://www.npmjs.com/package/concurrently) to run two processes:

| Process | Command | Port |
|---------|---------|------|
| Frontend | Vite dev server (`npm run dev --workspace=frontend`) | 5173 |
| Backend | Express API (`npm start --workspace=backend`) | 3000 |

Vite forwards requests for `/api/*` to the backend on port 3000.

### Run with Docker

```bash
docker compose up --build
```

Then open http://localhost:3000.

## How to play

1. On the home page, choose a **region** (Europe, Africa or Asia), a **difficulty** and a **game mode**, then enter your name. The Start button stays disabled until you enter a name.
2. Click the country you are asked to find. You have three guesses per country.
3. After the last round, your result is saved automatically and appears on the **Scores** page.

| Setting | Options |
|---------|---------|
| Difficulty | Easy: 10 countries, Hard: 25 countries |
| Game mode | Name and flag: the country name and flag are shown<br>Flag only: only the flag is shown |

### Map feedback

| Colour | Meaning |
|--------|---------|
| Green | Correct guess |
| Red | Wrong guess |
| Blue | The correct country, shown for 2.5 seconds after three wrong guesses |
| Yellow | Country under the mouse pointer |

A sound plays after every guess.

### Scoring

Each round is worth points based on how many guesses you needed:

| Guess | Points |
|-------|--------|
| 1st | 180 |
| 2nd | 120 |
| 3rd | 60 |
| Not found | 0 |

When the game ends, the round points are adjusted by the total time in seconds:

```text
final points = round points × 5 / (time / 50 + 1)
```

For example, 1,740 round points in 100 seconds gives 1740 × 5 / 3 = 2,900 points.

## Screenshots

### Home page

<img width="539" height="555" alt="Home page with region, difficulty and mode options and a name field" src="https://github.com/user-attachments/assets/0dae6a54-2526-4185-ba3e-2033fb555650" />

### Scoreboard

Results are grouped by game mode and sorted from highest to lowest. Each entry shows the points, player name, region and difficulty.

<img width="1061" height="993" alt="Scoreboard with separate lists for the two game modes" src="https://github.com/user-attachments/assets/aebee42a-b61e-4542-a2c2-b58a0fb498f4" />

## Tech stack

| Part | Technologies |
|------|--------------|
| Frontend | React 18, React Router, Material UI, React Simple Maps, Vite |
| Backend | Node.js, Express 5, SQLite (`sqlite` + `sqlite3`) |
| Deployment | Docker multi-stage build, Docker Compose |

Exact versions are listed in each `package.json`.

## Project structure

```text
.
├── backend/
│   ├── index.js            Express server: startup, table creation, static files
│   ├── routes.js           REST API route handlers and input validation
│   ├── connection.js       SQLite connection
│   ├── countriesSQLite.js  Country lists per region and database seeding
│   └── test.http           Example API requests (VS Code REST Client)
├── frontend/
│   ├── public/             GeoJSON world map, flag images and sound effects
│   └── src/
│       ├── App.jsx         Routes and shared game settings
│       └── components/
│           ├── Home.jsx    Game setup screen
│           ├── Map.jsx     Game screen: map, rounds, scoring and timer
│           ├── Stats.jsx   Score, time, target and last guess
│           └── Scores.jsx  Scoreboard
├── Dockerfile
└── docker-compose.yml
```

## Backend

### Startup

When the backend starts, it:

1. Opens the SQLite database file (`backend/database.db`, or the path in `DB_PATH`).
2. Creates the `gamedata` table if it does not exist.
3. Creates the `europe`, `africa` and `asia` tables and refills them with the country names and flag codes from `countriesSQLite.js`.
4. Registers the API routes and listens on `PORT` (default 3000).

Country names must match the `name` property of the features in `frontend/public/GeoJSON.json`; otherwise the country cannot be guessed.

### API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/gamedata` | List all saved game results |
| POST | `/api/gamedata` | Save a game result |
| GET | `/api/europe` | List the European countries |
| GET | `/api/africa` | List the African countries |
| GET | `/api/asia` | List the Asian countries |

Country endpoints return objects such as `{ "countryId": 1, "name": "Finland", "code": "fi" }`.

#### POST /api/gamedata

Request body:

```json
{
  "points": 2900,
  "mode": "nameflag",
  "region": "europe",
  "difficulty": "easy",
  "time": 100,
  "username": "Player"
}
```

| Field | Rule |
|-------|------|
| `points` | Number, 0 or more |
| `time` | Whole number of seconds, 0 or more |
| `mode` | `nameflag` or `flag` |
| `region` | `europe`, `africa` or `asia` |
| `difficulty` | `easy` or `hard` |
| `username` | 1–30 characters (surrounding spaces are removed) |

Responses:

- `201 Created` with `{ "gameId": 1 }`
- `400 Bad Request` with `{ "error": "..." }` if a field is invalid

All queries use prepared statements to prevent SQL injection.

### Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Port the server listens on |
| `DB_PATH` | `backend/database.db` | Location of the SQLite database file |

## Docker

The `Dockerfile` uses a multi-stage build:

1. **Build stage:** installs the frontend dependencies and builds the frontend with Vite.
2. **Runtime stage:** installs only the backend's production dependencies and copies the built frontend into `backend/public`.

In the container, Express serves both the API and the frontend on port 3000. Other paths, such as `/play` and `/scores`, return `index.html`, so refreshing those pages works.

`docker-compose.yml` stores the database on the named volume `db-data`, so scores are kept when the container is rebuilt. To delete all saved scores:

```bash
docker compose down -v
```

## Known issues

- Small countries are hard to click, even when zoomed in.
- `GeoJSON.json` is about 15 MB, so the game screen loads slowly on the first visit.
- The scoreboard does not prevent fake results: anyone can send a valid request to `POST /api/gamedata`.
