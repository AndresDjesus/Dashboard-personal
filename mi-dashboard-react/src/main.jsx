// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { MantineProvider } from '@mantine/core'; // Importa MantineProvider
import '@mantine/core/styles.css'; // Importa los estilos base de Mantine

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <MantineProvider> {/* Envuelve tu App con MantineProvider */}
            <App />
        </MantineProvider>
    </React.StrictMode>,
);