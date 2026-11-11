// --------------------------------------------------------------------------------------------------------------------
//        NAVIGATION BAR
// --------------------------------------------------------------------------------------------------------------------
import { NavLink } from 'react-router-dom';

function Navbar() {
  return (
    <nav className='navbar'>
      <NavLink to="/" className='brand'>GeoGuesser</NavLink>
      {/* NavLink adds the "active" class to the current page's link */}
      <div className='nav-links'>
        <NavLink to="/" end>Home</NavLink>
        <NavLink to="/play">Play</NavLink>
        <NavLink to="/scores">Scores</NavLink>
      </div>
    </nav>
  );
}

export default Navbar
