import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx'; 
import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css'; 

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => console.log('Service Worker registrado:', registration))
      .catch(error => console.error('Fallo al registrar Service Worker:', error));
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <MantineProvider defaultColorScheme="dark">
            <App />
        </MantineProvider>
    </React.StrictMode>,
);