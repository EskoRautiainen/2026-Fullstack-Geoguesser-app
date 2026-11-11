// --------------------------------------------------------------------------------------------------------------------}
//        APP ROUTER & GLOBAL STATE
//  -------------------------------------------------------------------------------------------------------------------}

// Imports
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import { useState } from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from './theme';
import { DEFAULT_SETTINGS } from './game';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Game from './components/Game'
import Scores from './components/Scores'

function App() {

// Store game settings
const [gameConfig, setGameConfig] = useState(DEFAULT_SETTINGS);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div className='app'>
          <Navbar />
          <main className='page'>
            <Routes>
              <Route path="/" element={<Home setGameConfig={setGameConfig}/>} />
              <Route path="/play" element={<Game gameConfig={gameConfig}/>} />
              <Route path="/scores" element={<Scores />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ThemeProvider>
  );
}


export default App;
