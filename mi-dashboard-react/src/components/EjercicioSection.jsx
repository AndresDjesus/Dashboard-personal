import React, { useState, useEffect } from 'react';
import { NumberInput, Button, Box, Paper, Title, Group, Text, Textarea, Stack, ScrollArea } from '@mantine/core';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title as ChartTitle, Tooltip, Legend } from 'chart.js';
import { notifications } from '@mantine/notifications';
import { IconBarbell, IconFileSpreadsheet, IconTrash } from '@tabler/icons-react';

// Importa las funciones de localStorageUtils
import { cargarDatos, guardarDatos, getWeekNumber, exportToXlsxWithStyle } from '../utils/localStorageUtils';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ChartTitle, Tooltip, Legend);

// Etiqueta de los días de la semana. Se mantiene el inicio en Domingo para el gráfico de líneas.
const labelsDiasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

// Función auxiliar para convertir minutos a un formato de horas y minutos
const formatMinutes = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    let parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0 || totalMinutes === 0) parts.push(`${minutes}m`); // Si son 0 minutos, mostrar 0m
    return parts.join(' ');
};

function EjercicioSection() {
    // Nuevo estado para los registros de entrenamiento (objetos detallados)
    const [weeklyRecords, setWeeklyRecords] = useState(() => {
        const datosGuardados = cargarDatos('weeklyExerciseRecords', []);
        const ultimaActualizacion = cargarDatos('ultimaActualizacionEjercicio', null);
        const hoy = new Date();
        const ultimoDiaGuardado = ultimaActualizacion ? new Date(ultimaActualizacion) : null;
        let datosIniciales = datosGuardados;

        if (ultimoDiaGuardado) {
            const esMismoCiclo = hoy.getFullYear() === ultimoDiaGuardado.getFullYear();
            const semanaHoy = getWeekNumber(hoy);
            const semanaUltimoGuardado = getWeekNumber(ultimoDiaGuardado);
            if (!esMismoCiclo || semanaHoy !== semanaUltimoGuardado) {
                console.log("Detectado cambio de semana/año, reiniciando registros de ejercicio.");
                notifications.show({
                    title: 'Semana de Ejercicio Reiniciada',
                    message: '¡Una nueva semana ha comenzado! Tus horas de ejercicio se han reiniciado.',
                    color: 'blue',
                    icon: <IconBarbell size={18} />,
                    autoClose: 5000,
                });
                datosIniciales = [];
            }
        }
        return datosIniciales;
    });

    const [inputHoras, setInputHoras] = useState(0);
    const [inputMinutos, setInputMinutos] = useState(0);
    const [descripcion, setDescripcion] = useState('');

    useEffect(() => {
        guardarDatos('weeklyExerciseRecords', weeklyRecords);
        guardarDatos('ultimaActualizacionEjercicio', new Date().toISOString());
        console.log("Registros de ejercicio guardados en localStorage:", weeklyRecords);
    }, [weeklyRecords]);

    // Función para procesar los datos para el gráfico
    const processChartData = () => {
        const dataPorDia = [0, 0, 0, 0, 0, 0, 0];
        
        if (Array.isArray(weeklyRecords)) {
            weeklyRecords.forEach(record => {
                const diaIndex = new Date(record.date).getDay();
                // Sumamos los minutos
                dataPorDia[diaIndex] += record.durationMinutes;
            });
        }

        // Convertir minutos totales a horas para el gráfico
        return dataPorDia.map(minutos => (minutos / 60));
    };

    const chartData = {
        labels: labelsDiasSemana,
        datasets: [{
            label: 'Horas de Ejercicio',
            data: processChartData(),
            backgroundColor: 'rgba(153, 102, 255, 0.6)',
            borderColor: 'rgba(153, 102, 255, 1)',
            borderWidth: 2,
            fill: false,
            tension: 0.3,
            pointBackgroundColor: 'rgba(153, 102, 255, 1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(153, 102, 255, 1)',
        }],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Horas'
                },
                ticks: {
                    precision: 0
                }
            },
            x: {
                title: {
                    display: true,
                    text: 'Día de la Semana'
                }
            }
        },
        plugins: {
            legend: {
                display: true,
                position: 'top',
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        return context.dataset.label + ': ' + context.parsed.y.toFixed(1) + ' horas';
                    }
                }
            }
        },
        animation: {
            duration: 1000,
            easing: 'easeInOutQuad'
        }
    };

    const handleSaveEjercicio = () => {
        const totalMinutos = (inputHoras * 60) + inputMinutos;

        if (totalMinutos > 0 && descripcion.trim() !== '') {
            const newRecord = {
                date: new Date().toISOString(),
                durationMinutes: totalMinutos,
                description: descripcion.trim(),
            };
            setWeeklyRecords(prevRecords => [...(Array.isArray(prevRecords) ? prevRecords : []), newRecord]);
            notifications.show({
                title: 'Entrenamiento Registrado',
                message: `Has registrado ${formatMinutes(totalMinutos)} de ejercicio.`,
                color: 'green',
                icon: <IconBarbell size={18} />,
            });
            // Limpiar los inputs
            setInputHoras(0);
            setInputMinutos(0);
            setDescripcion('');
        } else {
            notifications.show({
                title: 'Error de Entrada',
                message: 'Por favor, ingresa una duración mayor a cero y una descripción.',
                color: 'red',
            });
        }
    };

    // Función para eliminar un registro
    const handleDeleteRecord = (recordId) => {
        setWeeklyRecords(prevRecords => prevRecords.filter(record => record.date !== recordId));
        notifications.show({
            title: 'Entrenamiento Eliminado',
            message: 'El registro de entrenamiento ha sido eliminado correctamente.',
            color: 'red',
            icon: <IconTrash size={18} />,
        });
    };

    const handleExportEjercicio = () => {
        const dataForExport = weeklyRecords.map(record => ({
            'Fecha': new Date(record.date).toLocaleDateString(),
            'Día de la Semana': labelsDiasSemana[new Date(record.date).getDay()],
            'Descripción': record.description,
            'Duración (minutos)': record.durationMinutes,
            'Duración (horas)': (record.durationMinutes / 60).toFixed(2)
        }));
        
        const sheetName = 'Registros de Ejercicio';
        const weekStart = new Date(new Date().setDate(new Date().getDate() - new Date().getDay())).toISOString().split('T')[0];
        const fileName = `registros_ejercicio_${weekStart}`;
        
        exportToXlsxWithStyle(dataForExport, fileName, sheetName);
    };

    return (
        <Paper shadow="sm" p="lg" withBorder radius="md">
            <Title order={2} ta="center" mb="md" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <IconBarbell size={28} />
                Registro de Entrenamiento Semanal
            </Title>

            <Group grow mt="md" mb="md" align="flex-end">
                <NumberInput
                    label="Horas:"
                    placeholder="0"
                    min={0}
                    value={inputHoras}
                    onChange={val => setInputHoras(val || 0)}
                    sx={{ flexGrow: 1 }}
                />
                <NumberInput
                    label="Minutos:"
                    placeholder="0"
                    min={0}
                    max={59}
                    value={inputMinutos}
                    onChange={val => setInputMinutos(val || 0)}
                    sx={{ flexGrow: 1 }}
                />
                <Textarea
                    label="Descripción:"
                    placeholder="Ej. Caminata de 30 min, Levantamiento de pesas, etc."
                    value={descripcion}
                    onChange={(event) => setDescripcion(event.currentTarget.value)}
                    sx={{ flexGrow: 2 }}
                />
            </Group>
            
            <Group grow mb="md">
                <Button onClick={handleSaveEjercicio} variant="filled" color="grape" leftSection={<IconBarbell size={16} />}>
                    Guardar Registro
                </Button>
                <Button
                    onClick={handleExportEjercicio}
                    variant="outline"
                    color="green"
                    leftSection={<IconFileSpreadsheet size={16} />}
                >
                    Exportar Registros
                </Button>
            </Group>

            <Title order={3} ta="center" mt="xl" mb="md">Resumen Semanal</Title>
            <Box style={{ position: 'relative', height: '300px', width: '100%' }} mb="md">
                <Line data={chartData} options={chartOptions} />
            </Box>
            
            <Title order={4} ta="left" mt="lg" mb="sm">Historial de Registros</Title>
            <ScrollArea h={200} type="always">
                <Stack spacing="xs">
                    {weeklyRecords && weeklyRecords.length > 0 ? (
                        [...weeklyRecords].reverse().map((record, index) => (
                            <Paper key={index} p="xs" withBorder>
                                <Group justify="space-between">
                                    <Text fw={700}>
                                        {new Date(record.date).toLocaleDateString()} ({labelsDiasSemana[new Date(record.date).getDay()]})
                                    </Text>
                                    <Button
                                        variant="subtle"
                                        color="red"
                                        size="xs"
                                        onClick={() => handleDeleteRecord(record.date)}
                                        leftSection={<IconTrash size={14} />}
                                    >
                                        Eliminar
                                    </Button>
                                </Group>
                                <Text size="sm">{record.description}</Text>
                                <Text size="sm" c="dimmed">Duración: {formatMinutes(record.durationMinutes)}</Text>
                            </Paper>
                        ))
                    ) : (
                        <Text c="dimmed" ta="center">Aún no hay registros de entrenamiento para esta semana.</Text>
                    )}
                </Stack>
            </ScrollArea>
        </Paper>
    );
}

export default EjercicioSection;
