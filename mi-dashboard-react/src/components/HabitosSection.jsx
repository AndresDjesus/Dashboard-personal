// src/components/HabitosSection.jsx
import React, { useState, useEffect } from 'react';
import {
    Paper, Title, Text, TextInput, Button, Group, ActionIcon, rem, Box, Badge, Table, Checkbox,
} from '@mantine/core';
// Importa el nuevo icono para exportar
import { IconChecklist, IconTrash, IconFileSpreadsheet } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';

// Importa la función de exportación de las utilidades
import {
    cargarDatos,
    guardarDatos,
    getStartOfWeek,
    getDiasSemanaNombres,
    getDiaActualIndex,
    exportToXlsxWithStyle // <-- ¡La nueva función!
} from '../utils/localStorageUtils';

function HabitosSection() {
    const [habitos, setHabitos] = useState(() => {
        return cargarDatos('habitosLista', []);
    });
    const [nuevoHabitoTexto, setNuevoHabitoTexto] = useState('');
    const [habitosCompletados, setHabitosCompletados] = useState(() => {
        const datosCargados = cargarDatos('habitosCompletadosSemana', { weekStartDate: '', completions: {} });
        const startOfCurrentWeek = getStartOfWeek().toISOString().split('T')[0];
        if (datosCargados.weekStartDate !== startOfCurrentWeek) {
            console.log("Nueva semana detectada para hábitos, reiniciando progreso.");
            return { weekStartDate: startOfCurrentWeek, completions: {} };
        }
        return datosCargados;
    });

    useEffect(() => {
        guardarDatos('habitosLista', habitos);
        console.log("Lista de hábitos guardada:", habitos);
    }, [habitos]);

    useEffect(() => {
        guardarDatos('habitosCompletadosSemana', habitosCompletados);
        console.log("Estado de hábitos completados guardado:", habitosCompletados);
    }, [habitosCompletados]);

    useEffect(() => {
        const checkWeekChange = () => {
            const startOfCurrentWeek = getStartOfWeek().toISOString().split('T')[0];
            setHabitosCompletados(prev => {
                if (prev.weekStartDate !== startOfCurrentWeek) {
                    notifications.show({
                        title: 'Reinicio Semanal de Hábitos',
                        message: '¡Una nueva semana ha comenzado! Tu progreso de hábitos ha sido reiniciado.',
                        color: 'blue',
                        icon: <IconChecklist size={18} />,
                        autoClose: 5000,
                    });
                    return { weekStartDate: startOfCurrentWeek, completions: {} };
                }
                return prev;
            });
        };
        checkWeekChange();
        const intervalId = setInterval(checkWeekChange, 60 * 60 * 1000);
        return () => clearInterval(intervalId);
    }, []);

    const diasSemanaNombres = getDiasSemanaNombres();
    const diaActualIndex = getDiaActualIndex();

    const handleAddHabito = () => {
        if (nuevoHabitoTexto.trim() === '') {
            notifications.show({
                title: 'Error de Entrada',
                message: 'El nombre del hábito no puede estar vacío.',
                color: 'red',
            });
            return;
        }
        const nuevoHabito = {
            id: Date.now().toString(),
            text: nuevoHabitoTexto.trim(),
        };
        setHabitos([...habitos, nuevoHabito]);
        setNuevoHabitoTexto('');
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
                setHabitos(prevHabitos => prevHabitos.filter(habito => habito.id !== idAEliminar));
                setHabitosCompletados(prev => {
                    const newCompletions = JSON.parse(JSON.stringify(prev.completions));
                    delete newCompletions[idAEliminar];
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
        const diaNombre = diasSemanaNombres[diaIndex];
        setHabitosCompletados(prev => {
            const newCompletions = JSON.parse(JSON.stringify(prev.completions));
            if (!newCompletions[habitoId]) {
                newCompletions[habitoId] = {};
            }
            newCompletions[habitoId][diaNombre] = !newCompletions[habitoId][diaNombre];
            const habitoText = habitos.find(h => h.id === habitoId)?.text;
            notifications.show({
                title: 'Progreso de Hábito',
                message: `"${habitoText}" marcado como ${newCompletions[habitoId][diaNombre] ? 'completado' : 'pendiente'} para el ${diaNombre}.`,
                color: newCompletions[habitoId][diaNombre] ? 'blue' : 'gray',
            });
            return { ...prev, completions: newCompletions };
        });
    };

    // --- NUEVA FUNCIÓN PARA EXPORTAR A EXCEL ---
    const handleExportHabitos = () => {
        // Preparamos los datos para la exportación
        const dataForExport = habitos.map(habito => {
            const completions = habitosCompletados.completions[habito.id] || {};
            // Creamos un objeto plano con la información
            const habitoData = {
                'Hábito': habito.text
            };
            diasSemanaNombres.forEach(dia => {
                habitoData[dia] = completions[dia] ? '✅ Completado' : '❌ Pendiente';
            });
            return habitoData;
        });

        const sheetName = 'Hábitos';
        const fileName = `seguimiento_habitos_${habitosCompletados.weekStartDate}`;
        
        exportToXlsxWithStyle(dataForExport, fileName, sheetName);
    };

    const habitosCompletadosHoyCount = habitos.filter(habito =>
        habitosCompletados.completions[habito.id]?.[diasSemanaNombres[diaActualIndex]]
    ).length;
    const habitosPendientesHoyCount = habitos.length - habitosCompletadosHoyCount;

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
                    onKeyPress={(event) => {
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
                {/* --- NUEVO BOTÓN PARA EXPORTAR --- */}
                {habitos.length > 0 && (
                    <Button
                        onClick={handleExportHabitos}
                        leftSection={<IconFileSpreadsheet size={16} />}
                        variant="outline"
                        color="green"
                    >
                        Exportar a Excel
                    </Button>
                )}
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
                                        const isCompleted = habitosCompletados.completions[habito.id]?.[dia] || false;
                                        return (
                                            <Table.Td key={dia} style={{ textAlign: 'center' }}>
                                                <Checkbox
                                                    checked={isCompleted}
                                                    onChange={() => toggleHabitoCompleted(habito.id, index)}
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
                                            <IconTrash style={{ width: rem(16), height: rem(16)} } />
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