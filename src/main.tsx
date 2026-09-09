import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Safely filter benign sandbox WebSocket HMR notifications
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const reasonStr = event.reason?.message || String(event.reason || '');
    if (
      reasonStr.toLowerCase().includes('websocket') ||
      reasonStr.toLowerCase().includes('vite')
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  });

  window.addEventListener('error', (event) => {
    const msg = event.message || String(event.error?.message || '');
    if (
      msg.toLowerCase().includes('websocket') ||
      msg.toLowerCase().includes('vite')
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

