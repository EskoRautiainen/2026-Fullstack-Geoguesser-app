import { useNavigate } from "react-router-dom";
import { useState } from "react";

// MUI imports
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import theme from "./Theme";
import TextField from "@mui/material/TextField";
import { ThemeProvider } from "@mui/material/styles";

function Home({ setGameConfig }) {
  const navigate = useNavigate();

  const [region, setRegion] = useState("europe");
  const [difficulty, setDifficulty] = useState("easy");
  const [mode, setMode] = useState("nameflag");
  const [username, setUsername] = useState("");

  // Start game function
  const startGame = () => {
    const name = username.trim();
    if (!name) return; // Don't start game if username is empty

    setGameConfig({region, difficulty, mode, username: name});
    navigate("/play");
};

// --------------------------------------------------------------------------------------------------------------------
//        GAME CONFIGURATION SCREEN
// --------------------------------------------------------------------------------------------------------------------

return (
    <ThemeProvider theme={theme}>
    <Container>
      <Box sx={{ bgcolor: "gray", mt: 2}}>
      <Typography variant="h4" sx={{ py: 4}}>
        GeoGuesser
      </Typography>

      {/* Region */}
      <FormControl component="fieldset">
        <FormLabel
        sx={{color: "black"}}
        > Region </FormLabel>
          <RadioGroup
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            >
            
            <FormControlLabel value="europe" control={<Radio />} label="Europe" />
            <FormControlLabel value="africa" control={<Radio />} label="Africa" />
            <FormControlLabel value="asia" control={<Radio />} label="Asia" />
          </RadioGroup>
      </FormControl>

      {/* Difficulty */}
      <FormControl component="fieldset">
        <FormLabel
        sx={{color: "black"}}
        > Difficulty </FormLabel>
          <RadioGroup
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            >
            
            <FormControlLabel value="easy" control={<Radio />} label="Easy" />
            <FormControlLabel value="hard" control={<Radio />} label="Hard" />
          </RadioGroup>
      </FormControl>

      {/* Mode */}
      <FormControl component="fieldset">
        <FormLabel
        sx={{color: "black", }}
        > Mode </FormLabel>
          <RadioGroup
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            >
            
            <FormControlLabel value="nameflag" control={<Radio />} label="Name and flag" />
            <FormControlLabel value="flag" control={<Radio />} label="Flag only" />
          </RadioGroup>
      </FormControl>
      </Box>
      
      {/* Username */}
      <Box sx={{ bgcolor: "gray", p:2 }}>
        <TextField id="filled-basic" label="Enter your name" variant="outlined" required
        value = {username}
        slotProps={{ htmlInput: { maxLength: 30 } }} // Same limit as the backend validation
        onChange={(e) => setUsername(e.target.value)} />
      </Box>

      {/* Start button */}
      <Box sx={{ bgcolor: "gray", p:2 }}>
        <Button variant="contained" onClick={startGame} disabled={!username.trim()} sx={{ bgcolor: "#ffff00", color: "black"}}>
          Start
        </Button>
      </Box>
    </Container>
    </ThemeProvider>
  );
}

export default Home;