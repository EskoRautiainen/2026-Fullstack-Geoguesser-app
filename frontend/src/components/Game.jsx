import { useState, useEffect } from "react";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { Link } from "react-router-dom";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { GameHud } from "./GameHud";
import ZoomControls from "./ZoomControls";
import playSound from "../playSound";
import { ROUNDS, MAX_GUESSES, REVEAL_MS, roundPoints, finalScore, shuffle } from "../game";
import "./Game.css";

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const ZOOM_STEP = 1.5;

const COLORS = {
  country: "#FFFFFF",
  hover: "#FFD700",
  correct: "#00FF00",
  wrong: "#FF0000",
  reveal: "#0000FF",
};

// GeoJSON.json is ~15 MB, so fetch and parse it once and reuse it on later visits to /play.
let geoDataPromise = null;
function loadGeoData() {
  geoDataPromise ??= fetch("/GeoJSON.json")
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .catch(err => {
      geoDataPromise = null; // Allow a retry on the next visit
      throw err;
    });
  return geoDataPromise;
}

// --------------------------------------------------------------------------------------------------------------------
//        GAME STATE
// --------------------------------------------------------------------------------------------------------------------
function Game({ gameConfig }) {
  const [geoData, setGeoData] = useState(null);                                 // world map from /public
  const [allCountries, setAllCountries] = useState([]);                         // countries of the region, with flags
  const [targetCountries, setTargetCountries] = useState([]);                   // countries to find, in order
  const [currentIndex, setCurrentIndex] = useState(0);                          // current round
  const [attempt, setAttempt] = useState(MAX_GUESSES);                          // guesses left this round
  const [score, setScore] = useState(0);                                        // number of correct guesses
  const [points, setPoints] = useState(0);                                      // round points, final score at the end
  const [time, setTime] = useState(0);                                          // seconds played
  const [gameOver, setGameOver] = useState(false);
  const [clickedCountry, setClickedCountry] = useState(null);                   // country object of the last click
  const [lastGuess, setLastGuess] = useState(null);                             // { name, isCorrect }
  const [revealAnswer, setRevealAnswer] = useState(null);                       // country shown after the last wrong guess
  const [position, setPosition] = useState({ coordinates: [30, 30], zoom: 3 }); // map centre and zoom
  const [playerName, setPlayerName] = useState("");                             // name typed on the game-over card
  const [saveState, setSaveState] = useState("idle");                           // idle | saving | saved | error

  const currentTarget = targetCountries[currentIndex];
  const isLoaded = geoData !== null && targetCountries.length > 0;

// --------------------------------------------------------------------------------------------------------------------
//        LOAD DATA AND SELECT TARGET COUNTRIES
// --------------------------------------------------------------------------------------------------------------------
  useEffect(() => {
    loadGeoData()
      .then(setGeoData)
      .catch(err => console.error("Failed to load GeoJSON:", err));
  }, []);

  useEffect(() => {
    async function fetchCountries() {
      try {
        const res = await fetch(`/api/${gameConfig.region}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const countries = (await res.json()).map(country => ({
          ...country,
          flag: `/flags/${country.code}.png`,
        }));

        setAllCountries(countries);
        setTargetCountries(shuffle(countries).slice(0, ROUNDS[gameConfig.difficulty] ?? ROUNDS.easy));
      } catch (err) {
        console.error("Failed to load countries:", err);
      }
    }
    fetchCountries();
  }, [gameConfig]);

// --------------------------------------------------------------------------------------------------------------------
//        TIMER
// --------------------------------------------------------------------------------------------------------------------
  useEffect(() => {
    if (!isLoaded || gameOver) return; // Runs only while the game is playable

    const interval = setInterval(() => setTime(prev => prev + 1), 1000);
    return () => clearInterval(interval);
  }, [isLoaded, gameOver]);

// --------------------------------------------------------------------------------------------------------------------
//        ZOOM
// --------------------------------------------------------------------------------------------------------------------
  const handleZoomIn = () =>
    setPosition(pos => ({ ...pos, zoom: Math.min(pos.zoom * ZOOM_STEP, MAX_ZOOM) }));

  const handleZoomOut = () =>
    setPosition(pos => ({ ...pos, zoom: Math.max(pos.zoom / ZOOM_STEP, MIN_ZOOM) }));

// --------------------------------------------------------------------------------------------------------------------
//        ROUNDS
// --------------------------------------------------------------------------------------------------------------------
  // newPoints: the round points total including the round that just ended
  function nextRound(newPoints) {
    if (currentIndex + 1 < targetCountries.length) {
      setPoints(newPoints);
      setCurrentIndex(currentIndex + 1);
      setAttempt(MAX_GUESSES);
      return;
    }

    // Last round: the player saves the result from the game-over card
    setPoints(finalScore(newPoints, time));
    setGameOver(true);
  }

  const handleClickCountry = (name) => {
    // Ignore clicks after the game ends, before the targets load, and while the answer is revealed (0 guesses left)
    if (gameOver || !currentTarget || attempt === 0) return;

    const guessesLeft = attempt - 1;
    const isCorrect = name === currentTarget.name;

    setAttempt(guessesLeft);
    setClickedCountry(allCountries.find(c => c.name === name)); // undefined for countries outside the region
    setLastGuess({ name, isCorrect });
    playSound(isCorrect);

    if (isCorrect) {
      setScore(prev => prev + 1);
      nextRound(points + roundPoints(attempt));
    } else if (guessesLeft === 0) {
      // Out of guesses: show the correct country, then move on with no points
      setRevealAnswer(currentTarget.name);
      setTimeout(() => {
        setRevealAnswer(null);
        nextRound(points);
      }, REVEAL_MS);
    }
  };

// --------------------------------------------------------------------------------------------------------------------
//        SAVE SCORE (from the game-over card)
// --------------------------------------------------------------------------------------------------------------------
  const savedName = playerName.trim() || "Anonymous";

  async function saveScore(e) {
    e.preventDefault();
    if (saveState === "saving" || saveState === "saved") return; // Protect against double POST
    setSaveState("saving");

    try {
      const res = await fetch("/api/gamedata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          points,
          mode: gameConfig.mode,
          region: gameConfig.region,
          difficulty: gameConfig.difficulty,
          username: savedName,
          time,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setSaveState("saved");
    } catch (err) {
      console.error("Failed to save game:", err);
      setSaveState("error"); // Keep the form so the player can try again
    }
  }

// --------------------------------------------------------------------------------------------------------------------
//        RENDER
// --------------------------------------------------------------------------------------------------------------------
  // Fill colour of a country: the revealed answer is blue, the last guess green or red
  function fillFor(name) {
    if (revealAnswer === name) return COLORS.reveal;
    if (lastGuess?.name === name) return lastGuess.isCorrect ? COLORS.correct : COLORS.wrong;
    return null;
  }

  return (
    <div className="game">
      <GameHud
        points={points}
        time={time}
        score={score}
        targetCountries={targetCountries}
        currentIndex={currentIndex}
        currentTarget={currentTarget}
        clickedCountry={clickedCountry}
        lastGuess={lastGuess}
        attempt={attempt}
        mode={gameConfig.mode}
      />

      <div className="map">
        <ComposableMap projectionConfig={{ scale: 150 }} style={{ width: "100%", height: "100%" }}>
          <ZoomableGroup center={position.coordinates} zoom={position.zoom} onMoveEnd={setPosition}>
            <Geographies geography={geoData}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const name = geo.properties.name;
                  const fill = fillFor(name);
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onClick={() => handleClickCountry(name)}
                      style={{
                        default: { fill: fill ?? COLORS.country, outline: "none" },
                        hover: { fill: fill ?? COLORS.hover, outline: "none" },
                        pressed: { fill: COLORS.wrong, outline: "none" },
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>

        <ZoomControls onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} />

        {gameOver && (
          <div className="game-over" role="dialog" aria-labelledby="game-over-title">
            <div className="game-over-card">
              <p id="game-over-title" className="hud-label">Game over</p>
              <p className="final-points">{points} <small>pts</small></p>
              <p className="final-detail">{score}/{targetCountries.length} correct · {time}s</p>

              {saveState === "saved" ? (
                <p className="save-done">Saved as {savedName}</p>
              ) : (
                <form className="save-form" onSubmit={saveScore}>
                  <TextField label="Your name" placeholder="Anonymous" size="small" fullWidth autoFocus
                    value={playerName}
                    disabled={saveState === "saving"}
                    slotProps={{ htmlInput: { maxLength: 30 } }} // Same limit as the backend validation
                    onChange={(e) => setPlayerName(e.target.value)} />
                  <Button type="submit" variant="contained" fullWidth disabled={saveState === "saving"}>
                    Save score
                  </Button>
                  {saveState === "error" && <p className="save-error" role="alert">Couldn't save. Try again.</p>}
                </form>
              )}

              <div className="game-over-actions">
                <Button component={Link} to="/" variant={saveState === "saved" ? "contained" : "outlined"}>Play again</Button>
                <Button component={Link} to="/scores" variant="outlined">Scores</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Game;
