import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import './Navbar.css';

const Navbar = () => {
  const { isDark, toggleTheme } = useTheme();

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
          <NavLink to="/docs" className="nav-link">
            <span className="nav-icon">📝</span>
            Docs
          </NavLink>
          <button 
            onClick={toggleTheme}
            className="theme-toggle"
            aria-label="Toggle theme"
          >
            <span className="theme-icon">
              {isDark ? '☀️' : '🌙'}
            </span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
