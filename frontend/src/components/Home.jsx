import { useNavigate } from "react-router-dom";
import { useState } from "react";

// MUI imports
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Button from "@mui/material/Button";

// One segmented control per setting: [state key, label, options]
const SETTINGS = [
  ["region", "Region", [["europe", "Europe"], ["africa", "Africa"], ["asia", "Asia"]]],
  ["difficulty", "Difficulty", [["easy", "Easy · 10"], ["hard", "Hard · 25"]]],
  ["mode", "Mode", [["nameflag", "Name + flag"], ["flag", "Flag only"]]],
];

function Home({ setGameConfig }) {
  const navigate = useNavigate();

  const [settings, setSettings] = useState({ region: "europe", difficulty: "easy", mode: "nameflag" });

  // Start game function. The player's name is asked on the game-over card.
  const startGame = (e) => {
    e.preventDefault();
    setGameConfig(settings);
    navigate("/play");
};

// --------------------------------------------------------------------------------------------------------------------
//        GAME CONFIGURATION SCREEN
// --------------------------------------------------------------------------------------------------------------------

return (
    <div className="home">
      <Paper component="form" onSubmit={startGame} variant="outlined" className="home-card">
        <Typography variant="h5" component="h1" fontWeight={700}>GeoGuesser</Typography>
        <Typography color="text.secondary" sx={{ mb: 1 }}>Find countries on the map.</Typography>

        {SETTINGS.map(([key, label, options]) => (
          <div key={key} className="home-setting">
            <Typography id={`${key}-label`} variant="caption" color="text.secondary">{label}</Typography>
            <ToggleButtonGroup
              exclusive fullWidth size="small" color="primary"
              aria-labelledby={`${key}-label`}
              value={settings[key]}
              // Clicking the selected option gives null: keep the current choice
              onChange={(_, value) => value && setSettings(s => ({ ...s, [key]: value }))}
            >
              {options.map(([value, text]) => (
                <ToggleButton key={value} value={value}>{text}</ToggleButton>
              ))}
            </ToggleButtonGroup>
          </div>
        ))}

        <Button type="submit" variant="contained" size="large" fullWidth autoFocus sx={{ mt: 3 }}>
          Start
        </Button>
      </Paper>
    </div>
  );
}

export default Home;
