import React, { useState, useEffect } from 'react';
export const ThemeContext = React.createContext(null);

export const ThemeProvider = ({ children }) => {
  const [isDark, setDark] = useState(() =>
    localStorage.theme === 'dark' ||
    (localStorage.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme: () => setDark(!isDark) }}>
      {children}
    </ThemeContext.Provider>
  );
};
