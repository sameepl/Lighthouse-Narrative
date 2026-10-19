import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './ui/theme.css';
import { App } from './ui/App';

try {
  const theme = localStorage.getItem('lighthouse-narrative-theme');
  if (theme) document.documentElement.dataset['theme'] = theme;
} catch {
  /* ignore */
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
