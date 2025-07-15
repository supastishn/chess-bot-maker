import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Puzzle, Library, Zap, Wrench } from 'lucide-react';

const DocLayout = () => {
  const navItems = [
    { path: 'introduction', icon: Puzzle, label: 'Introduction' },
    { path: 'api', icon: Library, label: 'API Reference' },
    { path: 'examples', icon: Zap, label: 'Examples' },
    { path: 'blockly', icon: Wrench, label: 'Blockly Guide' }
  ];

  return (
    <div className="page-container">
      <div className="docs-layout">
        <aside className="docs-sidebar glass-card">
          <nav className="docs-nav">
            {navItems.map((item) => (
              <NavLink 
                key={item.path}
                to={item.path}
                className={({isActive}) => isActive ? 'active' : ''}
              >
                <item.icon size={18} /> 
                {item.label}
              </NavLink>
            ))}
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
