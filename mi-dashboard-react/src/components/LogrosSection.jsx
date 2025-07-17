// src/components/LogrosSection.jsx
import React, { useState, useEffect } from 'react';
import { Paper, Title, Text, Textarea, Button, Group, rem, Center, Box, Transition } from '@mantine/core';
import { IconTrophy, IconStar, IconConfetti, IconAward, IconTrash } from '@tabler/icons-react'; // Añadido IconTrash para el botón de borrar
import { notifications } from '@mantine/notifications'; // Importar notificaciones
import { modals } from '@mantine/modals';           // Importar modales

import { cargarDatos, guardarDatos, getTodayFormattedDate } from '../utils/localStorageUtils'; // Importamos getTodayFormattedDate

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
            notifications.show({
                title: 'Error de Entrada',
                message: 'Por favor, describe tu logro antes de guardarlo.',
                color: 'red',
            });
            return;
        }
        const logroData = {
            // Usamos getTodayFormattedDate para un formato consistente en el almacenamiento
            date: getTodayFormattedDate(), 
            text: nuevoLogroTexto.trim(),
        };
        setUltimoLogro(logroData);
        guardarDatos('ultimoLogro', logroData);
        setNuevoLogroTexto(''); 
        
        // Reiniciar la animación para que se vea cada vez que se guarda un logro nuevo
        setShowLogro(false); 
        setTimeout(() => setShowLogro(true), 50); // Pequeño retardo para reiniciar la transición

        notifications.show({
            title: '¡Logro Guardado!',
            message: 'Tu logro ha sido registrado con éxito. ¡Felicidades!',
            color: 'green',
            icon: <IconAward size={18} />,
        });
    };

    // Manejador para borrar el logro
    const handleBorrarLogro = () => {
        modals.openConfirmModal({
            title: 'Confirmar Eliminación de Logro',
            children: (
                <Text size="sm">
                    ¿Estás seguro de que quieres borrar tu último logro? Esta acción no se puede deshacer.
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
                setUltimoLogro(null);
                guardarDatos('ultimoLogro', null);
                setShowLogro(false); // Ocultar la transición
                notifications.show({
                    title: 'Logro Borrado',
                    message: 'Tu último logro ha sido eliminado.',
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
            // Intenta parsear como YYYY-MM-DD si viene de getTodayFormattedDate
            const date = new Date(dateString + 'T00:00:00'); // Añade T00:00:00 para evitar problemas de zona horaria
            if (isNaN(date.getTime())) { // Si falla el parseo, intenta con el formato original si era diferente
                return new Date(dateString).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
            }
            return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
        } catch (e) {
            console.error("Error al formatear fecha:", e);
            return dateString; // Retorna el string original si hay error
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
                                <IconStar size={48} style={{ color: 'var(--mantine-color-yellow-6)', marginLeft: rem(-15), marginRight: rem(-15) }} /> 
                                <IconConfetti size={48} style={{ color: 'var(--mantine-color-green-7)' }} />
                            </Center>
                            <Title order={3} ta="center" c="green.8" mb="xs">
                                ¡Felicitaciones!
                            </Title>
                            <Text size="lg" ta="center" fw={600} mb="xs">
                                "{ultimoLogro.text}"
                            </Text>
                            <Text size="sm" ta="center" c="dimmed">
                                Registrado el: {formatDisplayDate(ultimoLogro.date)} {/* Usar la función de formateo */}
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