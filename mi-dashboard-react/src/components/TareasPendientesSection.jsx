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
    Badge
} from '@mantine/core';
import { IconListCheck, IconTrash, IconX } from '@tabler/icons-react';

import { cargarDatos, guardarDatos } from '../utils/localStorageUtils';

function TareasPendientesSection() {
    // Estado para la lista de tareas
    // Cada tarea: { id: string, text: string, completed: boolean }
    const [tareas, setTareas] = useState(() =>
        cargarDatos('tareasPendientes', [])
    );

    const [nuevaTareaTexto, setNuevaTareaTexto] = useState('');

    // Guarda las tareas en localStorage cada vez que cambian
    useEffect(() => {
        guardarDatos('tareasPendientes', tareas);
    }, [tareas]);

    // Manejador para añadir una nueva tarea
    const handleAddTarea = () => {
        if (nuevaTareaTexto.trim() === '') {
            alert('Por favor, ingresa una tarea.');
            return;
        }
        
         if (tareas.length >= 3) {
            alert('Ya tienes tus 3 tareas principales. Completa una antes de añadir otra.');
             return;
         }

        const nuevaTarea = {
            id: Date.now().toString(), // ID único
            text: nuevaTareaTexto.trim(),
            completed: false, // Por defecto no completada
        };
        setTareas([...tareas, nuevaTarea]);
        setNuevaTareaTexto(''); // Limpiar el input
    };

    // Manejador para alternar el estado de completado de una tarea
    const toggleTareaCompleted = (id) => {
        const updatedTareas = tareas.map(tarea =>
            tarea.id === id
                ? { ...tarea, completed: !tarea.completed }
                : tarea
        );
        setTareas(updatedTareas);
    };

    // Manejador para eliminar una tarea
    const handleDeleteTarea = (id) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
            const updatedTareas = tareas.filter(tarea => tarea.id !== id);
            setTareas(updatedTareas);
        }
    };

    const tareasCompletadasCount = tareas.filter(tarea => tarea.completed).length;
    const tareasPendientesCount = tareas.length - tareasCompletadasCount;

    return (
        <Paper shadow="sm" p="lg" withBorder radius="md">
            <Title order={2} ta="center" mb="md" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <IconListCheck size={28} />
                Tareas Pendientes del Dia
            </Title>

            <Group mb="md" grow>
                <TextInput
                    label="Nueva Tarea:"
                    placeholder="Ej. Enviar informe"
                    value={nuevaTareaTexto}
                    onChange={(event) => setNuevaTareaTexto(event.currentTarget.value)}
                />
                <Button onClick={handleAddTarea} variant="filled" color="indigo">
                    Añadir Tarea
                </Button>
            </Group>

            <Group position="apart" mb="md">
                <Badge color="green" size="lg" variant="light">
                    Completadas: {tareasCompletadasCount}
                </Badge>
                <Badge color="blue" size="lg" variant="light">
                    Pendientes: {tareasPendientesCount}
                </Badge>
            </Group>

            {tareas.length === 0 ? (
                <Text ta="center" c="dimmed" mt="xl">
                    ¡Sin tareas pendientes! Añade tus prioridades.
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
                            {/* CAMBIO CLAVE: Usamos Group con 'position="apart"' y 'width="100%"' */}
                            <Group position="apart" style={{ width: '100%' }}>
                                <Checkbox
                                    checked={tarea.completed}
                                    onChange={() => toggleTareaCompleted(tarea.id)}
                                    size="md"
                                    label={tarea.text}
                                    color="indigo"
                                    style={{ flexGrow: 1 }} 
                                />
                                <ActionIcon
                                    variant="light"
                                    color="red"
                                    onClick={() => handleDeleteTarea(tarea.id)}
                                    size="md"
                                >
                                    <IconTrash style={{ width: rem(16), height: rem(16) }} />
                                </ActionIcon>
                            </Group>
                        </List.Item>
                    ))}
                </List>
            )}
        </Paper>
    );
}

export default TareasPendientesSection;