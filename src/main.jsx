import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Handle dynamic import / chunk load failures caused by new deployments
if (typeof window !== 'undefined') {
  window.addEventListener('vite:preloadError', () => {
    window.location.reload();
  });
}

// Register service worker for PWA installability and notifications
if (typeof window !== 'undefined' && 'serviceWorker' in navigator && import.meta.env.MODE !== 'test') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}
