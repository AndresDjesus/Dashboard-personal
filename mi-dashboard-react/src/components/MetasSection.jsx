// src/components/MetasSection.jsx
import React, { useState, useEffect } from 'react';
import { 
    Paper, Title, Text, TextInput, Button, Group, List, Checkbox, ActionIcon, rem, Box, Badge, NumberInput, Progress, Select 
} from '@mantine/core';
import { 
    IconTarget, IconCheck, IconTrash, IconEdit, IconX, IconPlus, IconMinus, IconFilter 
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications'; // Importar notificaciones
import { modals } from '@mantine/modals';           // Importar modales

import { cargarDatos, guardarDatos } from '../utils/localStorageUtils'; // Asegúrate de que estas funciones existan

function MetasSection() {
    // Estado para la lista de metas
    // Cada meta puede ser: { id: string, text: string, completed: boolean, totalSteps?: number, currentSteps?: number }
    const [metas, setMetas] = useState(() =>
        cargarDatos('metasPersonales', [])
    );

    // Estados para el formulario de añadir/editar
    const [metaInputTexto, setMetaInputTexto] = useState(''); // Usado para añadir o editar el texto
    const [metaInputTotalPasos, setMetaInputTotalPasos] = useState(0);
    const [metaInputCurrentPasos, setMetaInputCurrentPasos] = useState(0);
    const [editandoMetaId, setEditandoMetaId] = useState(null); // ID de la meta que se está editando

    // Estado para el filtro de metas
    const [filtroEstado, setFiltroEstado] = useState('todas'); // 'todas', 'pendientes', 'completadas'

    // Guarda las metas en localStorage cada vez que cambian
    useEffect(() => {
        guardarDatos('metasPersonales', metas);
    }, [metas]);

    // Limpia los campos del formulario
    const resetForm = () => {
        setMetaInputTexto('');
        setMetaInputTotalPasos(0);
        setMetaInputCurrentPasos(0);
        setEditandoMetaId(null);
    };

    // Manejador para añadir o actualizar una meta
    const handleAddOrUpdateMeta = () => {
        if (metaInputTexto.trim() === '') {
            notifications.show({
                title: 'Error',
                message: 'La descripción de la meta no puede estar vacía.',
                color: 'red',
            });
            return;
        }
        
        const isProgressMeta = metaInputTotalPasos > 0;

        if (editandoMetaId) {
            // Actualizar meta existente
            const updatedMetas = metas.map(meta => {
                if (meta.id === editandoMetaId) {
                    const updatedMeta = { ...meta, text: metaInputTexto.trim() };
                    if (isProgressMeta) {
                        updatedMeta.totalSteps = metaInputTotalPasos;
                        // Asegurarse de que currentSteps no exceda totalSteps
                        updatedMeta.currentSteps = Math.min(metaInputCurrentPasos, metaInputTotalPasos);
                        updatedMeta.completed = updatedMeta.currentSteps >= updatedMeta.totalSteps;
                    } else {
                        // Si era una meta con pasos y la editamos sin pasos, quitamos los campos
                        delete updatedMeta.totalSteps;
                        delete updatedMeta.currentSteps;
                        updatedMeta.completed = false; // Una meta simple no puede estar completada por pasos si los quitamos
                    }
                    return updatedMeta;
                }
                return meta;
            });
            setMetas(updatedMetas);
            notifications.show({
                title: 'Meta Actualizada',
                message: 'La meta ha sido modificada con éxito.',
                color: 'blue',
            });
        } else {
            // Añadir nueva meta
            const nuevaMeta = {
                id: Date.now().toString(),
                text: metaInputTexto.trim(),
                completed: false,
            };
            if (isProgressMeta) {
                nuevaMeta.totalSteps = metaInputTotalPasos;
                nuevaMeta.currentSteps = Math.min(metaInputCurrentPasos, metaInputTotalPasos);
                if (nuevaMeta.currentSteps >= nuevaMeta.totalSteps) {
                    nuevaMeta.completed = true;
                }
            }
            setMetas([...metas, nuevaMeta]);
            notifications.show({
                title: 'Meta Añadida',
                message: 'Nueva meta registrada. ¡A por ella!',
                color: 'green',
            });
        }
        resetForm(); // Limpiar el formulario
    };

    // Manejador para alternar el estado de completado de una meta simple (sin pasos)
    const toggleMetaCompleted = (id) => {
        setMetas(prevMetas => prevMetas.map(meta => {
            if (meta.id === id && typeof meta.totalSteps === 'undefined') { // Solo para metas sin progreso
                notifications.show({
                    title: meta.completed ? 'Meta Desmarcada' : '¡Meta Completada!',
                    message: meta.completed ? 'Has desmarcado la meta.' : '¡Felicidades por completar tu meta!',
                    color: meta.completed ? 'orange' : 'teal',
                });
                return { ...meta, completed: !meta.completed };
            }
            return meta;
        }));
    };

    // Incrementa/decrementa los pasos de una meta con progreso
    const updateMetaSteps = (id, change) => {
        setMetas(prevMetas => prevMetas.map(meta => {
            if (meta.id === id && typeof meta.totalSteps !== 'undefined') {
                const newSteps = Math.max(0, Math.min(meta.totalSteps, meta.currentSteps + change));
                const newCompleted = newSteps >= meta.totalSteps && meta.totalSteps > 0;

                if (!meta.completed && newCompleted) {
                    notifications.show({
                        title: '¡Meta Completada por Pasos!',
                        message: `Has alcanzado todos los pasos para "${meta.text}". ¡Bien hecho!`,
                        color: 'teal',
                    });
                } else if (meta.completed && !newCompleted) {
                    notifications.show({
                        title: 'Progreso Ajustado',
                        message: `Has ajustado los pasos de "${meta.text}".`,
                        color: 'orange',
                    });
                }
                return {
                    ...meta,
                    currentSteps: newSteps,
                    completed: newCompleted,
                };
            }
            return meta;
        }));
    };

    // Manejador para eliminar una meta
    const handleDeleteMeta = (id) => {
        modals.openConfirmModal({
            title: 'Confirmar Eliminación',
            children: (
                <Text size="sm">
                    ¿Estás seguro de que quieres eliminar esta meta? Esta acción no se puede deshacer.
                </Text>
            ),
            labels: { confirm: 'Sí, eliminar', cancel: 'No, cancelar' },
            confirmProps: { color: 'red' },
            onCancel: () => notifications.show({
                title: 'Eliminación Cancelada',
                message: 'La eliminación de la meta fue cancelada.',
                color: 'gray',
            }),
            onConfirm: () => {
                setMetas(prevMetas => prevMetas.filter(meta => meta.id !== id));
                resetForm(); // Limpiar el estado de edición si eliminamos la que se estaba editando
                notifications.show({
                    title: 'Meta Eliminada',
                    message: 'La meta ha sido borrada con éxito.',
                    color: 'blue',
                });
            },
        });
    };

    // Manejador para iniciar la edición de una meta
    const startEditMeta = (meta) => {
        setEditandoMetaId(meta.id);
        setMetaInputTexto(meta.text);
        setMetaInputTotalPasos(meta.totalSteps || 0);
        setMetaInputCurrentPasos(meta.currentSteps || 0);
    };

    // Filtrar metas según el estado seleccionado
    const metasFiltradas = metas.filter(meta => {
        if (filtroEstado === 'pendientes') {
            return !meta.completed;
        }
        if (filtroEstado === 'completadas') {
            return meta.completed;
        }
        return true; // 'todas'
    });

    const metasCompletadasCount = metas.filter(meta => meta.completed).length;
    const metasPendientesCount = metas.filter(meta => !meta.completed).length;

    return (
        <Paper shadow="sm" p="lg" withBorder radius="md">
            <Title order={2} ta="center" mb="md" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <IconTarget size={28} />
                Mis Metas Personales
            </Title>

            <Group mb="md" grow>
                <TextInput
                    label={editandoMetaId ? "Editando Meta:" : "Nueva Meta:"}
                    placeholder={editandoMetaId ? "Actualiza tu meta" : "Ej. Leer 10 libros este año"}
                    value={metaInputTexto}
                    onChange={(event) => setMetaInputTexto(event.currentTarget.value)}
                    rightSection={
                        editandoMetaId && (
                            <ActionIcon onClick={resetForm} size="lg" variant="subtle" color="gray" title="Cancelar edición">
                                <IconX style={{ width: rem(18), height: rem(18) }} />
                            </ActionIcon>
                        )
                    }
                    style={{ flexGrow: 2 }}
                />
                <Button 
                    onClick={handleAddOrUpdateMeta} 
                    variant="filled" 
                    color="grape" 
                    leftSection={editandoMetaId ? <IconEdit size={rem(18)} /> : <IconPlus size={rem(18)} />}
                    style={{ flexGrow: 1 }}
                >
                    {editandoMetaId ? 'Actualizar Meta' : 'Añadir Meta'}
                </Button>
            </Group>

            {/* Campos para metas con progreso */}
            <Group grow mb="md">
                <NumberInput
                    label="Total de Pasos:"
                    placeholder="0"
                    min={0}
                    value={metaInputTotalPasos}
                    onChange={(value) => setMetaInputTotalPasos(value)}
                    description="Deja en 0 para una meta simple (marcar como completada/pendiente)."
                    style={{ flexGrow: 1 }}
                />
                { metaInputTotalPasos > 0 && (
                    <NumberInput
                        label="Pasos Actuales:"
                        placeholder="0"
                        min={0}
                        max={metaInputTotalPasos}
                        value={metaInputCurrentPasos}
                        onChange={(value) => setMetaInputCurrentPasos(value)}
                        style={{ flexGrow: 1 }}
                    />
                )}
            </Group>

            <Group position="apart" mb="md" grow>
                <Badge color="green" size="lg" variant="light">
                    Completadas: {metasCompletadasCount}
                </Badge>
                <Badge color="blue" size="lg" variant="light">
                    Pendientes: {metasPendientesCount}
                </Badge>
                <Select
                    label="Filtrar por:"
                    placeholder="Todas"
                    data={[
                        { value: 'todas', label: 'Todas las metas' },
                        { value: 'pendientes', label: 'Metas pendientes' },
                        { value: 'completadas', label: 'Metas completadas' },
                    ]}
                    value={filtroEstado}
                    onChange={setFiltroEstado}
                    leftSection={<IconFilter size={rem(16)} />}
                    style={{ flexGrow: 1 }}
                />
            </Group>

            {metas.length === 0 ? (
                <Text ta="center" c="dimmed" mt="xl">
                    Aún no tienes metas. ¡Añade algunas para empezar!
                </Text>
            ) : (
                <List spacing="xs" size="sm" center>
                    {metasFiltradas.map((meta) => {
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
                                    <Group position="apart" align="center">
                                        {isProgressMeta ? (
                                            <Text size="md" fw={500} style={{ flexGrow: 1 }}>{meta.text}</Text>
                                        ) : (
                                            <Checkbox
                                                checked={meta.completed}
                                                onChange={() => toggleMetaCompleted(meta.id)}
                                                size="md"
                                                label={<Text size="md" fw={500}>{meta.text}</Text>}
                                                color="teal"
                                                style={{ flexGrow: 1 }}
                                            />
                                        )}
                                        <Group spacing="xs">
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
                                                    title="Editar meta"
                                                >
                                                    <IconEdit style={{ width: rem(16), height: rem(16) }} />
                                                </ActionIcon>
                                            )}
                                            <ActionIcon
                                                variant="light"
                                                color="red"
                                                onClick={() => handleDeleteMeta(meta.id)}
                                                size="md"
                                                title="Eliminar meta"
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
                                                    disabled={meta.currentSteps <= 0 || meta.completed}
                                                    title="Disminuir pasos"
                                                >
                                                    <IconMinus style={{ width: rem(14), height: rem(14) }} />
                                                </ActionIcon>
                                                <ActionIcon
                                                    variant="light"
                                                    color="green"
                                                    onClick={() => updateMetaSteps(meta.id, 1)}
                                                    size="sm"
                                                    disabled={meta.currentSteps >= meta.totalSteps && meta.totalSteps > 0 || meta.completed}
                                                    title="Aumentar pasos"
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