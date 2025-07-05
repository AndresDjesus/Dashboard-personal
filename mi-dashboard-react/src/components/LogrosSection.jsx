import React, { useState, useEffect } from 'react';
import { Paper,Title,Text, Textarea,  Button, Group,rem,Center, Box,Transition, } from '@mantine/core';
import { IconTrophy, IconStar, IconConfetti, IconAward } from '@tabler/icons-react'; // Íconos para celebrar

import { cargarDatos, guardarDatos } from '../utils/localStorageUtils';

function LogrosSection() {
    // Estado para el último logro guardado

    const [ultimoLogro, setUltimoLogro] = useState(() =>
        cargarDatos('ultimoLogro', null)
    );

    // Estado para el texto temporal en el Textarea
    const [nuevoLogroTexto, setNuevoLogroTexto] = useState('');

    // Estado para controlar la animación de transición
    const [showLogro, setShowLogro] = useState(false);

    useEffect(() => {
        // Cargar el logro al inicio y activar la transición si hay un logro
        if (ultimoLogro) {
            setShowLogro(true);
        }
    }, [ultimoLogro]); 

    // Manejador para guardar el logro
    const handleGuardarLogro = () => {
        if (nuevoLogroTexto.trim() === '') {
            alert('Por favor, describe tu logro.');
            return;
        }
        const logroData = {
            date: new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }),
            text: nuevoLogroTexto.trim(),
        };
        setUltimoLogro(logroData);
        guardarDatos('ultimoLogro', logroData);
        setNuevoLogroTexto(''); 
        setShowLogro(false); 
        setTimeout(() => setShowLogro(true), 50); 
    };

    // Manejador para borrar el logro
    const handleBorrarLogro = () => {
        if (window.confirm('¿Estás seguro de que quieres borrar tu último logro?')) {
            setUltimoLogro(null);
            guardarDatos('ultimoLogro', null);
            setShowLogro(false);
        }
    };

    return (
        <Paper shadow="xl" p="lg" withBorder radius="md"> 
            <Title order={2} ta="center" mb="md" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <IconTrophy size={28} /> {/* Icono de trofeo */}
                Celebra Tus Logros
            </Title>

            <Textarea
                label="¿Cuál fue tu logro más reciente?"
                placeholder="Ej. Completé mi informe a tiempo, Aprendí una nueva receta, Salí a correr 5km!"
                minRows={3}
                value={nuevoLogroTexto}
                onChange={(event) => setNuevoLogroTexto(event.currentTarget.value)}
                mb="md"
                autosize 
            />

            <Group position="right" mb="lg">
                <Button onClick={handleGuardarLogro} variant="filled" color="grape" leftSection={<IconAward size={rem(18)} />}>
                    Guardar Logro
                </Button>
            </Group>

            {ultimoLogro ? (
                <Transition mounted={showLogro} transition="scale-y" duration={300} timingFunction="ease-out">
                    {(styles) => (
                        <Box style={{ ...styles, border: `2px solid var(--mantine-color-green-6)`, borderRadius: rem(8), padding: rem(16), marginTop: rem(20), backgroundColor: 'var(--mantine-color-green-0)', color: 'var(--mantine-color-green-9)' }}>
                            <Center mb="xs">
                                <IconConfetti size={48} style={{ color: 'var(--mantine-color-green-7)' }} /> {/* Icono de confeti para celebrar */}
                                <IconStar size={48} style={{ color: 'var(--mantine-color-yellow-6)', marginLeft: rem(-15), marginRight: rem(-15) }} /> {/* Estrella superpuesta */}
                                <IconConfetti size={48} style={{ color: 'var(--mantine-color-green-7)' }} />
                            </Center>
                            <Title order={3} ta="center" c="green.8" mb="xs">
                                ¡Felicitaciones!
                            </Title>
                            <Text size="lg" ta="center" fw={600} mb="xs">
                                "{ultimoLogro.text}"
                            </Text>
                            <Text size="sm" ta="center" c="dimmed">
                                Registrado el: {ultimoLogro.date}
                            </Text>
                            <Center mt="md">
                                <Button variant="outline" color="red" size="xs" onClick={handleBorrarLogro}>
                                    Borrar Logro
                                </Button>
                            </Center>
                        </Box>
                    )}
                </Transition>
            ) : (
                <Text ta="center" c="dimmed" mt="xl">
                    ¿Cuál será tu próximo logro? ¡Regístralo aquí!
                </Text>
            )}
        </Paper>
    );
}

export default LogrosSection;