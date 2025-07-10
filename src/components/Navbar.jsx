import React from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <NavLink to="/" className="brand-link">
            <span className="brand-icon">♛</span>
            Chess vs Bot
          </NavLink>
        </div>
        <div className="navbar-menu">
          <NavLink to="/" className="nav-link" end>
            <span className="nav-icon">🎮</span>
            Play
          </NavLink>
          <NavLink to="/create-bot" className="nav-link">
            <span className="nav-icon">⚡</span>
            Create Bot
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
