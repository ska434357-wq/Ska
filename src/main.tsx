import {createRoot} from 'react-dom/client';
import {registerSW} from 'virtual:pwa-register';
import App from './App.tsx';
import './index.css';

// Register PWA service worker for full offline support
registerSW({ immediate: true });

createRoot(document.getElementById('root')!).render(<App />);
