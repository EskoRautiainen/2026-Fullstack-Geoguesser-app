// --------------------------------------------------------------------------------------------------------------------}
//        APP ROUTER & GLOBAL STATE
//  -------------------------------------------------------------------------------------------------------------------}

// Imports
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import { useState } from "react";
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
    <Router>
      <Navbar />
      <div className='app'>
        <Routes>
          <Route path="/" element={<Home setGameConfig={setGameConfig}/>} />
          <Route path="/play" element={<Map gameConfig={gameConfig}/>} />
          <Route path="/scores" element={<Scores />} />
        </Routes>
      </div>
    </Router>
  );
}


export default App;