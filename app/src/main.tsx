import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/fonts.css';
import './styles/fig-tokens.css';
import './styles/colors.css';
import './styles/typography.css';
import './styles/layout.css';
import './styles/app.css';
import App from './App';

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
