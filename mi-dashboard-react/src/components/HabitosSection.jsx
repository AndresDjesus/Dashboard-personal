// src/components/HabitosSection.jsx
import React, { useState, useEffect } from 'react';
import {
    Paper, Title, Text, TextInput, Button, Group, ActionIcon, rem, Box, Badge, Table, Checkbox,
} from '@mantine/core';
import { IconChecklist, IconTrash } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications'; // Importar notificaciones
import { modals } from '@mantine/modals'; // Importar modales

// Importa las utilidades de localStorage actualizadas
import {
    cargarDatos,
    guardarDatos,
    getStartOfWeek,
    getDiasSemanaNombres,
    getDiaActualIndex
} from '../utils/localStorageUtils';

function HabitosSection() {
    // -----------------------------------------------------------
    // 1. Estado para la lista de hábitos (persistente)
    //    habitos: [{ id: '...', text: '...' }, ...]
    // -----------------------------------------------------------
    const [habitos, setHabitos] = useState(() => {
        return cargarDatos('habitosLista', []); // Nueva clave para evitar conflictos
    });

    // -----------------------------------------------------------
    // 2. Estado para el texto del nuevo hábito
    // -----------------------------------------------------------
    const [nuevoHabitoTexto, setNuevoHabitoTexto] = useState('');

    // -----------------------------------------------------------
    // 3. Estado para el seguimiento de hábitos completados (persistente y reinicio semanal)
    //    habitosCompletados: { weekStartDate: 'YYYY-MM-DD', completions: { 'habitoId': { 'Lun': true, 'Mar': false, ... } } }
    // -----------------------------------------------------------
    const [habitosCompletados, setHabitosCompletados] = useState(() => {
        const datosCargados = cargarDatos('habitosCompletadosSemana', { weekStartDate: '', completions: {} });
        const startOfCurrentWeek = getStartOfWeek().toISOString().split('T')[0]; // Formato YYYY-MM-DD

        // Reiniciar si la semana almacenada no coincide con la actual
        if (datosCargados.weekStartDate !== startOfCurrentWeek) {
            console.log("Nueva semana detectada para hábitos, reiniciando progreso.");
            return { weekStartDate: startOfCurrentWeek, completions: {} };
        }
        return datosCargados; // Si es la misma semana, cargar los datos existentes
    });

    // -----------------------------------------------------------
    // 4. Efecto para guardar la lista de hábitos en localStorage
    // -----------------------------------------------------------
    useEffect(() => {
        guardarDatos('habitosLista', habitos);
        console.log("Lista de hábitos guardada:", habitos);
    }, [habitos]); // Se ejecuta cada vez que la lista de hábitos cambia

    // -----------------------------------------------------------
    // 5. Efecto para guardar el estado de completado de hábitos en localStorage
    // -----------------------------------------------------------
    useEffect(() => {
        guardarDatos('habitosCompletadosSemana', habitosCompletados);
        console.log("Estado de hábitos completados guardado:", habitosCompletados);
    }, [habitosCompletados]); // Se ejecuta cada vez que el estado de completado cambia

    // -----------------------------------------------------------
    // 6. Efecto para verificar y reiniciar semanalmente (corre cada hora)
    // -----------------------------------------------------------
    useEffect(() => {
        const checkWeekChange = () => {
            const startOfCurrentWeek = getStartOfWeek().toISOString().split('T')[0];

            setHabitosCompletados(prev => {
                // Si la semana actual es diferente a la semana almacenada, reiniciar
                if (prev.weekStartDate !== startOfCurrentWeek) {
                    notifications.show({
                        title: 'Reinicio Semanal de Hábitos',
                        message: '¡Una nueva semana ha comenzado! Tu progreso de hábitos ha sido reiniciado.',
                        color: 'blue',
                        icon: <IconCalendar size={18} />,
                        autoClose: 5000,
                    });
                    return { weekStartDate: startOfCurrentWeek, completions: {} };
                }
                return prev; // Si es la misma semana, no hacer nada
            });
        };

        checkWeekChange(); // Ejecutar al montar para asegurar que el estado sea el correcto
        const intervalId = setInterval(checkWeekChange, 60 * 60 * 1000); // Revisa cada hora

        return () => clearInterval(intervalId); // Limpiar el intervalo al desmontar
    }, []); // Dependencia vacía: se ejecuta solo una vez al montar

    // -----------------------------------------------------------
    // 7. Utilidades de días de la semana
    // -----------------------------------------------------------
    const diasSemanaNombres = getDiasSemanaNombres(); // ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
    const diaActualIndex = getDiaActualIndex(); // Índice numérico del día actual (0 para Lun, 6 para Dom)

    // -----------------------------------------------------------
    // 8. Handlers de Eventos
    // -----------------------------------------------------------

    const handleAddHabito = () => {
        if (nuevoHabitoTexto.trim() === '') {
            notifications.show({
                title: 'Error de Entrada',
                message: 'El nombre del hábito no puede estar vacío.',
                color: 'red',
            });
            return;
        }
        // Crear un nuevo objeto de hábito
        const nuevoHabito = {
            id: Date.now().toString(), // ID único basado en el timestamp
            text: nuevoHabitoTexto.trim(),
        };
        setHabitos([...habitos, nuevoHabito]); // Añadir el nuevo hábito a la lista
        setNuevoHabitoTexto(''); // Limpiar el input
        notifications.show({
            title: 'Hábito Añadido',
            message: `"${nuevoHabito.text}" ha sido añadido a tu lista de hábitos.`,
            color: 'green',
        });
    };

    const handleDeleteHabito = (idAEliminar) => {
        modals.openConfirmModal({
            title: 'Confirmar Eliminación de Hábito',
            children: (
                <Text size="sm">
                    ¿Estás seguro de que quieres eliminar este hábito? Esta acción no se puede deshacer.
                </Text>
            ),
            labels: { confirm: 'Sí, eliminar', cancel: 'No, cancelar' },
            confirmProps: { color: 'red' },
            onCancel: () => notifications.show({
                title: 'Eliminación Cancelada',
                message: 'El hábito no fue eliminado.',
                color: 'gray',
            }),
            onConfirm: () => {
                // Eliminar de la lista de hábitos
                setHabitos(prevHabitos => prevHabitos.filter(habito => habito.id !== idAEliminar));

                // Eliminar también su progreso de completado
                setHabitosCompletados(prev => {
                    const newCompletions = JSON.parse(JSON.stringify(prev.completions)); // Copia profunda
                    delete newCompletions[idAEliminar]; // Eliminar la entrada del hábito
                    return { ...prev, completions: newCompletions };
                });
                notifications.show({
                    title: 'Hábito Eliminado',
                    message: 'El hábito ha sido eliminado.',
                    color: 'orange',
                });
            },
        });
    };

    const toggleHabitoCompleted = (habitoId, diaIndex) => {
        const diaNombre = diasSemanaNombres[diaIndex]; // Obtener el nombre del día para el índice
        setHabitosCompletados(prev => {
            // Clonar profundamente para asegurar inmutabilidad y que React detecte el cambio
            const newCompletions = JSON.parse(JSON.stringify(prev.completions));

            // Asegurarse de que el objeto del hábito exista
            if (!newCompletions[habitoId]) {
                newCompletions[habitoId] = {};
            }
            // Invertir el estado de completado para el día específico
            newCompletions[habitoId][diaNombre] = !newCompletions[habitoId][diaNombre];

            // Feedback de notificación
            const habitoText = habitos.find(h => h.id === habitoId)?.text;
            notifications.show({
                title: 'Progreso de Hábito',
                message: `"${habitoText}" marcado como ${newCompletions[habitoId][diaNombre] ? 'completado' : 'pendiente'} para el ${diaNombre}.`,
                color: newCompletions[habitoId][diaNombre] ? 'blue' : 'gray',
            });

            return { ...prev, completions: newCompletions };
        });
    };

    // -----------------------------------------------------------
    // 9. Cálculos para las insignias de progreso
    // -----------------------------------------------------------
    const habitosCompletadosHoyCount = habitos.filter(habito =>
        habitosCompletados.completions[habito.id]?.[diasSemanaNombres[diaActualIndex]] // Usar el nombre del día actual
    ).length;
    const habitosPendientesHoyCount = habitos.length - habitosCompletadosHoyCount;

    // -----------------------------------------------------------
    // 10. Renderizado del Componente
    // -----------------------------------------------------------
    return (
        <Paper shadow="sm" p="lg" withBorder radius="md">
            <Title order={2} ta="center" mb="md" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <IconChecklist size={28} />
                Mis Hábitos Semanales
            </Title>

            <Group mb="md" grow>
                <TextInput
                    label="Nuevo Hábito:"
                    placeholder="Ej. Beber 2L de agua"
                    value={nuevoHabitoTexto}
                    onChange={(event) => setNuevoHabitoTexto(event.currentTarget.value)}
                    onKeyPress={(event) => { // onKeyPress es preferible para 'Enter'
                        if (event.key === 'Enter') {
                            handleAddHabito();
                        }
                    }}
                />
                <Button onClick={handleAddHabito} variant="filled" color="teal">
                    Añadir Hábito
                </Button>
            </Group>

            <Group position="apart" mb="md">
                <Badge color="green" size="lg" variant="light">
                    Completados Hoy: {habitosCompletadosHoyCount}
                </Badge>
                <Badge color="blue" size="lg" variant="light">
                    Pendientes Hoy: {habitosPendientesHoyCount}
                </Badge>
            </Group>

            {habitos.length === 0 ? (
                <Text ta="center" c="dimmed" mt="xl">
                    Aún no tienes hábitos. ¡Añade algunos para empezar!
                </Text>
            ) : (
                <Box style={{ overflowX: 'auto' }}>
                    <Table
                        striped
                        highlightOnHover
                        withTableBorder
                        withColumnBorders
                        verticalSpacing="xs"
                        horizontalSpacing="md"
                    >
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th style={{ width: rem(150), minWidth: rem(150) }}>Hábito</Table.Th>
                                {diasSemanaNombres.map((dia, index) => (
                                    <Table.Th
                                        key={dia}
                                        style={{
                                            textAlign: 'center',
                                            width: rem(50),
                                            color: index === diaActualIndex ? 'var(--mantine-color-blue-4)' : 'inherit',
                                            fontWeight: index === diaActualIndex ? 700 : 500,
                                        }}
                                    >
                                        {dia}
                                    </Table.Th>
                                ))}
                                <Table.Th style={{ width: rem(50), textAlign: 'center' }}>Acciones</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {habitos.map((habito) => (
                                <Table.Tr key={habito.id}>
                                    <Table.Td>{habito.text}</Table.Td>
                                    {diasSemanaNombres.map((dia, index) => {
                                        // Determinar si la casilla de verificación debe estar marcada
                                        const isCompleted = habitosCompletados.completions[habito.id]?.[dia] || false;
                                        return (
                                            <Table.Td key={dia} style={{ textAlign: 'center' }}>
                                                <Checkbox
                                                    checked={isCompleted}
                                                    onChange={() => toggleHabitoCompleted(habito.id, index)} // Pasar el índice del día
                                                    color="teal"
                                                    size="sm"
                                                    aria-label={`Marcar ${habito.text} para ${dia}`}
                                                />
                                            </Table.Td>
                                        );
                                    })}
                                    <Table.Td style={{ textAlign: 'center' }}>
                                        <ActionIcon
                                            variant="light"
                                            color="red"
                                            onClick={() => handleDeleteHabito(habito.id)}
                                            size="md"
                                        >
                                            <IconTrash style={{ width: rem(16), height: rem(16) }} />
                                        </ActionIcon>
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                </Box>
            )}
            <Text size="sm" c="dimmed" mt="xs" ta="center">
                *El progreso de los hábitos se reinicia automáticamente cada inicio de semana (lunes).
            </Text>
        </Paper>
    );
}

export default HabitosSection;