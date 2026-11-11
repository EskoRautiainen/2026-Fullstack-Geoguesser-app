// --------------------------------------------------------------------------------------------------------------------}
//        APP ROUTER & GLOBAL STATE
//  -------------------------------------------------------------------------------------------------------------------}

// Imports
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import { useState } from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from './components/Theme';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Map from './components/Map'
import Scores from './components/Scores'

function App() {

// Store game settings
const [gameConfig, setGameConfig] = useState({
    region: "europe",
    difficulty: "easy",
    mode: "nameflag",
    username: "Anonymous",
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div className='app'>
          <Navbar />
          <main className='page'>
            <Routes>
              <Route path="/" element={<Home setGameConfig={setGameConfig}/>} />
              <Route path="/play" element={<Map gameConfig={gameConfig}/>} />
              <Route path="/scores" element={<Scores />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ThemeProvider>
  );
}


export default App;
