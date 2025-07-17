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
        <div className="navbar-brand">
          <NavLink to="/" className="brand-link">
            <Crown className="brand-icon" />
            Chess vs Bot
          </NavLink>
        </div>
        <div className="navbar-menu">
          {navLinks.map((link) => (
            <NavLink 
              key={link.path}
              to={link.path}
              className="nav-link"
              end
            >
              <link.icon className="nav-icon" />
              <span className="nav-text">{link.text}</span>
            </NavLink>
          ))}
          <button onClick={toggleTheme} className="theme-toggle">
            {isDark ? <Sun className="theme-icon" /> : <Moon className="theme-icon" />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
