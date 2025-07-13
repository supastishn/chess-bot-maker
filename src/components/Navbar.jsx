import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTheme } from '../context/useTheme';
import { Crown, Gamepad2, Zap, FileText, Wrench, Sun, Moon } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <NavLink to="/" className="brand-link">
            <Crown className="brand-icon" />
            Chess vs Bot
          </NavLink>
        </div>
        <div className="navbar-menu">
          <NavLink to="/" className="nav-link" end>
            <Gamepad2 className="nav-icon" />
            <span className="nav-text">Play</span>
          </NavLink>
          <NavLink to="/create-bot" className="nav-link">
            <Zap className="nav-icon" />
            <span className="nav-text">Create Bot</span>
          </NavLink>
          <NavLink to="/docs" className="nav-link">
            <FileText className="nav-icon" />
            <span className="nav-text">Docs</span>
          </NavLink>
          <NavLink to="/visual-bot-builder" className="nav-link">
            <Wrench className="nav-icon" />
            <span className="nav-text">Visual Builder</span>
          </NavLink>
          <button
            onClick={toggleTheme}
            className="theme-toggle"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="theme-icon" /> : <Moon className="theme-icon" />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
