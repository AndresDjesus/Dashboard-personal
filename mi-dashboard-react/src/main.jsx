import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx'; // Asegúrate que la ruta sea correcta, .jsx es importante
import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css'; // ¡Esta línea es CRÍTICA para los estilos!

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <MantineProvider defaultColorScheme="dark">
            <App />
        </MantineProvider>
    </React.StrictMode>,
);