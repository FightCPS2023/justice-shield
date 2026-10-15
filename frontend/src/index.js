import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import ErrorBoundary from './components/ui/ErrorBoundary';
import VictoryPublicPage from './components/VictoryPublicPage';

// Register service worker for PWA support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered:', registration.scope);
      })
      .catch((error) => {
        console.log('SW registration failed:', error);
      });
  });
}

const root = ReactDOM.createRoot(document.getElementById('root'));
const victoryMatch = window.location.pathname.match(/^\/victory\/([A-Za-z0-9_-]+)/);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      {victoryMatch ? <VictoryPublicPage token={victoryMatch[1]} /> : <App />}
    </ErrorBoundary>
  </React.StrictMode>
);

