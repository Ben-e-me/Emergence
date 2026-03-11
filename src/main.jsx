/**
 * @file main.jsx
 * @description React entry point for the Emergence experience, mounting the root App component into the DOM.
 * @architecture
 * - Imports global styles and design tokens before rendering any UI.
 * - Keeps this file focused on bootstrapping React; all experience logic lives in feature modules.
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './components/App/App.jsx';
import './styles/global.css';

// The root render is intentionally minimal so that all experiential logic is encapsulated in App.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

