// src/components/EstadoAnimoSection.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Paper, Title, Text, Group, Rating, Button, Center, Box, useMantineTheme, rem } from '@mantine/core';
import { IconChartLine, IconMoodHappy } from '@tabler/icons-react'; // Añadido IconMoodHappy para el título
import { notifications } from '@mantine/notifications'; // Importar notificaciones

import {
    cargarDatos,
    guardarDatos,
    getTodayFormattedDate, // <-- ¡Asegúrate de que esta función exista en localStorageUtils!
    getStartOfWeek,
    getDiasSemanaNombres
} from '../utils/localStorageUtils';

import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title as ChartTitle, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';

// Registra los componentes de Chart.js necesarios
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ChartTitle, Tooltip, Legend);

// Definición de emojis para el Rating
const moodEmojis = [
    '😞', // 1: Muy Mal
    '😔', // 2: Mal
    '😐', // 3: Neutral
    '😊', // 4: Bien
    '😄'  // 5: Excelente
];

function EstadoAnimoSection() {
    const theme = useMantineTheme();

    const [estadoAnimoSemana, setEstadoAnimoSemana] = useState(() => {
        const data = cargarDatos('estadoAnimoSemana', { weekStartDate: '', dailyMoods: {} });
        const currentWeekStartFormatted = getStartOfWeek().toISOString().split('T')[0];

        // Reinicia si la semana almacenada no es la semana actual
        if (data.weekStartDate !== currentWeekStartFormatted) {
            console.log('¡Nueva semana detectada! Reiniciando estados de ánimo.');
            // Muestra una notificación si se reinicia la semana
            notifications.show({
                title: 'Reinicio Semanal de Ánimo',
                message: 'Una nueva semana ha comenzado. ¡Registra tu estado de ánimo diario!',
                color: 'blue',
                icon: <IconMoodHappy size={18} />,
                autoClose: 5000,
            });
            return { weekStartDate: currentWeekStartFormatted, dailyMoods: {} };
        }
        return data;
    });

    const diaActualFormatted = getTodayFormattedDate(); // Obtiene la fecha actual en YYYY-MM-DD
    const [rating, setRating] = useState(estadoAnimoSemana.dailyMoods[diaActualFormatted] || 0);

    const chartRef = useRef(null);

    // Guarda el estado de ánimo en localStorage cada vez que cambia
    useEffect(() => {
        guardarDatos('estadoAnimoSemana', estadoAnimoSemana);
    }, [estadoAnimoSemana]);

    // Efecto para actualizar el rating actual si el día cambia o se carga el componente
    useEffect(() => {
        setRating(estadoAnimoSemana.dailyMoods[diaActualFormatted] || 0);
    }, [diaActualFormatted, estadoAnimoSemana.dailyMoods]);


    // Efecto para reiniciar los estados de ánimo si la semana cambia
    useEffect(() => {
        const checkWeekChange = () => {
            const currentWeekStartFormatted = getStartOfWeek().toISOString().split('T')[0];
            if (estadoAnimoSemana.weekStartDate !== currentWeekStartFormatted) {
                setEstadoAnimoSemana({ weekStartDate: currentWeekStartFormatted, dailyMoods: {} });
            }
        };

        checkWeekChange();
        // Comprobar cada hora (60 minutos * 60 segundos * 1000 milisegundos)
        const intervalId = setInterval(checkWeekChange, 60 * 60 * 1000);

        return () => clearInterval(intervalId);
    }, [estadoAnimoSemana.weekStartDate]);


    const handleSaveMood = () => {
        if (rating === 0) {
            notifications.show({
                title: 'Error de Registro',
                message: 'Por favor, selecciona tu estado de ánimo antes de registrar.',
                color: 'red',
            });
            return;
        }
        setEstadoAnimoSemana(prev => {
            const newDailyMoods = { ...prev.dailyMoods };
            newDailyMoods[diaActualFormatted] = rating;
            notifications.show({
                title: 'Estado de Ánimo Registrado',
                message: `Tu ánimo de hoy (${moodEmojis[rating - 1]}) ha sido guardado.`,
                color: 'green',
            });
            return { ...prev, dailyMoods: newDailyMoods };
        });
    };

    // Función auxiliar para obtener las fechas de la semana actual (Lunes a Domingo)
    // Retorna un array de strings 'YYYY-MM-DD'
    const getFechasSemanaActual = () => {
        const startOfWeek = getStartOfWeek(); // Esto DEBE retornar un objeto Date
        const dates = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek); // Clonar la fecha para no modificar el original
            date.setDate(startOfWeek.getDate() + i); // Añadir i días
            dates.push(date.toISOString().split('T')[0]); // Formato YYYY-MM-DD
        }
        return dates;
    };

    const fechasSemana = getFechasSemanaActual();
    const diasSemanaNombres = getDiasSemanaNombres();

    const chartData = {
        labels: diasSemanaNombres, // Etiquetas X: Nombres de los días de la semana
        datasets: [
            {
                label: 'Estado de Ánimo',
                // Data: mapea las fechas generadas a los datos guardados
                data: fechasSemana.map(date => {
                    const value = estadoAnimoSemana.dailyMoods[date] || 0;
                    return value;
                }),
                borderColor: theme.colors.grape[6],
                backgroundColor: theme.colors.grape[3],
                tension: 0.4,
                pointBackgroundColor: theme.colors.grape[6],
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: theme.colors.grape[6],
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false, // Permite que el gráfico se ajuste al contenedor
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const value = context.raw;
                        const moodLabels = {
                            1: '😞 Muy Mal',
                            2: '😔 Mal',
                            3: '😐 Neutral',
                            4: '😊 Bien',
                            5: '😄 Excelente'
                        };
                        return `Estado de Ánimo: ${moodLabels[value] || 'No registrado'}`;
                    }
                }
            }
        },
        scales: {
            y: {
                min: 0,
                max: 5,
                ticks: {
                    stepSize: 1,
                    callback: function(value) {
                        const moodLabels = {
                            0: '', // Para el 0 si no hay registro
                            1: '😞',
                            2: '😔',
                            3: '😐',
                            4: '😊',
                            5: '😄'
                        };
                        return moodLabels[value] || '';
                    },
                    font: {
                        size: 16
                    }
                },
                grid: {
                    color: theme.colors.dark[4],
                },
            },
            x: {
                grid: {
                    color: theme.colors.dark[4],
                },
                ticks: {
                    font: {
                        size: 12
                    }
                }
            },
        },
    };

    return (
        <Paper shadow="sm" p="lg" withBorder radius="md">
            <Title order={2} ta="center" mb="md" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <IconChartLine size={28} />
                Mi Estado de Ánimo Semanal
            </Title>

            <Center mb="md">
                <Text size="lg" fw={500} mr="sm">¿Cómo te sientes hoy?</Text>
                <Rating
                    value={rating}
                    onChange={setRating}
                    count={5}
                    renderStar={(state) => {
                        return moodEmojis[state.value - 1];
                    }}
                />
            </Center>
            <Center mb="lg">
                <Button onClick={handleSaveMood} disabled={rating === 0} variant="filled" color="grape">
                    Registrar Ánimo
                </Button>
            </Center>

            <Text size="sm" c="dimmed" ta="center" mb="lg">
                Tu estado de ánimo promedio esta semana:
            </Text>

            <Box style={{ height: rem(250) }}>
                {estadoAnimoSemana.dailyMoods && Object.keys(estadoAnimoSemana.dailyMoods).length > 0 ? (
                    <Line ref={chartRef} data={chartData} options={chartOptions} />
                ) : (
                    <Center style={{ height: '100%' }}>
                        <Text c="dimmed">Registra tu estado de ánimo para ver el gráfico.</Text>
                    </Center>
                )}
            </Box>
        </Paper>
    );
}

export default EstadoAnimoSection;