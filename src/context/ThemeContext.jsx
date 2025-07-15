import React, { useState, useEffect } from 'react';
export const ThemeContext = React.createContext(null);

export const ThemeProvider = ({ children }) => {
  const [darkModeEnabled, setDarkModeEnabled] = useState(() => {
    const savedPreference = localStorage.getItem('theme');
    if (savedPreference) return savedPreference === 'true' || savedPreference === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const themeValue = darkModeEnabled ? 'dark' : 'light';
    localStorage.setItem('theme', themeValue);
    document.documentElement.setAttribute('data-theme', themeValue);
  }, [darkModeEnabled]);

  const toggleColorScheme = () => setDarkModeEnabled(prev => !prev);

  return (
    <ThemeContext.Provider value={{ 
      isDark: darkModeEnabled, 
      toggleTheme: toggleColorScheme 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};
