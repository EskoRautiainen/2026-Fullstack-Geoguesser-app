import React, { useState, useEffect } from "react";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { GameHud } from "./GameHud";
import ZoomControls from "./ZoomControls";
import playSound from "../playSound";
import { Link } from "react-router-dom";
import "./Game.css";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";

const ROUNDS = { easy: 10, hard: 25 }; // Number of countries per game

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

// Fisher-Yates shuffle. Sorting with Math.random() does not give every order an equal chance.
function shuffle(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// --------------------------------------------------------------------------------------------------------------------
//        GAME STATE
// --------------------------------------------------------------------------------------------------------------------
function Game({ gameConfig }) { 
  const [geoData, setGeoData] = useState(null);                                 // load geodata from /public 
  const [clickedCountry, setClickedCountry] = useState(null);                   // match clicked country name w/ it's data object
  const [position, setPosition] = useState({ coordinates: [30, 30], zoom: 3 }); // set starting position and zoom level
  const [targetCountries, setTargetCountries] = useState([]);                   // random countries
  const [currentIndex, setCurrentIndex] = useState(0);                          // current country to guess
  const [score, setScore] = useState(0);                                        // number of correct guesses
  const [gameOver, setGameOver] = useState(false);                              // flag game as over
  const [attempt, setAttempt] = useState(3);                                    // guesses left this round
  const [points, setPoints] = useState(0);                                      // keep track of total points
  const [time, setTime] = useState(0);                                          // keep track of time spent playing
  const [lastGuess, setLastGuess] = useState(null);                             // keep track of last guess
  const [allCountries, setAllCountries] = useState([]);                         // store all countries with flags
  const [revealAnswer, setRevealAnswer] = useState(null);                       // country revealed after 3 wrong guesses
  const [playerName, setPlayerName] = useState("");                             // name typed on the game-over card
  const [saveState, setSaveState] = useState("idle");                           // idle | saving | saved | error
// --------------------------------------------------------------------------------------------------------------------
//        LOAD DATA AND SELECT TARGET COUNTRIES FOR THE GAME
// --------------------------------------------------------------------------------------------------------------------
useEffect(() => {
  loadGeoData()
    .then(setGeoData)
    .catch(err => console.error("Failed to load GeoJSON:", err));
}, []); // <-- [] Runs this effect only once.


useEffect(() => {
async function fetchCountries() {
  try {
    const response = await fetch(`/api/${gameConfig.region}`);
  if (!response.ok) throw new Error("Fetch failed")
    let countries = await response.json();


  // --------------------------------------------------------------------------------------------------------------------
  //        GENERATE COUNTRIES DATA-OBJECTS W/ FLAG IMAGES
  // --------------------------------------------------------------------------------------------------------------------
  countries = countries.map(country => ({
    ...country,
    flag: `/flags/${country.code}.png`
  }));

  setAllCountries(countries); // store all countries as data-objects, containing flag images.

  // Pick a random set of target countries: 10 on easy, 25 on hard
  setTargetCountries(shuffle(countries).slice(0, ROUNDS[gameConfig.difficulty] ?? ROUNDS.easy));
  } catch (err) {
      console.error(err);
    }
}


// --------------------------------------------------------------------------------------------------------------------
//        START GAME
// --------------------------------------------------------------------------------------------------------------------

fetchCountries();
}, [gameConfig]);                                    // gameConfig contains region, difficulty and mode settings.
const currentTarget = targetCountries[currentIndex]; // Define current target outside of nextRound, so it runs on mount.


// --------------------------------------------------------------------------------------------------------------------
//        DEFINE MAP ZOOM & MOVEMENT FUNCTIONS
// --------------------------------------------------------------------------------------------------------------------
const handleZoomIn = () => {
  if (position.zoom >= 4) return; // Maximum zoom.
    setPosition((pos) => ({ ...pos, zoom: pos.zoom * 1.5 }));
};

const handleZoomOut = () => {
  if (position.zoom <= 1) return; // Minimum zoom
    setPosition((pos) => ({ ...pos, zoom: pos.zoom / 1.5 }));
};

// Handle position
const handleMove = (newPosition) => {
  setPosition(newPosition);
};

// --------------------------------------------------------------------------------------------------------------------
//        NEXT ROUND FUNCTION
// --------------------------------------------------------------------------------------------------------------------
// newPoints: the points total including the round that just ended
function nextRound(newPoints) {
  if (currentIndex + 1 < targetCountries.length) {
    setPoints(newPoints);
    setCurrentIndex(currentIndex + 1);
    setAttempt(3);
    return;
  }

  // Last round: scale the points by the time taken. The player saves the result from the game-over card.
  const finalPoints = Number(
    (newPoints * 5 / (time / 50 + 1)).toFixed(1)
  );
  setPoints(finalPoints);
  setGameOver(true);
}

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
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        points,
        mode: gameConfig.mode,
        region: gameConfig.region,
        difficulty: gameConfig.difficulty,
        username: savedName,
        time
      })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    setSaveState("saved");
  } catch (err) {
    console.error("Failed to save game:", err);
    setSaveState("error"); // Keep the form so the player can try again
  }
}

// --------------------------------------------------------------------------------------------------------------------
//        HANDLE CLICK ON MAP COMPONENT
// --------------------------------------------------------------------------------------------------------------------
const handleClickCountry = (name) => {
  // Ignore clicks after the game ends, before the targets load, and while the answer is revealed (0 attempts)
  if (gameOver || !currentTarget || attempt === 0)
    return;

  const newAttempt = attempt - 1;       // Reduce guess attempts by 1
  setAttempt(newAttempt);

  // handleClickCountry gets a country name as string.
  // Match string "Germany" with data-object, where "name:Germany".
  // Set data-object as clickedCountry, so we can use its flag.
  setClickedCountry(allCountries.find(c => c.name === name));

  const isCorrect = name === currentTarget.name;        // Check, if the guess was correct
  setLastGuess({name, isCorrect})                       // Remember previous guess
  playSound(isCorrect);                                 // Play audio feedback

// --------------------------------------------------------------------------------------------------------------------
//        GUESS RESULTS
// --------------------------------------------------------------------------------------------------------------------
  if (isCorrect) {
    // Correct: 180 / 120 / 60 points on the first / second / third guess
    setScore(prev => prev + 1);
    nextRound(points + (newAttempt + 1) * 60);

  } else if (newAttempt === 0) {
    // Out of guesses: flash the correct country blue for 2.5 seconds, then move on with no points
    setRevealAnswer(currentTarget.name);
    setTimeout(() => {
      setRevealAnswer(null); // reset highlight
      nextRound(points);
    }, 2500);
  }
}


// --------------------------------------------------------------------------------------------------------------------
//        TIMER
// --------------------------------------------------------------------------------------------------------------------
const isLoaded = geoData !== null && targetCountries.length > 0;

useEffect(() => {
  if (!isLoaded || gameOver) return;          // Timer runs only while the game is playable

    const interval = setInterval(() => {
      setTime(prev => prev +1);               // Update every second
    }, 1000);
      return () => clearInterval(interval);   // Cleanup function to prevent react running several intervals at the same time
}, [isLoaded, gameOver]);                     // Runs when loading finishes or gameOver state changes


// --------------------------------------------------------------------------------------------------------------------
//        REACT RENDER
// --------------------------------------------------------------------------------------------------------------------
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



{/* --------------------------------------------------------------------------------------------------------------------}
/*        MAP COMPONENT
/*  ------------------------------------------------------------------------------------------------------------------*/}
<div className="map">
<ComposableMap
  projectionConfig={{ scale: 150 }}             // Define map zoom
  style={{ width: "100%", height: "100%" }}     // Fill the space under the header
>

<ZoomableGroup
  center={position.coordinates}
  zoom={position.zoom}
  onMoveEnd={handleMove}                        // triggers when user finishes dragging/zooming the map
>

{/* Load all countries from the GeoJSOn data served from /public */}
<Geographies geography={geoData}>
  {({ geographies }) =>
    geographies.map((geo) => (
      // Loop over each geo to render it individually with map()
      <Geography
        key={geo.rsmKey}
        geography={geo}

// --------------------------------------------------------------------------------------------------------------------}
//        STYLES
//  -------------------------------------------------------------------------------------------------------------------}

        // Trigger handleClickCountry on country click
        onClick={() => handleClickCountry(geo.properties.name)}
          style={{
            default: {
            fill:
              revealAnswer === geo.properties.name
              ? "#0000FF" // flash blue for correct answer
                : lastGuess?.name === geo.properties.name // Use optional chaining to avoid errors w/ null or undefined
              ? lastGuess.isCorrect
              ? "#00FF00" // green
                : "#FF0000" // red
                : "#FFFFFF", // white
                outline: "none",
              },
                hover: {
                fill:
              lastGuess?.name === geo.properties.name 
              ? lastGuess.isCorrect
              ? "#00FF00"
                : "#FF0000"
                : "#FFD700", // yellow. Hovering over a country that is not lastGuess appears yellow.
                outline: "none",
              },
                pressed: {
                fill: "#FF0000",
                outline: "none",
              },
            }}
          />
        ))
      }
    </Geographies>
    </ZoomableGroup>
    </ComposableMap>

      <ZoomControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
      />

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
)};

export default Game;