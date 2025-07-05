// src/components/HabitosSection.jsx
import React, { useState, useEffect } from 'react';
import {
    Paper, Title, Text, TextInput, Button, Group, ActionIcon, rem, Box, Badge, Table, Checkbox,
} from '@mantine/core';
import { IconChecklist, IconTrash } from '@tabler/icons-react'; // remueve IconPlus, IconX si no se usan

// Asegúrate de que estas utilidades sean las últimas versiones corregidas
import { cargarDatos, guardarDatos, getStartOfWeek, getDiasSemanaNombres, getDiaActualIndex } from '../utils/localStorageUtils';

function HabitosSection() {
    const [habitos, setHabitos] = useState(() =>
        cargarDatos('habitosDiarios', [])
    );

    const [nuevoHabitoTexto, setNuevoHabitoTexto] = useState('');

    const [habitosCompletadosSemana, setHabitosCompletadosSemana] = useState(() => {
        const data = cargarDatos('habitosCompletadosSemana', { weekStartDate: '', completions: {} });
        // <<<<<<< CAMBIO CLAVE AQUÍ >>>>>>>
        // Formatear getStartOfWeek() a un string YYYY-MM-DD para la comparación
        const currentWeekStartFormatted = getStartOfWeek().toISOString().split('T')[0];

        console.log('--- Inicializando habitosCompletadosSemana ---');
        console.log('Datos cargados de localStorage:', data);
        console.log('Inicio de semana actual (formateado):', currentWeekStartFormatted);

        // Reinicia si la semana almacenada NO es la semana actual (comparando strings)
        if (data.weekStartDate !== currentWeekStartFormatted) {
            console.log('¡Nueva semana detectada! Reiniciando hábitos completados.');
            return { weekStartDate: currentWeekStartFormatted, completions: {} };
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

    useEffect(() => {
        const checkWeekChange = () => {
            // <<<<<<< CAMBIO CLAVE AQUÍ >>>>>>>
            // Formatear getStartOfWeek() a un string YYYY-MM-DD para la comparación
            const currentWeekStartFormatted = getStartOfWeek().toISOString().split('T')[0];

            if (habitosCompletadosSemana.weekStartDate !== currentWeekStartFormatted) {
                setHabitosCompletadosSemana({ weekStartDate: currentWeekStartFormatted, completions: {} });
                console.log(`Hábitos reiniciados por intervalo para la nueva semana: ${currentWeekStartFormatted}`);
            }
        };

        checkWeekChange(); // Revisa al montar
        // Comprobar cada hora es una buena frecuencia para esto
        const intervalId = setInterval(checkWeekChange, 60 * 60 * 1000); 

        return () => clearInterval(intervalId);
    }, [habitosCompletadosSemana.weekStartDate]); 

    const diasSemanaNombres = getDiasSemanaNombres();
    // Console.log para depuración
    console.log("Nombres de los días de la semana:", diasSemanaNombres);

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
            // Console.log para depuración más precisa
            console.log(`Toggle: Hábito '${habitoId}', Día '${diaNombre}'. Nuevo estado: ${newCompletions[habitoId][diaNombre]}`);
            console.log("Estado de completados actualizado (temp):", newCompletions);
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
    // Console.log para depuración
    console.log("Día actual (nombre):", diaActualNombre);

    const habitosCompletadosHoyCount = habitos.filter(habito =>
        habitosCompletadosSemana.completions[habito.id]?.[diaActualNombre]
    ).length;
    const habitosPendientesHoyCount = habitos.length - habitosCompletadosHoyCount;
    // Console.log para depuración
    console.log("Hábitos completados hoy:", habitosCompletadosHoyCount);
    console.log("Hábitos pendientes hoy:", habitosPendientesHoyCount);


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
                                        // Verifica si el hábito está completado para este día
                                        // Si no existe el habitoId o el dia, es false por defecto
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