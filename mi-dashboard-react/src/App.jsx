// src/App.jsx
import { useState } from 'react';
import { AppShell, Burger, Group, Skeleton, Container, Text, NavLink } from '@mantine/core'; // Agrega NavLink
import { useDisclosure } from '@mantine/hooks';
import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';

// Importa tus componentes de sección
import FinanzasSection from './components/FinanzasSection';
import PresupuestoSection from './components/PresupuestoSection';
import MetasSection from './components/MetasSection';
import HabitosSection from './components/HabitosSection';
import LogrosSection from './components/LogrosSection';
import EstadoAnimoSection from './components/EstadoAnimoSection';
import PerfilSection from './components/PerfilSection'; 
import EjercicioSection from './components/EjercicioSection';
import EstudioSection from './components/EstudioSection';

// Importa iconos de Tabler
import { 
  IconHome, 
  IconUser, 
  IconWallet, 
  IconTarget, 
  IconChecklist, 
  IconMoodHappy, 
  IconAward,
  IconBook2,
  IconWeight,
  IconChartBar // Para el resumen, si lo añadimos después
} from '@tabler/icons-react';

function App() {
  const [opened, { toggle }] = useDisclosure();
  // Nuevo estado para controlar la sección activa
  const [activeSection, setActiveSection] = useState('perfil'); // 'perfil' como sección inicial

  // Mapeo de secciones a componentes y sus iconos
  const sections = [
    { id: 'perfil', label: 'Mi Perfil', component: <PerfilSection />, icon: <IconUser size={18} /> },
    { id: 'estadoAnimo', label: 'Estado de Ánimo', component: <EstadoAnimoSection />, icon: <IconMoodHappy size={18} /> },
    { id: 'finanzas', label: 'Finanzas', component: <FinanzasSection />, icon: <IconWallet size={18} /> },
    { id: 'presupuesto', label: 'Presupuesto', component: <PresupuestoSection />, icon: <IconTarget size={18} /> },
    { id: 'metas', label: 'Mis Metas', component: <MetasSection />, icon: <IconTarget size={18} /> }, // Puedes cambiar el icono si quieres
    { id: 'habitos', label: 'Mis Hábitos', component: <HabitosSection />, icon: <IconChecklist size={18} /> },
    { id: 'logros', label: 'Mis Logros', component: <LogrosSection />, icon: <IconAward size={18} /> },
     { id: 'estudio', label: 'Horas de Estudio', component: <EstudioSection />, icon: <IconBook2 size={18} /> },
    { id: 'entrenamiento', label: 'Horas de Entrenamiento', component: <EjercicioSection />, icon: <IconWeight size={18} /> },
    // { id: 'resumen', label: 'Resumen', component: <ResumenSection />, icon: <IconChartBar size={18} /> }, // Si añadimos una sección de resumen
  ];

  // Función para renderizar la sección activa
  const renderActiveSection = () => {
    const section = sections.find(s => s.id === activeSection);
    return section ? section.component : <Text>Sección no encontrada.</Text>;
  };

  return (
    <MantineProvider defaultColorScheme="dark">
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
          {sections.map((section) => (
            <NavLink
              key={section.id}
              label={section.label}
              leftSection={section.icon}
              active={activeSection === section.id}
              onClick={() => {
                setActiveSection(section.id);
                toggle(); // Cierra el menú en móviles después de la selección
              }}
              mb={5} // Margen inferior para separar los enlaces
            />
          ))}
        </AppShell.Navbar>

        <AppShell.Main>
          <Container size="xl">
            {renderActiveSection()} {/* Renderiza solo la sección activa */}
          </Container>
        </AppShell.Main>

        <AppShell.Footer p="md" style={{ textAlign: 'center' }}>
          <Text size="sm" c="dimmed">© 2025 Mi Dashboard Personal</Text>
        </AppShell.Footer>
      </AppShell>
    </MantineProvider>
  );
}

export default App;