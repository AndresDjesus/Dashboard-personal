import React, { useState, useEffect } from 'react';
import {Paper,Title,Text,TextInput,Button,Group,List,Checkbox,ActionIcon,rem,Box,Badge,NumberInput,Progress } from '@mantine/core';
import { IconTarget, IconCheck, IconTrash, IconEdit, IconX, IconPlus, IconMinus } from '@tabler/icons-react'; // Nuevos íconos

import { cargarDatos, guardarDatos } from '../utils/localStorageUtils';

function MetasSection() {
    // Estado para la lista de metas
    // Cada meta puede ser: { id: string, text: string, completed: boolean, totalSteps?: number, currentSteps?: number }
    const [metas, setMetas] = useState(() =>
        cargarDatos('metasPersonales', [])
    );

    const [nuevaMetaTexto, setNuevaMetaTexto] = useState('');
    // Estados para la nueva meta basada en pasos
    const [nuevaMetaTotalPasos, setNuevaMetaTotalPasos] = useState(0);
    const [nuevaMetaCurrentPasos, setNuevaMetaCurrentPasos] = useState(0);

    const [editandoMetaId, setEditandoMetaId] = useState(null);
    const [editandoMetaTexto, setEditandoMetaTexto] = useState('');
    // Estados para la edición de metas basadas en pasos
    const [editandoMetaTotalPasos, setEditandoMetaTotalPasos] = useState(0);
    const [editandoMetaCurrentPasos, setEditandoMetaCurrentPasos] = useState(0);

    // Guarda las metas en localStorage cada vez que cambian
    useEffect(() => {
        guardarDatos('metasPersonales', metas);
    }, [metas]);

    // Manejador para añadir o actualizar una meta
    const handleAddOrUpdateMeta = () => {
        if (nuevaMetaTexto.trim() === '' && !editandoMetaId) {
            alert('Por favor, ingresa una meta.');
            return;
        }
        
        const isProgressMeta = nuevaMetaTotalPasos > 0 || editandoMetaTotalPasos > 0;

        if (editandoMetaId) {
            // Actualizar meta existente
            const updatedMetas = metas.map(meta => {
                if (meta.id === editandoMetaId) {
                    const updatedMeta = { ...meta, text: editandoMetaTexto };
                    if (isProgressMeta) {
                        updatedMeta.totalSteps = editandoMetaTotalPasos;
                        updatedMeta.currentSteps = Math.min(editandoMetaCurrentPasos, editandoMetaTotalPasos); // No exceder total
                        // Marcar como completada si los pasos actuales alcanzan el total
                        updatedMeta.completed = updatedMeta.currentSteps >= updatedMeta.totalSteps;
                    } else {
                        // Si era una meta con pasos y la editamos sin pasos, quitamos los campos
                        delete updatedMeta.totalSteps;
                        delete updatedMeta.currentSteps;
                    }
                    return updatedMeta;
                }
                return meta;
            });
            setMetas(updatedMetas);
            cancelEditMeta(); // Limpiar el estado de edición
        } else {
            // Añadir nueva meta
            const nuevaMeta = {
                id: Date.now().toString(),
                text: nuevaMetaTexto.trim(),
                completed: false,
            };
            if (nuevaMetaTotalPasos > 0) {
                nuevaMeta.totalSteps = nuevaMetaTotalPasos;
                nuevaMeta.currentSteps = nuevaMetaCurrentPasos;
                if (nuevaMeta.currentSteps >= nuevaMeta.totalSteps && nuevaMeta.totalSteps > 0) {
                    nuevaMeta.completed = true; // Si ya inicia completada por pasos
                }
            }
            setMetas([...metas, nuevaMeta]);
            // Limpiar inputs después de añadir
            setNuevaMetaTexto('');
            setNuevaMetaTotalPasos(0);
            setNuevaMetaCurrentPasos(0);
        }
    };

    // Manejador para alternar el estado de completado de una meta simple
    const toggleMetaCompleted = (id) => {
        const updatedMetas = metas.map(meta =>
            meta.id === id && typeof meta.totalSteps === 'undefined' // Solo para metas sin pasos
                ? { ...meta, completed: !meta.completed }
                : meta
        );
        setMetas(updatedMetas);
    };

    // Incrementa/decrementa los pasos de una meta
    const updateMetaSteps = (id, change) => {
        const updatedMetas = metas.map(meta => {
            if (meta.id === id && typeof meta.totalSteps !== 'undefined') {
                const newSteps = Math.max(0, Math.min(meta.totalSteps, meta.currentSteps + change));
                return {
                    ...meta,
                    currentSteps: newSteps,
                    completed: newSteps >= meta.totalSteps && meta.totalSteps > 0, // Marcar como completada si los pasos son iguales al total y el total es > 0
                };
            }
            return meta;
        });
        setMetas(updatedMetas);
    };

    // Manejador para eliminar una meta
    const handleDeleteMeta = (id) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar esta meta?')) {
            const updatedMetas = metas.filter(meta => meta.id !== id);
            setMetas(updatedMetas);
            cancelEditMeta(); // Limpiar el estado de edición si eliminamos la que se estaba editando
        }
    };

    // Manejador para iniciar la edición de una meta
    const startEditMeta = (meta) => {
        setEditandoMetaId(meta.id);
        setEditandoMetaTexto(meta.text);
        setEditandoMetaTotalPasos(meta.totalSteps || 0); // Si no tiene, es 0
        setEditandoMetaCurrentPasos(meta.currentSteps || 0); // Si no tiene, es 0
        setNuevaMetaTexto(''); // Limpiar input principal
        setNuevaMetaTotalPasos(0);
        setNuevaMetaCurrentPasos(0);
    };

    // Manejador para cancelar la edición
    const cancelEditMeta = () => {
        setEditandoMetaId(null);
        setEditandoMetaTexto('');
        setEditandoMetaTotalPasos(0);
        setEditandoMetaCurrentPasos(0);
        setNuevaMetaTexto('');
        setNuevaMetaTotalPasos(0);
        setNuevaMetaCurrentPasos(0);
    };

    const metasCompletadas = metas.filter(meta => meta.completed).length;
    const metasPendientes = metas.filter(meta => !meta.completed).length;

    return (
        <Paper shadow="sm" p="lg" withBorder radius="md">
            <Title order={2} ta="center" mb="md" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <IconTarget size={28} /> {/* O IconFlag, IconAward */}
                Mis Metas Personales
            </Title>

            <Group mb="md" grow>
                <TextInput
                    label={editandoMetaId ? "Editando Meta:" : "Nueva Meta:"}
                    placeholder={editandoMetaId ? "Actualiza tu meta" : "Ej. Leer 10 libros este año"}
                    value={editandoMetaId ? editandoMetaTexto : nuevaMetaTexto}
                    onChange={(event) => editandoMetaId ? setEditandoMetaTexto(event.currentTarget.value) : setNuevaMetaTexto(event.currentTarget.value)}
                    rightSection={
                        editandoMetaId && (
                            <ActionIcon onClick={cancelEditMeta} size="lg" variant="subtle" color="gray">
                                <IconX style={{ width: rem(18), height: rem(18) }} />
                            </ActionIcon>
                        )
                    }
                />
                <Button onClick={handleAddOrUpdateMeta} variant="filled" color="grape">
                    {editandoMetaId ? 'Actualizar Meta' : 'Añadir Meta'}
                </Button>
            </Group>

            {/* Campos para metas con progreso */}
            <Group grow mb="md">
                <NumberInput
                    label="Total de Pasos:"
                    placeholder="0"
                    min={0}
                    value={editandoMetaId ? editandoMetaTotalPasos : nuevaMetaTotalPasos}
                    onChange={(value) => editandoMetaId ? setEditandoMetaTotalPasos(value) : setNuevaMetaTotalPasos(value)}
                    description="Deja en 0 para una meta simple."
                />
                { (editandoMetaId && editandoMetaTotalPasos > 0) || (!editandoMetaId && nuevaMetaTotalPasos > 0) ? (
                    <NumberInput
                        label="Pasos Actuales:"
                        placeholder="0"
                        min={0}
                        max={editandoMetaId ? editandoMetaTotalPasos : nuevaMetaTotalPasos}
                        value={editandoMetaId ? editandoMetaCurrentPasos : nuevaMetaCurrentPasos}
                        onChange={(value) => editandoMetaId ? setEditandoMetaCurrentPasos(value) : setNuevaMetaCurrentPasos(value)}
                    />
                ) : null}
            </Group>


            <Group position="apart" mb="md">
                <Badge color="green" size="lg" variant="light">
                    Completadas: {metasCompletadas}
                </Badge>
                <Badge color="blue" size="lg" variant="light">
                    Pendientes: {metasPendientes}
                </Badge>
            </Group>

            {metas.length === 0 ? (
                <Text ta="center" c="dimmed" mt="xl">
                    Aún no tienes metas. ¡Añade algunas para empezar!
                </Text>
            ) : (
                <List spacing="xs" size="sm" center>
                    {metas.map((meta) => {
                        const isProgressMeta = typeof meta.totalSteps !== 'undefined' && meta.totalSteps > 0;
                        const percentage = isProgressMeta
                            ? (meta.currentSteps / meta.totalSteps) * 100
                            : (meta.completed ? 100 : 0);

                        return (
                            <List.Item
                                key={meta.id}
                                style={{
                                    opacity: meta.completed ? 0.6 : 1,
                                    textDecoration: meta.completed ? 'line-through' : 'none',
                                    borderBottom: '1px solid var(--mantine-color-dark-5)',
                                    paddingBottom: '8px',
                                    marginBottom: '8px'
                                }}
                            >
                                <Box style={{ flexGrow: 1 }}>
                                    <Group position="apart">
                                        {isProgressMeta ? (
                                            <Text size="md" fw={500}>{meta.text}</Text>
                                        ) : (
                                            <Checkbox
                                                checked={meta.completed}
                                                onChange={() => toggleMetaCompleted(meta.id)}
                                                size="md"
                                                label={meta.text}
                                                color="teal"
                                            />
                                        )}
                                        <Group>
                                            {isProgressMeta && (
                                                <Text size="sm" c="dimmed">
                                                    {meta.currentSteps} / {meta.totalSteps} pasos
                                                </Text>
                                            )}
                                            {!meta.completed && ( // Solo mostrar el botón de editar si no está completada
                                                <ActionIcon
                                                    variant="light"
                                                    color="blue"
                                                    onClick={() => startEditMeta(meta)}
                                                    size="md"
                                                >
                                                    <IconEdit style={{ width: rem(16), height: rem(16) }} />
                                                </ActionIcon>
                                            )}
                                            <ActionIcon
                                                variant="light"
                                                color="red"
                                                onClick={() => handleDeleteMeta(meta.id)}
                                                size="md"
                                            >
                                                <IconTrash style={{ width: rem(16), height: rem(16) }} />
                                            </ActionIcon>
                                        </Group>
                                    </Group>

                                    {isProgressMeta && (
                                        <Box mt="xs">
                                            <Progress value={percentage} size="md" radius="xl"
                                                color={percentage < 50 ? 'red' : percentage < 99 ? 'yellow' : 'green'}
                                                label={`${percentage.toFixed(0)}%`}
                                            />
                                            <Group mt="xs" position="right" spacing="xs">
                                                <ActionIcon
                                                    variant="light"
                                                    color="blue"
                                                    onClick={() => updateMetaSteps(meta.id, -1)}
                                                    size="sm"
                                                    disabled={meta.currentSteps <= 0}
                                                >
                                                    <IconMinus style={{ width: rem(14), height: rem(14) }} />
                                                </ActionIcon>
                                                <ActionIcon
                                                    variant="light"
                                                    color="green"
                                                    onClick={() => updateMetaSteps(meta.id, 1)}
                                                    size="sm"
                                                    disabled={meta.currentSteps >= meta.totalSteps && meta.totalSteps > 0}
                                                >
                                                    <IconPlus style={{ width: rem(14), height: rem(14) }} />
                                                </ActionIcon>
                                            </Group>
                                        </Box>
                                    )}
                                </Box>
                            </List.Item>
                        );
                    })}
                </List>
            )}
        </Paper>
    );
}

export default MetasSection;