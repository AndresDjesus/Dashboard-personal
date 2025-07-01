import { AppShell, Group, Title, Text, SimpleGrid } from '@mantine/core';
import { useState } from 'react';
import EstudioSection from './components/EstudioSection';
import EjercicioSection from './components/EjercicioSection';
import FinanzasSection from './components/FinanzasSection';
import PresupuestoSection from './components/PresupuestoSection';
import { cargarDatos } from './utils/localStorageUtils'; 
import { IconChartBar } from '@tabler/icons-react';
import MetasSection from './components/MetasSection';

function App() {
    // Inicializa el estado de datosFinanzas aquí en App.jsx
    // La clave es que el segundo argumento de cargarDatos sea el valor por defecto
    const [appDatosFinanzas, setAppDatosFinanzas] = useState(() =>
        cargarDatos('datosFinanzas', { ingresos: [0, 0, 0, 0, 0, 0, 0], gastos: [0, 0, 0, 0, 0, 0, 0] })
    );

    const handleUpdateFinanzas = (newFinancesData) => {
        setAppDatosFinanzas(newFinancesData);
    };

    return (
        <AppShell
            header={{ height: 60 }}
            padding="md"
        >
            <AppShell.Header>
                <Group h="100%" px="md" style={{ justifyContent: 'center' }}>
                    <IconChartBar size="2rem" style={{ color: 'white' }} />
                    <Title order={1} style={{ color: 'white' }}>Mi Dashboard Personal</Title>
                    <IconChartBar size="2rem" style={{ color: 'white' }} />
                </Group>
            </AppShell.Header>

            <AppShell.Main>
                <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg" mb="xl">
                    <EstudioSection />
                    <EjercicioSection />
                    {/* Pasa datosFinanzas y la función de actualización a FinanzasSection */}
                    <FinanzasSection datosFinanzas={appDatosFinanzas} onUpdateFinances={handleUpdateFinanzas} />
                    {/* Pasa datosFinanzas a PresupuestoSection */}
                    <PresupuestoSection datosFinanzas={appDatosFinanzas} />
                    <MetasSection />
                </SimpleGrid>

                <Text ta="center" size="sm" mt="md">
                    ¡Empieza a registrar tus datos!
                </Text>
            </AppShell.Main>

            <AppShell.Footer p="md" style={{ textAlign: 'center' }}>
                <Text size="sm">&copy; {new Date().getFullYear()} Mi Dashboard Personal</Text>
            </AppShell.Footer>
        </AppShell>
    );
}

export default App;