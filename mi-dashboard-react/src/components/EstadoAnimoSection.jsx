// src/components/EstadoAnimoSection.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Paper, Title, Text, Group, Rating, Button, Center, Box, useMantineTheme, rem } from '@mantine/core';
// Importa el nuevo icono para el botón de exportar
import { IconChartLine, IconMoodHappy, IconFileSpreadsheet } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';

import {
    cargarDatos,
    guardarDatos,
    getTodayFormattedDate,
    getStartOfWeek,
    getDiasSemanaNombres,
    exportToXlsxWithStyle // <-- ¡La nueva función!
} from '../utils/localStorageUtils';

import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title as ChartTitle, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ChartTitle, Tooltip, Legend);

const moodEmojis = [
    '😞',
    '😔',
    '😐',
    '😊',
    '😄'
];
const moodLabels = {
    1: 'Muy Mal',
    2: 'Mal',
    3: 'Neutral',
    4: 'Bien',
    5: 'Excelente'
};

function EstadoAnimoSection() {
    const theme = useMantineTheme();
    const [estadoAnimoSemana, setEstadoAnimoSemana] = useState(() => {
        const data = cargarDatos('estadoAnimoSemana', { weekStartDate: '', dailyMoods: {} });
        const currentWeekStartFormatted = getStartOfWeek().toISOString().split('T')[0];
        if (data.weekStartDate !== currentWeekStartFormatted) {
            console.log('¡Nueva semana detectada! Reiniciando estados de ánimo.');
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

    const diaActualFormatted = getTodayFormattedDate();
    const [rating, setRating] = useState(estadoAnimoSemana.dailyMoods[diaActualFormatted] || 0);
    const chartRef = useRef(null);

    useEffect(() => {
        guardarDatos('estadoAnimoSemana', estadoAnimoSemana);
    }, [estadoAnimoSemana]);

    useEffect(() => {
        setRating(estadoAnimoSemana.dailyMoods[diaActualFormatted] || 0);
    }, [diaActualFormatted, estadoAnimoSemana.dailyMoods]);

    useEffect(() => {
        const checkWeekChange = () => {
            const currentWeekStartFormatted = getStartOfWeek().toISOString().split('T')[0];
            if (estadoAnimoSemana.weekStartDate !== currentWeekStartFormatted) {
                setEstadoAnimoSemana({ weekStartDate: currentWeekStartFormatted, dailyMoods: {} });
            }
        };
        checkWeekChange();
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
    const getFechasSemanaActual = () => {
        const startOfWeek = getStartOfWeek();
        const dates = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            dates.push(date.toISOString().split('T')[0]);
        }
        return dates;
    };

    const fechasSemana = getFechasSemanaActual();
    const diasSemanaNombres = getDiasSemanaNombres();

    const chartData = {
        labels: diasSemanaNombres,
        datasets: [
            {
                label: 'Estado de Ánimo',
                data: fechasSemana.map(date => estadoAnimoSemana.dailyMoods[date] || 0),
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
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const value = context.raw;
                        const moodText = moodLabels[value] || 'No registrado';
                        return `Estado de Ánimo: ${moodText} (${value || 0}/5)`;
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
                        return moodEmojis[value - 1] || '';
                    },
                    font: { size: 16 }
                },
                grid: { color: theme.colors.dark[4] },
            },
            x: {
                grid: { color: theme.colors.dark[4] },
                ticks: { font: { size: 12 } },
            },
        },
    };

    // --- NUEVA FUNCIÓN PARA EXPORTAR A EXCEL ---
    const handleExportEstadoAnimo = () => {
        const dataForExport = fechasSemana.map((date, index) => {
            const moodValue = estadoAnimoSemana.dailyMoods[date] || 0;
            const moodText = moodLabels[moodValue] || 'No registrado';
            return {
                'Día de la Semana': diasSemanaNombres[index],
                'Fecha': date,
                'Estado de Ánimo': moodText,
                'Calificación': moodValue
            };
        });

        const sheetName = 'Estado de Ánimo';
        const fileName = `estado_animo_${estadoAnimoSemana.weekStartDate}`;
        
        exportToXlsxWithStyle(dataForExport, fileName, sheetName);
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
                    renderStar={(state) => moodEmojis[state.value - 1]}
                />
            </Center>
            <Center mb="lg">
                <Group>
                    <Button onClick={handleSaveMood} disabled={rating === 0} variant="filled" color="grape" leftSection={<IconMoodHappy size={16} />}>
                        Registrar Ánimo
                    </Button>
                    {/* --- NUEVO BOTÓN PARA EXPORTAR --- */}
                    {Object.keys(estadoAnimoSemana.dailyMoods).length > 0 && (
                        <Button
                            onClick={handleExportEstadoAnimo}
                            variant="outline"
                            color="green"
                            leftSection={<IconFileSpreadsheet size={16} />}
                        >
                            Exportar
                        </Button>
                    )}
                </Group>
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