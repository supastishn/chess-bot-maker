import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import eruda from 'eruda'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './ErrorBoundary.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'

let initStart;

// Initialize Eruda only in development mode
if (import.meta.env.DEV) {
  eruda.init();
  initStart = performance.now();
}

// Log when development tools are initialized
if (import.meta.env.DEV) {
  requestAnimationFrame(() => {
    const initTime = performance.now() - initStart;
    console.log(`🚀 Development tools initialized in ${initTime.toFixed(1)}ms`);
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename="/chess-bot-maker">
      <ErrorBoundary>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </ErrorBoundary>
    </BrowserRouter>
  </StrictMode>
)
