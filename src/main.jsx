import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import eruda from 'eruda'
import './index.css'
import App from './App.jsx'

if (import.meta.env.DEV) {
  eruda.init()
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
