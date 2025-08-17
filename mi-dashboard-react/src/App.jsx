import { useState, useEffect, lazy, Suspense } from 'react';
import { AppShell, Burger, Group, Container, Text, NavLink, Paper, Title, Loader, Center } from '@mantine/core'; // Añadí Center y Loader
import { useDisclosure } from '@mantine/hooks';
import { MantineProvider } from '@mantine/core';

// Importa los estilos de Mantine
import '@mantine/core/styles.css'; 

// Importa los componentes necesarios para Notificaciones y Modales
import { Notifications } from '@mantine/notifications';
import { ModalsProvider, modals } from '@mantine/modals';

// Importa las funciones mejoradas de localStorageUtils
import { clearAllData, exportAllData, importAllData, cargarDatos, guardarDatos } from './utils/localStorageUtils'; 

// Importa los componentes de las secciones
const FinanzasSection = lazy(() => import('./components/FinanzasSection'));
const PresupuestoSection = lazy(() => import('./components/PresupuestoSection'));
const MetasSection = lazy(() => import('./components/MetasSection'));
const HabitosSection = lazy(() => import('./components/HabitosSection'));
const LogrosSection = lazy(() => import('./components/LogrosSection'));
const EstadoAnimoSection = lazy(() => import('./components/EstadoAnimoSection'));
const PerfilSection = lazy(() => import('./components/PerfilSection'));
const EjercicioSection = lazy(() => import('./components/EjercicioSection'));
const EstudioSection = lazy(() => import('./components/EstudioSection'));
const CitasMotivacionSection = lazy(() => import('./components/CitasMotivacionSection')); 
const TareasPendientesSection = lazy(() => import('./components/TareasPendientesSection'));

// Importa iconos de Tabler
import { 
    IconUser, 
    IconWallet, 
    IconTarget, 
    IconChecklist, 
    IconMoodHappy, 
    IconAward,
    IconBook2,
    IconWeight,
    IconDownload, 
    IconUpload, 
    IconTrash 
} from '@tabler/icons-react';

// Función auxiliar para generar la URL de Dicebear
const generateDicebearUrl = (name) => {
    return `https://api.dicebear.com/8.x/lorelei/svg?seed=${name || 'default'}`;
};

function App() {
    const [opened, { toggle }] = useDisclosure();
    const [activeSection, setActiveSection] = useState('perfil'); 

    // GESTIÓN DE ESTADO DEL USUARIO AHORA EN APP.JSX
    const [userName, setUserName] = useState(() => cargarDatos('userName', 'Tu Nombre'));
    const initialSavedAvatarUrl = cargarDatos('avatarUrl', '');
    const [avatarUrl, setAvatarUrl] = useState(() => {
        if (initialSavedAvatarUrl) {
            return initialSavedAvatarUrl;
        } else {
            return generateDicebearUrl(userName);
        }
    });

    useEffect(() => {
        guardarDatos('userName', userName);
    }, [userName]);

    useEffect(() => {
        const urlToSave = avatarUrl.startsWith('https://api.dicebear.com/') ? '' : avatarUrl;
        guardarDatos('avatarUrl', urlToSave);
    }, [avatarUrl]);

    // Usamos un objeto para mapear IDs a componentes perezosos
    const sections = {
        perfil: <PerfilSection userName={userName} setUserName={setUserName} avatarUrl={avatarUrl} setAvatarUrl={setAvatarUrl} generateDicebearUrl={generateDicebearUrl} />, 
        estadoAnimo: <EstadoAnimoSection />,
        finanzas: <FinanzasSection />,
        presupuesto: <PresupuestoSection />,
        metas: <MetasSection />, 
        habitos: <HabitosSection />,
        logros: <LogrosSection />,
        estudio: <EstudioSection />,
        entrenamiento: <EjercicioSection />,
        tareasPendientes: <TareasPendientesSection />,
    };

    const navLinks = [
        { id: 'perfil', label: 'Mi Perfil', icon: <IconUser size={18} /> }, 
        { id: 'estadoAnimo', label: 'Estado de Ánimo', icon: <IconMoodHappy size={18} /> },
        { id: 'finanzas', label: 'Finanzas', icon: <IconWallet size={18} /> },
        { id: 'presupuesto', label: 'Presupuesto', icon: <IconTarget size={18} /> },
        { id: 'metas', label: 'Mis Metas', icon: <IconTarget size={18} /> }, 
        { id: 'habitos', label: 'Mis Hábitos', icon: <IconChecklist size={18} /> },
        { id: 'logros', label: 'Mis Logros', icon: <IconAward size={18} /> },
        { id: 'estudio', label: 'Horas de Estudio', icon: <IconBook2 size={18} /> },
        { id: 'entrenamiento', label: 'Horas de Entrenamiento', icon: <IconWeight size={18} /> },
        { id: 'tareasPendientes', label: 'Tareas Pendientes', icon: <IconChecklist size={18} /> },
    ];

    const renderActiveSection = () => {
        return sections[activeSection] || <Text>Sección no encontrada.</Text>;
    };

    const handleClearData = () => {
        modals.openConfirmModal({
            title: 'Confirmar Eliminación de Datos',
            children: (
                <Text size="sm">
                    ¿Estás **absolutamente seguro** de que quieres eliminar TODOS tus datos del dashboard?
                    Esta acción no se puede deshacer.
                </Text>
            ),
            labels: { confirm: 'Sí, eliminar todo', cancel: 'No, cancelar' },
            confirmProps: { color: 'red' }, 
            onCancel: () => console.log('Eliminación cancelada'),
            onConfirm: () => clearAllData(), 
        });
    };

    const handleImportData = (event) => {
        const file = event.target.files[0];
        if (file) {
            importAllData(file); 
            event.target.value = null; 
        }
    };

    return (
        <MantineProvider defaultColorScheme="dark">
            <Notifications /> 
            <ModalsProvider> 
                <AppShell
                    header={{ height: 60 }}
                    navbar={{ width: 300, breakpoint: 'sm', collapsed: { mobile: !opened } }}
                    padding="md"
                >
                    <AppShell.Header>
                        <Group h="100%" px="md">
                            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
                            <Text fw={700} fz="xl" variant="gradient" gradient={{ from: 'indigo', to: 'cyan', deg: 45 }}>
                                Mi Dashboard Personal
                            </Text>
                        </Group>
                    </AppShell.Header>

                    <AppShell.Navbar p="md">
                        <Text size="xl" fw={700} c="dimmed" mb="md">Menú</Text>
                        {navLinks.map((section) => (
                            <NavLink
                                key={section.id}
                                label={section.label}
                                leftSection={section.icon}
                                active={activeSection === section.id}
                                onClick={() => {
                                    setActiveSection(section.id);
                                    toggle(); 
                                }}
                                mb={5}
                            />
                        ))}

                        <Text size="xl" fw={700} c="dimmed" mt="lg" mb="md">Herramientas</Text>
                        <NavLink
                            label="Exportar Todos los Datos"
                            leftSection={<IconDownload size={18} />}
                            onClick={exportAllData} 
                            mb={5}
                        />
                        <NavLink
                            label="Importar Datos"
                            leftSection={<IconUpload size={18} />}
                            onClick={() => document.getElementById('importFileInput').click()}
                            mb={5}
                        />
                        <input
                            type="file"
                            id="importFileInput" 
                            style={{ display: 'none' }} 
                            accept=".json" 
                            onChange={handleImportData}
                        />
                        <NavLink
                            label="Borrar Todos los Datos"
                            leftSection={<IconTrash size={18} />}
                            onClick={handleClearData} 
                            color="red" 
                        />
                    </AppShell.Navbar>

                    <AppShell.Main>
                        <Container size="xl">
                            {activeSection === 'perfil' && (
                                <Paper shadow="sm" p="lg" withBorder radius="md" mb="lg">
                                    <Title order={2} mb="sm">¡Hola, {userName}!</Title>
                                    <Text size="lg" mb="md" c="dimmed">
                                        Bienvenido de nuevo a tu espacio personal. ¡Vamos a hacer de hoy un gran día!
                                    </Text>
                                    {/* Ahora usamos Suspense para cargar las citas */}
                                    <Suspense fallback={null}> 
                                        <CitasMotivacionSection /> 
                                    </Suspense>
                                </Paper>
                            )}
                            
                            {/* Este Suspense envuelve todas las demás secciones */}
                            <Suspense fallback={<Center style={{ height: '70vh' }}><Loader size="xl" /></Center>}>
                                {renderActiveSection()} 
                            </Suspense>
                            
                        </Container>
                    </AppShell.Main>

                    <AppShell.Footer p="md" style={{ textAlign: 'center' }}>
                        <Text size="sm" c="dimmed">© 2025 Mi Dashboard Personal</Text>
                    </AppShell.Footer>
                </AppShell>
            </ModalsProvider>
        </MantineProvider>
    );
}

export default App;