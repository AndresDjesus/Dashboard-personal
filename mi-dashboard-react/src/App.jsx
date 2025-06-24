// src/App.jsx
import { AppShell, Header, Title, Group, Text } from '@mantine/core'; // Importa componentes de Mantine
import { useEffect } from 'react'; // Necesario para efectos secundarios, como cargar datos

// Esto es un placeholder por ahora, lo usaremos después
// import { cargarDatos, guardarDatos } from './utils/localStorageUtils';

function App() {
    // Aquí irá la lógica principal de tu dashboard
    // Por ahora, solo una estructura simple

    return (
        <AppShell
            header={{ height: 60 }}
            padding="md"
        >
            <AppShell.Header>
                <Group h="100%" px="md" position="center">
                    <Title order={1} style={{ color: 'white' }}>Mi Dashboard Personal</Title>
                </Group>
            </AppShell.Header>

            <AppShell.Main>
                {/* Aquí es donde se renderizarán tus diferentes secciones del dashboard */}
                <Text ta="center" size="xl">¡Bienvenido a tu nuevo dashboard!</Text>
                <Text ta="center" size="md" mt="xs">Estamos construyendo esto con React y Mantine.</Text>
                {/* Agrega más componentes aquí en los próximos pasos */}
            </AppShell.Main>

            <AppShell.Footer p="md" style={{ textAlign: 'center' }}>
                <Text size="sm">&copy; {new Date().getFullYear()} Mi Dashboard Personal</Text>
            </AppShell.Footer>
        </AppShell>
    );
}

export default App;