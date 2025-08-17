// src/components/LogrosSection.jsx
import React, { useState, useEffect } from 'react';
import { Paper, Title, Text, Textarea, Button, Group, rem, Center, Box, Transition, Stack } from '@mantine/core';
import { IconTrophy, IconStar, IconConfetti, IconAward, IconTrash } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';

import { cargarDatos, guardarDatos, getTodayFormattedDate } from '../utils/localStorageUtils';

function LogrosSection() {
    // Estado para guardar la lista de los últimos 5 logros
    const [logrosList, setLogrosList] = useState(() =>
        // Carga la lista de logros del almacenamiento local
        cargarDatos('logrosList', [])
    );

    // Estado para el texto temporal en el Textarea
    const [nuevoLogroTexto, setNuevoLogroTexto] = useState('');

    // Estado para controlar la animación de transición
    const [showTransition, setShowTransition] = useState(false);

    useEffect(() => {
        // Al cargar, activa la transición si ya hay logros guardados
        if (logrosList.length > 0) {
            setShowTransition(true);
        }
    }, []);

    // Manejador para guardar el logro
    const handleGuardarLogro = () => {
        if (nuevoLogroTexto.trim() === '') {
            notifications.show({
                title: 'Error de Entrada',
                message: 'Por favor, describe tu logro antes de guardarlo.',
                color: 'red',
            });
            return;
        }
        
        const logroData = {
            id: Date.now(), // Usar un ID único para cada logro
            date: getTodayFormattedDate(),
            text: nuevoLogroTexto.trim(),
        };

        // Prepend el nuevo logro a la lista y mantener solo los últimos 5
        const newLogrosList = [logroData, ...logrosList].slice(0, 5);
        setLogrosList(newLogrosList);
        guardarDatos('logrosList', newLogrosList);
        
        // Limpiar el input del logro
        setNuevoLogroTexto('');
        
        // Reiniciar la animación para que se vea cada vez que se guarda un logro nuevo
        setShowTransition(false);
        setTimeout(() => setShowTransition(true), 50); // Pequeño retardo para reiniciar la transición

        notifications.show({
            title: '¡Logro Guardado!',
            message: 'Tu logro ha sido registrado con éxito. ¡Felicidades!',
            color: 'green',
            icon: <IconAward size={18} />,
        });
    };

    // Manejador para borrar un logro específico por su ID
    const handleBorrarLogro = (id) => {
        modals.openConfirmModal({
            title: 'Confirmar Eliminación de Logro',
            children: (
                <Text size="sm">
                    ¿Estás seguro de que quieres borrar este logro? Esta acción no se puede deshacer.
                </Text>
            ),
            labels: { confirm: 'Sí, borrar', cancel: 'No, cancelar' },
            confirmProps: { color: 'red' },
            onCancel: () => notifications.show({
                title: 'Eliminación Cancelada',
                message: 'El logro no fue eliminado.',
                color: 'gray',
            }),
            onConfirm: () => {
                const updatedList = logrosList.filter(logro => logro.id !== id);
                setLogrosList(updatedList);
                guardarDatos('logrosList', updatedList);
                // Si la lista queda vacía, oculta la transición
                if (updatedList.length === 0) {
                    setShowTransition(false);
                }
                notifications.show({
                    title: 'Logro Borrado',
                    message: 'El logro ha sido eliminado correctamente.',
                    color: 'orange',
                    icon: <IconTrash size={18} />,
                });
            },
        });
    };

    // Función auxiliar para formatear la fecha para la visualización
    const formatDisplayDate = (dateString) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString + 'T00:00:00');
            if (isNaN(date.getTime())) {
                return new Date(dateString).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
            }
            return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
        } catch (e) {
            console.error("Error al formatear fecha:", e);
            return dateString;
        }
    };

    return (
        <Paper shadow="xl" p="lg" withBorder radius="md">
            <Title order={2} ta="center" mb="md" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <IconTrophy size={28} />
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

            {logrosList.length > 0 ? (
                <Transition mounted={showTransition} transition="pop" duration={400} timingFunction="ease-out">
                    {(styles) => (
                        <Box style={{
                            ...styles,
                            border: `2px solid var(--mantine-color-green-6)`,
                            borderRadius: rem(8),
                            padding: rem(16),
                            marginTop: rem(20),
                            backgroundColor: 'var(--mantine-color-green-0)',
                            color: 'var(--mantine-color-green-9)'
                        }}>
                            <Center mb="xs">
                                <IconConfetti size={48} style={{ color: 'var(--mantine-color-green-7)' }} />
                                <IconStar size={48} style={{ color: 'var(--mantine-color-yellow-6)', margin: `0 ${rem(-15)}` }} />
                                <IconConfetti size={48} style={{ color: 'var(--mantine-color-green-7)' }} />
                            </Center>
                            <Title order={3} ta="center" c="green.8" mb="xs">
                                ¡Felicidades!
                            </Title>
                            <Text size="lg" ta="center" fw={600} mb="xs">
                                ¡Has registrado un nuevo logro!
                            </Text>
                            
                            <Title order={4} ta="center" mt="md" mb="xs" c="green.9">
                                Tus Logros Recientes
                            </Title>
                            <Stack spacing="xs">
                                {logrosList.map((logro) => (
                                    <Paper key={logro.id} p="xs" withBorder>
                                        <Group justify="space-between">
                                            <Text fw={700}>
                                                {formatDisplayDate(logro.date)}
                                            </Text>
                                            <Button
                                                variant="subtle"
                                                color="red"
                                                size="xs"
                                                onClick={() => handleBorrarLogro(logro.id)}
                                                leftSection={<IconTrash size={14} />}
                                            >
                                                Eliminar
                                            </Button>
                                        </Group>
                                        <Text size="sm">{logro.text}</Text>
                                    </Paper>
                                ))}
                            </Stack>
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