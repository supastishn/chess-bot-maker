import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import eruda from 'eruda'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './ErrorBoundary.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'

// Force console logging in production
if (import.meta.env.PROD) {
  window.console.log = (...args) => {
    const log = Function.prototype.bind.call(console.log, console);
    log.apply(console, args);
  };
}

if (import.meta.env.DEV) {
  eruda.init()
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ErrorBoundary>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </ErrorBoundary>
    </BrowserRouter>
  </StrictMode>,
)
