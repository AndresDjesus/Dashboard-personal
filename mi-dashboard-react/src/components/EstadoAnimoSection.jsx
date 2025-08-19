// src/components/EstadoAnimoSection.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Paper, Title, Text, Group, Button, Center, Box, useMantineTheme, rem, ActionIcon } from '@mantine/core';
import { notifications } from '@mantine/notifications';

// Importa los iconos necesarios
import { IconChartLine, IconMoodHappy, IconFileSpreadsheet } from '@tabler/icons-react';

import {
    cargarDatos,
    guardarDatos,
    getTodayFormattedDate,
    getStartOfWeek,
    getDiasSemanaNombres,
    exportToXlsxWithStyle
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

    // Guarda los datos en localStorage cada vez que estadoAnimoSemana cambia
    useEffect(() => {
        guardarDatos('estadoAnimoSemana', estadoAnimoSemana);
    }, [estadoAnimoSemana]);

    // Actualiza la calificación al cambiar de día
    useEffect(() => {
        setRating(estadoAnimoSemana.dailyMoods[diaActualFormatted] || 0);
    }, [diaActualFormatted, estadoAnimoSemana.dailyMoods]);

    // Limpia los datos semanalmente
    useEffect(() => {
        const checkWeekChange = () => {
            const currentWeekStartFormatted = getStartOfWeek().toISOString().split('T')[0];
            if (estadoAnimoSemana.weekStartDate !== currentWeekStartFormatted) {
                setEstadoAnimoSemana({ weekStartDate: currentWeekStartFormatted, dailyMoods: {} });
            }
        };
        checkWeekChange();
        const intervalId = setInterval(checkWeekChange, 60 * 60 * 1000); // Chequea cada hora
        return () => clearInterval(intervalId);
    }, [estadoAnimoSemana.weekStartDate]);

    // --- FUNCIÓN PARA REGISTRAR Y GUARDAR EL ÁNIMO DE FORMA AUTOMÁTICA ---
    const handleRatingChange = (newRating) => {
        setRating(newRating);
        setEstadoAnimoSemana(prev => {
            const newDailyMoods = { ...prev.dailyMoods };
            newDailyMoods[diaActualFormatted] = newRating;
            notifications.show({
                title: 'Estado de Ánimo Registrado',
                message: `Tu ánimo de hoy (${moodEmojis[newRating - 1]}) ha sido guardado.`,
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
            
            <Text size="lg" fw={500} ta="center" mb="md">¿Cómo te sientes hoy?</Text>
            
            {/* --- Nuevo componente de selección de íconos --- */}
            <Group justify="center" gap="xl" mb="lg">
                {moodEmojis.map((emoji, index) => {
                    const moodValue = index + 1;
                    const isSelected = rating === moodValue;
                    return (
                        <ActionIcon
                            key={index}
                            onClick={() => handleRatingChange(moodValue)}
                            size={rem(60)}
                            variant={isSelected ? "filled" : "light"}
                            color={isSelected ? "grape" : "dark"}
                            radius="xl"
                        >
                            <Text style={{ fontSize: rem(40) }}>{emoji}</Text>
                        </ActionIcon>
                    );
                })}
            </Group>
            {/* --- Fin del nuevo componente de selección --- */}

            <Title order={4} ta="center" mb="md">Registro Semanal</Title>
            <Group grow mb="lg" gap="xs">
                {fechasSemana.map((fecha, index) => {
                    const dia = diasSemanaNombres[index];
                    const mood = estadoAnimoSemana.dailyMoods[fecha];
                    const isToday = fecha === diaActualFormatted;

                    return (
                        <Paper
                            key={fecha}
                            p="xs"
                            withBorder
                            radius="md"
                            shadow={isToday ? "lg" : "sm"}
                            style={{
                                textAlign: 'center',
                                borderColor: isToday ? theme.colors.grape[5] : theme.colors.dark[4],
                                borderWidth: isToday ? '2px' : '1px'
                            }}
                        >
                            <Text size="xs" fw={700} c="dimmed">{dia}</Text>
                            <Text fz={rem(30)}>{moodEmojis[mood - 1] || '➖'}</Text>
                            <Text size="sm" c="dimmed">{moodLabels[mood] || 'Sin registrar'}</Text>
                        </Paper>
                    );
                })}
            </Group>

            {Object.keys(estadoAnimoSemana.dailyMoods).length > 0 && (
                <Center mb="lg">
                    <Button
                        onClick={handleExportEstadoAnimo}
                        variant="outline"
                        color="green"
                        leftSection={<IconFileSpreadsheet size={16} />}
                    >
                        Exportar
                    </Button>
                </Center>
            )}

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
