// src/components/EstudioSection.jsx
import React, { useState, useEffect } from 'react';
import { NumberInput, Button, Box, Paper, Title, Group, Text, Textarea, Stack, ScrollArea, Center } from '@mantine/core';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title as ChartTitle, Tooltip, Legend } from 'chart.js';
import { notifications } from '@mantine/notifications';
// Importamos los iconos necesarios, incluyendo el de alarma
import { IconBook, IconFileSpreadsheet, IconTrash, IconAlarm } from '@tabler/icons-react';

// Importamos las funciones de localStorageUtils
import {
    cargarDatos,
    guardarDatos,
    getWeekNumber,
    exportToXlsxWithStyle
} from '../utils/localStorageUtils';

ChartJS.register(CategoryScale, LinearScale, BarElement, ChartTitle, Tooltip, Legend);

const labelsDiasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

// Función auxiliar para convertir minutos a un formato de horas y minutos
const formatMinutes = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    let parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0 || totalMinutes === 0) parts.push(`${minutes}m`);
    return parts.join(' ');
};

function EstudioSection() {
    // Nuevo estado para los registros de estudio (objetos detallados)
    const [estudioRecords, setEstudioRecords] = useState(() => {
        const datosGuardados = cargarDatos('estudioRecords', []);
        const ultimaActualizacion = cargarDatos('ultimaActualizacionEstudio', null);
        const hoy = new Date();
        const ultimoDiaGuardado = ultimaActualizacion ? new Date(ultimaActualizacion) : null;
        let datosIniciales = datosGuardados;

        if (ultimoDiaGuardado) {
            // Se usó 'esMismoCiclo' para mayor claridad y evitar ambigüedad.
            const esMismoCiclo = hoy.getFullYear() === ultimoDiaGuardado.getFullYear();
            const semanaHoy = getWeekNumber(hoy);
            const semanaUltimoGuardado = getWeekNumber(ultimoDiaGuardado);
            if (!esMismoCiclo || semanaHoy !== semanaUltimoGuardado) {
                console.log("Detectado cambio de semana/año para estudio, reiniciando registros.");
                notifications.show({
                    title: 'Semana de Estudio Reiniciada',
                    message: '¡Una nueva semana ha comenzado! Tus registros de estudio se han reiniciado.',
                    color: 'blue',
                    icon: <IconBook size={18} />,
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
        guardarDatos('estudioRecords', estudioRecords);
        guardarDatos('ultimaActualizacionEstudio', new Date().toISOString());
        console.log("Registros de estudio guardados en localStorage:", estudioRecords);
    }, [estudioRecords]);

    // --- NUEVA LÓGICA DE RECORDATORIOS ---
    useEffect(() => {
        const records = estudioRecords;
        const now = Date.now();
        const oneDayInMilliseconds = 24 * 60 * 60 * 1000;
        
        if (records.length > 0) {
            const lastRecord = records[records.length - 1];
            const lastRecordTime = new Date(lastRecord.date).getTime();
            
            // Si han pasado más de 24 horas desde el último registro, muestra la notificación.
            if (now - lastRecordTime > oneDayInMilliseconds) {
                notifications.show({
                    title: '¡Es hora de estudiar!',
                    message: 'Hace más de 24 horas que no registras tu tiempo de estudio. ¡A seguir aprendiendo!',
                    color: 'orange',
                    icon: <IconAlarm size={18} />,
                    autoClose: 10000, // La notificación se cerrará después de 10 segundos
                });
            }
        }
    }, [estudioRecords]);
    // --- FIN DE LA NUEVA LÓGICA DE RECORDATORIOS ---

    // Función para procesar los datos para el gráfico
    const processChartData = () => {
        const dataPorDia = [0, 0, 0, 0, 0, 0, 0];
        estudioRecords.forEach(record => {
            // Ajustamos para que la semana comience en Lunes (1) y termine en Domingo (0)
            const diaIndex = new Date(record.date).getDay();
            const ajustedIndex = diaIndex === 0 ? 6 : diaIndex - 1;
            // Sumamos los minutos
            dataPorDia[ajustedIndex] += record.durationMinutes;
        });
        return dataPorDia.map(minutos => (minutos / 60));
    };

    const chartData = {
        labels: labelsDiasSemana,
        datasets: [{
            label: 'Horas de Estudio',
            data: processChartData(),
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
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
            },
        },
        animation: {
            duration: 1000,
            easing: 'easeInOutQuad'
        }
    };

    const handleSaveEstudio = () => {
        // Se calcula la duración total en minutos para guardarla
        const totalMinutos = (inputHoras * 60) + inputMinutos;

        if (totalMinutos > 0 && descripcion.trim() !== '') {
            const newRecord = {
                date: new Date().toISOString(),
                durationMinutes: totalMinutos,
                description: descripcion.trim(),
            };
            setEstudioRecords(prevRecords => [...prevRecords, newRecord]);
            notifications.show({
                title: 'Estudio Registrado',
                // Se utiliza la función formatMinutes para mostrar la duración de forma consistente
                message: `Has registrado ${formatMinutes(totalMinutos)} de estudio.`,
                color: 'green',
                icon: <IconBook size={18} />,
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
        setEstudioRecords(prevRecords => prevRecords.filter(record => record.date !== recordId));
        notifications.show({
            title: 'Registro Eliminado',
            message: 'El registro de estudio ha sido eliminado correctamente.',
            color: 'red',
            icon: <IconTrash size={18} />,
        });
    };

    // Función para exportar los registros
    const handleExportEstudio = () => {
        const dataForExport = estudioRecords.map(record => ({
            'Fecha': new Date(record.date).toLocaleDateString(),
            'Día de la Semana': labelsDiasSemana[new Date(record.date).getDay() === 0 ? 6 : new Date(record.date).getDay() - 1],
            'Descripción': record.description,
            'Duración (minutos)': record.durationMinutes,
            'Duración (horas)': (record.durationMinutes / 60).toFixed(2)
        }));
        
        const sheetName = 'Registros de Estudio';
        const weekStart = new Date(new Date().setDate(new Date().getDate() - new Date().getDay())).toISOString().split('T')[0];
        const fileName = `registros_estudio_${weekStart}`;
        
        exportToXlsxWithStyle(dataForExport, fileName, sheetName);
    };

    return (
        <Paper shadow="sm" p="lg" withBorder radius="md">
            <Title order={2} ta="center" mb="md" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <IconBook size={28} />
                Registro de Estudio Semanal
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
                    placeholder="Ej. Repaso de álgebra, Lectura de un capítulo, etc."
                    value={descripcion}
                    onChange={(event) => setDescripcion(event.currentTarget.value)}
                    sx={{ flexGrow: 2 }}
                />
            </Group>
            
            <Group grow mb="md">
                <Button onClick={handleSaveEstudio} variant="filled" color="teal" leftSection={<IconBook size={16} />}>
                    Guardar Registro
                </Button>
                <Button
                    onClick={handleExportEstudio}
                    variant="outline"
                    color="green"
                    leftSection={<IconFileSpreadsheet size={16} />}
                >
                    Exportar Registros
                </Button>
            </Group>

            <Title order={3} ta="center" mt="xl" mb="md">Resumen Semanal</Title>
            <Box style={{ position: 'relative', height: '300px', width: '100%' }} mb="md">
                {estudioRecords.length > 0 ? (
                    <Bar data={chartData} options={chartOptions} />
                ) : (
                    <Center style={{ height: '100%' }}>
                        <Text c="dimmed">Registra tus horas de estudio para ver el gráfico.</Text>
                    </Center>
                )}
            </Box>
            
            <Title order={4} ta="left" mt="lg" mb="sm">Historial de Registros</Title>
            <ScrollArea h={200} type="always">
                <Stack spacing="xs">
                    {estudioRecords.length > 0 ? (
                        [...estudioRecords].reverse().map((record, index) => (
                            <Paper key={index} p="xs" withBorder>
                                <Group justify="space-between">
                                    <Text fw={700}>
                                        {new Date(record.date).toLocaleDateString()} ({labelsDiasSemana[new Date(record.date).getDay() === 0 ? 6 : new Date(record.date).getDay() - 1]})
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
                                <Text size="sm" c="dimmed">
                                    Duración: {formatMinutes(record.durationMinutes)}
                                </Text>
                            </Paper>
                        ))
                    ) : (
                        <Text c="dimmed" ta="center">Aún no hay registros de estudio para esta semana.</Text>
                    )}
                </Stack>
            </ScrollArea>
        </Paper>
    );
}

export default EstudioSection;
