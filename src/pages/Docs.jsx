import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Puzzle, Library, Zap, Wrench } from 'lucide-react';

const DocLayout = () => {
  return (
    <div className="page-container">
      <div className="docs-layout">
        <aside className="docs-sidebar glass-card">
          <nav className="docs-nav">
            <NavLink to="introduction" className={({isActive}) => isActive ? 'active' : ''}>
              <Puzzle size={18} /> Introduction
            </NavLink>
            <NavLink to="api" className={({isActive}) => isActive ? 'active' : ''}>
              <Library size={18} /> API Reference
            </NavLink>
            <NavLink to="examples" className={({isActive}) => isActive ? 'active' : ''}>
              <Zap size={18} /> Examples
            </NavLink>
            <NavLink to="blockly" className={({isActive}) => isActive ? 'active' : ''}>
              <Wrench size={18} /> Blockly Guide
            </NavLink>
          </nav>
        </aside>
        <main className="docs-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DocLayout;
