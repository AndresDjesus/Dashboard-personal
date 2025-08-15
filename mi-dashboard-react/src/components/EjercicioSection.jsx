// src/components/EjercicioSection.jsx
import React, { useState, useEffect } from 'react';
import { NumberInput, Button, Box, Paper, Title, Group, Text } from '@mantine/core';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title as ChartTitle, Tooltip, Legend } from 'chart.js';
import { notifications } from '@mantine/notifications';
// Importa el nuevo icono para el botón de exportar
import { IconBarbell, IconFileSpreadsheet } from '@tabler/icons-react';

// Importa las funciones de localStorageUtils, incluyendo la de exportar
import { cargarDatos, guardarDatos, getWeekNumber, exportToXlsxWithStyle } from '../utils/localStorageUtils';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ChartTitle, Tooltip, Legend);

const labelsDiasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

function EjercicioSection() {
    const [horasEjercicio, setHorasEjercicio] = useState(() => {
        const datosGuardados = cargarDatos('datosEjercicio', [0, 0, 0, 0, 0, 0, 0]);
        const ultimaActualizacion = cargarDatos('ultimaActualizacionEjercicio', null);
        const hoy = new Date();
        const ultimoDiaGuardado = ultimaActualizacion ? new Date(ultimaActualizacion) : null;
        let datosIniciales = datosGuardados;
        if (ultimoDiaGuardado) {
            const esMismoAño = hoy.getFullYear() === ultimoDiaGuardado.getFullYear();
            const semanaHoy = getWeekNumber(hoy);
            const semanaUltimoGuardado = getWeekNumber(ultimoDiaGuardado);
            if (!esMismoAño || semanaHoy !== semanaUltimoGuardado) {
                console.log("Detectado cambio de semana/año, reiniciando horas de ejercicio.");
                notifications.show({
                    title: 'Semana de Ejercicio Reiniciada',
                    message: '¡Una nueva semana ha comenzado! Tus horas de ejercicio se han reiniciado.',
                    color: 'blue',
                    icon: <IconBarbell size={18} />,
                    autoClose: 5000,
                });
                datosIniciales = [0, 0, 0, 0, 0, 0, 0];
            }
        }
        return JSON.parse(JSON.stringify(datosIniciales));
    });

    const [inputHoras, setInputHoras] = useState(0);

    useEffect(() => {
        const currentDayIndex = new Date().getDay();
        setInputHoras(horasEjercicio[currentDayIndex] || 0);
    }, [horasEjercicio]);

    useEffect(() => {
        const dataToSave = JSON.parse(JSON.stringify(horasEjercicio));
        guardarDatos('datosEjercicio', dataToSave);
        guardarDatos('ultimaActualizacionEjercicio', new Date().toISOString());
        console.log("Horas de ejercicio guardadas en localStorage:", dataToSave);
    }, [horasEjercicio]);

    const chartData = {
        labels: labelsDiasSemana,
        datasets: [{
            label: 'Horas de Ejercicio',
            data: horasEjercicio,
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
                        return context.dataset.label + ': ' + context.parsed.y + ' horas';
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
        const valorNumerico = parseFloat(inputHoras);
        if (!isNaN(valorNumerico) && valorNumerico >= 0) {
            const diaIndex = new Date().getDay();
            const nuevosDatosEjercicio = [...horasEjercicio];
            nuevosDatosEjercicio[diaIndex] = valorNumerico;
            setHorasEjercicio(nuevosDatosEjercicio);
            notifications.show({
                title: 'Horas de Ejercicio Registradas',
                message: `Has registrado ${valorNumerico} horas de ejercicio para hoy.`,
                color: 'green',
                icon: <IconBarbell size={18} />,
            });
        } else {
            notifications.show({
                title: 'Error de Entrada',
                message: 'Por favor, ingresa un número válido (0 o mayor) para las horas de ejercicio.',
                color: 'red',
            });
        }
    };

    // --- NUEVA FUNCIÓN PARA EXPORTAR A EXCEL ---
    const handleExportEjercicio = () => {
        // Prepara los datos en el formato correcto para el excel
        const dataForExport = labelsDiasSemana.map((dia, index) => ({
            'Día de la Semana': dia,
            'Horas de Ejercicio': horasEjercicio[index]
        }));
        
        const sheetName = 'Horas de Ejercicio';
        // Obtiene la fecha de inicio de la semana para el nombre del archivo
        // Nota: new Date().getDay() devuelve 0 para el domingo, así que para que la semana empiece en lunes,
        // tendrías que ajustar el índice. En este caso, lo mantendremos simple para reflejar el gráfico.
        const weekStart = new Date(new Date().setDate(new Date().getDate() - new Date().getDay())).toISOString().split('T')[0];
        const fileName = `horas_ejercicio_${weekStart}`;
        
        exportToXlsxWithStyle(dataForExport, fileName, sheetName);
    };

    return (
        <Paper shadow="sm" p="lg" withBorder radius="md">
            <Title order={2} ta="center" mb="md" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <IconBarbell size={28} />
                Horas de Ejercicio Semanales
            </Title>
            <Box style={{ position: 'relative', height: '300px', width: '100%' }} mb="md">
                <Line data={chartData} options={chartOptions} />
            </Box>
            <Group grow mt="md">
                <NumberInput
                    label="Horas de Ejercicio Hoy:"
                    placeholder="Ingresa horas"
                    min={0}
                    step={0.5}
                    value={inputHoras}
                    onChange={setInputHoras}
                    sx={{ flexGrow: 1 }}
                />
                <Button onClick={handleSaveEjercicio} variant="filled" color="grape" leftSection={<IconBarbell size={16} />}>
                    Guardar
                </Button>
                {/* --- NUEVO BOTÓN PARA EXPORTAR --- */}
                <Button
                    onClick={handleExportEjercicio}
                    variant="outline"
                    color="green"
                    leftSection={<IconFileSpreadsheet size={16} />}
                >
                    Exportar
                </Button>
            </Group>
            <Text size="sm" c="dimmed" mt="xs" ta="center">
                *Las horas se reinician cada inicio de semana.
            </Text>
        </Paper>
    );
}

export default EjercicioSection;