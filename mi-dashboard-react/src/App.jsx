import { AppShell, Group, Title, Text, SimpleGrid } from '@mantine/core';
import EstudioSection from './components/EstudioSection'; 
import EjercicioSection from './components/EjercicioSection';
import FinanzasSection from './components/FinanzasSection';

function App() {
    return (
        <AppShell
            header={{ height: 60 }}
            padding="md"
            // AppShell requiere un 'footer' explícito si lo usas, aunque esté vacío.
            // Si AppShell no te funciona, puedes intentar con un div simple por ahora.
        >
            <AppShell.Header>
                <Group h="100%" px="md" style={{ justifyContent: 'center' }}> {/* Usar justifyContent */}
                    <Title order={1} style={{ color: 'white' }}>Mi Dashboard Personal</Title>
                </Group>
            </AppShell.Header>

            <AppShell.Main>
                <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg" mb="xl">
                    <EstudioSection />
                    <EjercicioSection />
                    <FinanzasSection />
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