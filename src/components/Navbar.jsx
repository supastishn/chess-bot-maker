import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTheme } from '../context/useTheme';
import { Crown, Gamepad2, Zap, FileText, Wrench, Sun, Moon, Trophy } from 'lucide-react';
import './Navbar.css';

const navLinks = [
  { path: "/", icon: Gamepad2, text: "Play" },
  { path: "/create-bot", icon: Zap, text: "Create Bot" },
  { path: "/docs", icon: FileText, text: "Docs" },
  { path: "/visual-bot-builder", icon: Wrench, text: "Visual Builder" },
  { path: "/tournament", icon: Trophy, text: "Tournament" }
];

const Navbar = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <NavLink to="/" className="brand-link" aria-label="Home">
          <Crown className="brand-icon" />
          Chess vs Bot
        </NavLink>
        <div className="navbar-menu">
          {navLinks.map(({ path, icon: Icon, text }) => (
            <NavLink key={path} to={path} className="nav-link">
              <Icon className="nav-icon" />
              <span>{text}</span>
            </NavLink>
          ))}
          <button onClick={toggleTheme} className="theme-toggle">
            {isDark ? <Sun /> : <Moon />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
