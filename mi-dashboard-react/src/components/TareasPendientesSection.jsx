import React, { useState, useEffect } from 'react';
import {
    Paper,
    Title,
    Text,
    TextInput,
    Button,
    Group,
    List,
    Checkbox,
    ActionIcon,
    rem,
    Badge,
    Flex // Importar Flex para mejor control del layout
} from '@mantine/core';
// Importa el nuevo icono IconFileSpreadsheet
import { IconListCheck, IconTrash, IconX, IconFileSpreadsheet } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';

// Importa la función de exportación
import { cargarDatos, guardarDatos, exportToXlsxWithStyle } from '../utils/localStorageUtils';

function TareasPendientesSection() {
    const [tareas, setTareas] = useState(() =>
        cargarDatos('tareasPendientes', [])
    );
    const [nuevaTareaTexto, setNuevaTareaTexto] = useState('');

    useEffect(() => {
        guardarDatos('tareasPendientes', tareas);
    }, [tareas]);

    const handleAddTarea = () => {
        if (nuevaTareaTexto.trim() === '') {
            notifications.show({
                title: 'Error al Añadir Tarea',
                message: 'Por favor, ingresa un texto para la tarea.',
                color: 'red',
            });
            return;
        }
        
        const tareasNoCompletadas = tareas.filter(tarea => !tarea.completed).length;
        if (tareasNoCompletadas >= 3) {
            notifications.show({
                title: 'Límite de Tareas Alcanzado',
                message: 'Solo puedes tener hasta 3 tareas pendientes a la vez. ¡Completa o elimina una antes de añadir otra!',
                color: 'yellow',
            });
            return;
        }
        const nuevaTarea = {
            id: Date.now().toString(),
            text: nuevaTareaTexto.trim(),
            completed: false,
        };
        setTareas([...tareas, nuevaTarea]);
        setNuevaTareaTexto('');
        notifications.show({
            title: 'Tarea Añadida',
            message: `"${nuevaTarea.text}" ha sido añadida a tus tareas pendientes.`,
            color: 'green',
        });
    };

    const toggleTareaCompleted = (id) => {
        const updatedTareas = tareas.map(tarea =>
            tarea.id === id
                ? { ...tarea, completed: !tarea.completed }
                : tarea
        );
        setTareas(updatedTareas);
        const tareaToggle = tareas.find(tarea => tarea.id === id);
        if (tareaToggle && !tareaToggle.completed) {
              notifications.show({
                title: 'Tarea Completada',
                message: `¡Felicidades! "${tareaToggle.text}" ha sido marcada como completada.`,
                color: 'teal',
            });
        }
    };

    const handleDeleteTarea = (id) => {
        modals.openConfirmModal({
            title: 'Confirmar Eliminación',
            children: (
                <Text size="sm">
                    ¿Estás seguro de que quieres eliminar esta tarea? Esta acción no se puede deshacer.
                </Text>
            ),
            labels: { confirm: 'Sí, eliminar', cancel: 'No, cancelar' },
            confirmProps: { color: 'red' },
            onCancel: () => notifications.show({
                title: 'Eliminación Cancelada',
                message: 'La eliminación de la tarea fue cancelada.',
                color: 'gray',
            }),
            onConfirm: () => {
                const updatedTareas = tareas.filter(tarea => tarea.id !== id);
                setTareas(updatedTareas);
                notifications.show({
                    title: 'Tarea Eliminada',
                    message: 'La tarea ha sido borrada con éxito.',
                    color: 'blue',
                });
            },
        });
    };

    // --- NUEVA FUNCIÓN PARA EXPORTAR A EXCEL ---
    const handleExportTareas = () => {
        const dataForExport = tareas.map(tarea => ({
            'ID': tarea.id,
            'Tarea': tarea.text,
            'Estado': tarea.completed ? 'Completada' : 'Pendiente'
        }));

        exportToXlsxWithStyle(dataForExport, 'tareas_pendientes', 'Tareas');
    };

    const tareasCompletadasCount = tareas.filter(tarea => tarea.completed).length;
    const tareasActivas = tareas.filter(tarea => !tarea.completed);
    const tareasActivasCount = tareasActivas.length;

    return (
        <Paper shadow="sm" p="lg" withBorder radius="md">
            <Title order={2} ta="center" mb="md" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <IconListCheck size={28} />
                Tareas Pendientes del Día
            </Title>
            <Group mb="md" grow align="flex-end">
                <TextInput
                    label="Nueva Tarea:"
                    placeholder="Ej. Enviar informe"
                    value={nuevaTareaTexto}
                    onChange={(event) => setNuevaTareaTexto(event.currentTarget.value)}
                    onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                            handleAddTarea();
                        }
                    }}
                    style={{ flexGrow: 1 }}
                    description={`Máximo 3 tareas activas. Tareas actuales: ${tareasActivasCount}/3`}
                />
                <Button onClick={handleAddTarea} variant="filled" color="indigo" leftSection={<IconListCheck size={16} />}>
                    Añadir Tarea
                </Button>
            </Group>
            <Group position="apart" mb="md">
                <Badge color="green" size="lg" variant="light">
                    Completadas: {tareasCompletadasCount}
                </Badge>
                <Badge color="blue" size="lg" variant="light">
                    Activas: {tareasActivasCount}
                </Badge>
                
                {/* --- NUEVO BOTÓN PARA EXPORTAR --- */}
                {tareas.length > 0 && (
                    <Button
                        onClick={handleExportTareas}
                        leftSection={<IconFileSpreadsheet size={16} />}
                        variant="outline"
                        color="green"
                    >
                        Exportar
                    </Button>
                )}
            </Group>
            {tareas.length === 0 ? (
                <Text ta="center" c="dimmed" mt="xl">
                    ¡Sin tareas! ¿Listo para añadir tus prioridades del día?
                </Text>
            ) : (
                <List spacing="xs" size="sm" center>
                    {tareas.map((tarea) => (
                        <List.Item
                            key={tarea.id}
                            style={{
                                opacity: tarea.completed ? 0.6 : 1,
                                textDecoration: tarea.completed ? 'line-through' : 'none',
                                borderBottom: '1px solid var(--mantine-color-dark-5)',
                                paddingBottom: '8px',
                                marginBottom: '8px',
                            }}
                        >
                            <Flex justify="space-between" align="center" style={{ width: '100%' }}>
                                <Checkbox
                                    checked={tarea.completed}
                                    onChange={() => toggleTareaCompleted(tarea.id)}
                                    size="md"
                                    label={tarea.text}
                                    color="indigo"
                                    style={{ flexGrow: 1, marginRight: rem(10) }}
                                />
                                <ActionIcon
                                    variant="light"
                                    color="red"
                                    onClick={() => handleDeleteTarea(tarea.id)}
                                    size="md"
                                    aria-label={`Eliminar tarea "${tarea.text}"`}
                                    title="Eliminar tarea"
                                >
                                    <IconTrash style={{ width: rem(16), height: rem(16) }} />
                                </ActionIcon>
                            </Flex>
                        </List.Item>
                    ))}
                </List>
            )}
        </Paper>
    );
}

export default TareasPendientesSection;