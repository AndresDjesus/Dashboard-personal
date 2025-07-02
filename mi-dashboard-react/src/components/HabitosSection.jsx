// src/components/HabitosSection.jsx
import React, { useState, useEffect } from 'react';
import {
    Paper,
    Title,
    Text,
    TextInput,
    Button,
    Group,
    ActionIcon,
    rem,
    Box,
    Badge,
    Table, // ¡Nuevo componente para la tabla!
    Checkbox, // Usaremos checkboxes dentro de la tabla
} from '@mantine/core';
import { IconChecklist, IconTrash, IconPlus, IconX } from '@tabler/icons-react'; // Iconos

import { cargarDatos, guardarDatos, getStartOfWeek, getDiasSemanaNombres, getDiaActualIndex } from '../utils/localStorageUtils';

function HabitosSection() {
    // Estado para la lista de hábitos (solo el nombre del hábito)
    // Cada hábito: { id: string, text: string }
    const [habitos, setHabitos] = useState(() =>
        cargarDatos('habitosDiarios', [])
    );

    // Estado para el texto del input de nuevo hábito
    const [nuevoHabitoTexto, setNuevoHabitoTexto] = useState('');

    // Estado para el seguimiento semanal de hábitos completados
    // { weekStartDate: 'YYYY-MM-DD', completions: { [habitoId]: { 'Lun': boolean, 'Mar': boolean, ... } } }
    const [habitosCompletadosSemana, setHabitosCompletadosSemana] = useState(() => {
        const data = cargarDatos('habitosCompletadosSemana', { weekStartDate: '', completions: {} });
        const currentWeekStart = getStartOfWeek();

        // Reinicia si la semana almacenada no es la semana actual
        if (data.weekStartDate !== currentWeekStart) {
            return { weekStartDate: currentWeekStart, completions: {} };
        }
        return data;
    });

    // Guarda los hábitos en localStorage cada vez que cambian
    useEffect(() => {
        guardarDatos('habitosDiarios', habitos);
    }, [habitos]);

    // Guarda el estado de completado semanal en localStorage
    useEffect(() => {
        guardarDatos('habitosCompletadosSemana', habitosCompletadosSemana);
    }, [habitosCompletadosSemana]);

    // Efecto para reiniciar los hábitos completados si la semana cambia
    useEffect(() => {
        const checkWeekChange = () => {
            const currentWeekStart = getStartOfWeek();
            if (habitosCompletadosSemana.weekStartDate !== currentWeekStart) {
                // Reinicia los hábitos completados para la nueva semana
                setHabitosCompletadosSemana({ weekStartDate: currentWeekStart, completions: {} });
                console.log(`Hábitos reiniciados para la nueva semana: ${currentWeekStart}`);
            }
        };

        // Ejecutar al montar y luego cada cierto tiempo (ej. cada hora)
        checkWeekChange();
        const intervalId = setInterval(checkWeekChange, 60 * 60 * 1000); // Comprobar cada hora

        return () => clearInterval(intervalId); // Limpiar el intervalo al desmontar
    }, [habitosCompletadosSemana.weekStartDate]); // Dependencia: solo se ejecuta si la fecha de inicio de semana cambia

    // Nombres de los días de la semana para la cabecera de la tabla
    const diasSemanaNombres = getDiasSemanaNombres();

    // Manejador para añadir un nuevo hábito
    const handleAddHabito = () => {
        if (nuevoHabitoTexto.trim() === '') {
            alert('Por favor, ingresa un hábito.');
            return;
        }
        const nuevoHabito = {
            id: Date.now().toString(), // ID único
            text: nuevoHabitoTexto.trim(),
        };
        setHabitos([...habitos, nuevoHabito]);
        setNuevoHabitoTexto(''); // Limpiar el input
    };

    // Manejador para alternar el estado de completado de un hábito para un día específico
    const toggleHabitoCompleted = (habitoId, diaNombre) => {
        setHabitosCompletadosSemana(prev => {
            const newCompletions = { ...prev.completions };
            if (!newCompletions[habitoId]) {
                newCompletions[habitoId] = {}; // Inicializa si no existe
            }
            newCompletions[habitoId][diaNombre] = !newCompletions[habitoId][diaNombre]; // Alterna el estado
            return { ...prev, completions: newCompletions };
        });
    };

    // Manejador para eliminar un hábito
    const handleDeleteHabito = (id) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este hábito?')) {
            const updatedHabitos = habitos.filter(habito => habito.id !== id);
            setHabitos(updatedHabitos);

            // También eliminar el estado de completado semanal si existe
            setHabitosCompletadosSemana(prev => {
                const newCompletions = { ...prev.completions };
                delete newCompletions[id];
                return { ...prev, completions: newCompletions };
            });
        }
    };

    // Calcular hábitos completados hoy
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
                <Box style={{ overflowX: 'auto' }}> {/* Permite scroll horizontal si la tabla es muy ancha */}
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