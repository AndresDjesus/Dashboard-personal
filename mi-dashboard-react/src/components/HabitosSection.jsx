import React, { useState, useEffect } from 'react';
import {
    Paper, Title, Text, TextInput, Button, Group, ActionIcon, rem, Box, Badge, Table, Checkbox,
} from '@mantine/core';
import { IconChecklist, IconTrash, IconPlus, IconX } from '@tabler/icons-react';

import { cargarDatos, guardarDatos, getStartOfWeek, getDiasSemanaNombres, getDiaActualIndex } from '../utils/localStorageUtils';

function HabitosSection() {
    const [habitos, setHabitos] = useState(() =>
        cargarDatos('habitosDiarios', [])
    );

    const [nuevoHabitoTexto, setNuevoHabitoTexto] = useState('');

    const [habitosCompletadosSemana, setHabitosCompletadosSemana] = useState(() => {
        const data = cargarDatos('habitosCompletadosSemana', { weekStartDate: '', completions: {} });
        const currentWeekStart = getStartOfWeek();

        console.log('--- Inicializando habitosCompletadosSemana ---');
        console.log('Datos cargados de localStorage:', data);
        console.log('Inicio de semana actual:', currentWeekStart);

        // Reinicia si la semana almacenada no es la semana actual
        if (data.weekStartDate !== currentWeekStart) {
            console.log('¡Nueva semana detectada! Reiniciando hábitos completados.');
            return { weekStartDate: currentWeekStart, completions: {} };
        }
        console.log('Misma semana. Cargando progreso existente.');
        return data;
    });

    useEffect(() => {
        guardarDatos('habitosDiarios', habitos);
        console.log('Hábitos guardados (habitosDiarios):', habitos);
    }, [habitos]);

    useEffect(() => {
        guardarDatos('habitosCompletadosSemana', habitosCompletadosSemana);
        console.log('Hábitos completados semanales guardados:', habitosCompletadosSemana);
    }, [habitosCompletadosSemana]);

    // Este useEffect se puede simplificar si la inicialización ya lo maneja bien.
    // Lo mantendremos por ahora para el control por intervalo.
    useEffect(() => {
        const checkWeekChange = () => {
            const currentWeekStart = getStartOfWeek();
            if (habitosCompletadosSemana.weekStartDate !== currentWeekStart) {
                setHabitosCompletadosSemana({ weekStartDate: currentWeekStart, completions: {} });
                console.log(`Hábitos reiniciados por intervalo para la nueva semana: ${currentWeekStart}`);
            }
        };

        checkWeekChange(); // Revisa al montar
        const intervalId = setInterval(checkWeekChange, 60 * 60 * 1000); // Comprobar cada hora

        return () => clearInterval(intervalId);
    }, [habitosCompletadosSemana.weekStartDate]); // Dependencia: solo se ejecuta si la fecha de inicio de semana cambia

    const diasSemanaNombres = getDiasSemanaNombres();

    const handleAddHabito = () => {
        if (nuevoHabitoTexto.trim() === '') {
            alert('Por favor, ingresa un hábito.');
            return;
        }
        const nuevoHabito = {
            id: Date.now().toString(),
            text: nuevoHabitoTexto.trim(),
        };
        setHabitos([...habitos, nuevoHabito]);
        setNuevoHabitoTexto('');
    };

    const toggleHabitoCompleted = (habitoId, diaNombre) => {
        setHabitosCompletadosSemana(prev => {
            const newCompletions = { ...prev.completions };
            if (!newCompletions[habitoId]) {
                newCompletions[habitoId] = {};
            }
            newCompletions[habitoId][diaNombre] = !newCompletions[habitoId][diaNombre];
            console.log(`Toggle: Hábito ${habitoId}, Día ${diaNombre}. Nuevo estado: ${newCompletions[habitoId][diaNombre]}`);
            return { ...prev, completions: newCompletions };
        });
    };

    const handleDeleteHabito = (id) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este hábito?')) {
            const updatedHabitos = habitos.filter(habito => habito.id !== id);
            setHabitos(updatedHabitos);

            setHabitosCompletadosSemana(prev => {
                const newCompletions = { ...prev.completions };
                delete newCompletions[id];
                console.log(`Hábito ${id} eliminado. Completions restantes:`, newCompletions);
                return { ...prev, completions: newCompletions };
            });
        }
    };

    const diaActualNombre = diasSemanaNombres[getDiaActualIndex()];
    const habitosCompletadosHoyCount = habitos.filter(habito =>
        habitosCompletadosSemana.completions[habito.id]?.[diaActualNombre]
    ).length;
    const habitosPendientesHoyCount = habitos.length - habitosCompletadosHoyCount;

    return (
        <Paper shadow="sm" p="lg" withBorder radius="md">
            <Title order={2} ta="center" mb="md" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <IconChecklist size={28} />
                Mis Hábitos Diarios
            </Title>

            <Group mb="md" grow>
                <TextInput
                    label="Nuevo Hábito:"
                    placeholder="Ej. Beber 2L de agua"
                    value={nuevoHabitoTexto}
                    onChange={(event) => setNuevoHabitoTexto(event.currentTarget.value)}
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
                                <Table.Th style={{ width: rem(150) }}>Hábito</Table.Th>
                                {diasSemanaNombres.map(dia => (
                                    <Table.Th key={dia} style={{ textAlign: 'center', width: rem(50) }}>{dia}</Table.Th>
                                ))}
                                <Table.Th style={{ width: rem(50), textAlign: 'center' }}>Acciones</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {habitos.map((habito) => (
                                <Table.Tr key={habito.id}>
                                    <Table.Td>{habito.text}</Table.Td>
                                    {diasSemanaNombres.map(dia => {
                                        const isCompleted = habitosCompletadosSemana.completions[habito.id]?.[dia] || false;
                                        return (
                                            <Table.Td key={dia} style={{ textAlign: 'center' }}>
                                                <Checkbox
                                                    checked={isCompleted}
                                                    onChange={() => toggleHabitoCompleted(habito.id, dia)}
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
        </Paper>
    );
}

export default HabitosSection;