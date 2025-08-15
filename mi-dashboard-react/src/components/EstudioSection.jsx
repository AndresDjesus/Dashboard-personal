// src/components/EstudioSection.jsx
import React, { useState, useEffect } from 'react';
import { NumberInput, Button, Box, Paper, Title, Group, Text } from '@mantine/core';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title as ChartTitle, Tooltip, Legend } from 'chart.js';
import { notifications } from '@mantine/notifications';
// Importamos el nuevo icono para el botón de exportar
import { IconBook, IconFileSpreadsheet } from '@tabler/icons-react';

// Importamos las funciones de localStorageUtils, incluyendo la de exportar
import {
    cargarDatos,
    guardarDatos,
    getDiaActualIndex,
    getWeekNumber,
    exportToXlsxWithStyle // <-- ¡La nueva función!
} from '../utils/localStorageUtils';

ChartJS.register(CategoryScale, LinearScale, BarElement, ChartTitle, Tooltip, Legend);

const labelsDiasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

function EstudioSection() {
    const [horasEstudio, setHorasEstudio] = useState(() => {
        const datosGuardados = cargarDatos('datosEstudio', [0, 0, 0, 0, 0, 0, 0]);
        const ultimaActualizacion = cargarDatos('ultimaActualizacionEstudio', null);
        const hoy = new Date();
        const ultimoDiaGuardado = ultimaActualizacion ? new Date(ultimaActualizacion) : null;
        let datosIniciales = datosGuardados;
        if (ultimoDiaGuardado) {
            const esMismoAño = hoy.getFullYear() === ultimoDiaGuardado.getFullYear();
            const semanaHoy = getWeekNumber(hoy);
            const semanaUltimoGuardado = getWeekNumber(ultimoDiaGuardado);
            if (!esMismoAño || semanaHoy !== semanaUltimoGuardado) {
                console.log("Detectado cambio de semana/año para estudio, reiniciando horas.");
                notifications.show({
                    title: 'Semana de Estudio Reiniciada',
                    message: '¡Una nueva semana ha comenzado! Tus horas de estudio se han reiniciado.',
                    color: 'blue',
                    icon: <IconBook size={18} />,
                    autoClose: 5000,
                });
                datosIniciales = [0, 0, 0, 0, 0, 0, 0];
            }
        }
        return JSON.parse(JSON.stringify(datosIniciales));
    });

    const [inputHoras, setInputHoras] = useState(0);

    useEffect(() => {
        const diaActualIndex = getDiaActualIndex();
        setInputHoras(horasEstudio[diaActualIndex] || 0);
    }, [horasEstudio]);

    useEffect(() => {
        const dataToSave = JSON.parse(JSON.stringify(horasEstudio));
        guardarDatos('datosEstudio', dataToSave);
        guardarDatos('ultimaActualizacionEstudio', new Date().toISOString());
        console.log("Horas de estudio guardadas en localStorage:", dataToSave);
    }, [horasEstudio]);

    const chartData = {
        labels: labelsDiasSemana,
        datasets: [{
            label: 'Horas de Estudio',
            data: horasEstudio,
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

    const handleSaveEstudio = () => {
        const valorNumerico = parseFloat(inputHoras);
        if (!isNaN(valorNumerico) && valorNumerico >= 0) {
            const diaActualIndex = getDiaActualIndex();
            const nuevosDatosEstudio = [...horasEstudio]; // Copia el array
            nuevosDatosEstudio[diaActualIndex] = valorNumerico;
            setHorasEstudio(nuevosDatosEstudio);
            notifications.show({
                title: 'Horas de Estudio Registradas',
                message: `Has registrado ${valorNumerico} horas de estudio para hoy.`,
                color: 'green',
                icon: <IconBook size={18} />,
            });
        } else {
            notifications.show({
                title: 'Error de Entrada',
                message: 'Por favor, ingresa un número válido (0 o mayor) para las horas de estudio.',
                color: 'red',
            });
        }
    };

    // --- NUEVA FUNCIÓN PARA EXPORTAR A EXCEL ---
    const handleExportEstudio = () => {
        // Prepara los datos en el formato correcto para el excel
        const dataForExport = labelsDiasSemana.map((dia, index) => ({
            'Día de la Semana': dia,
            'Horas de Estudio': horasEstudio[index]
        }));
        
        const sheetName = 'Horas de Estudio';
        // Obtiene la fecha de inicio de la semana para el nombre del archivo
        const weekStart = new Date(new Date().setDate(new Date().getDate() - getDiaActualIndex())).toISOString().split('T')[0];
        const fileName = `horas_estudio_${weekStart}`;
        
        exportToXlsxWithStyle(dataForExport, fileName, sheetName);
    };

    return (
        <Paper shadow="sm" p="lg" withBorder radius="md">
            <Title order={2} ta="center" mb="md" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <IconBook size={28} />
                Horas de Estudio Semanales
            </Title>
            <Box style={{ position: 'relative', height: '300px', width: '100%' }} mb="md">
                <Bar key={JSON.stringify(horasEstudio)} data={chartData} options={chartOptions} />
            </Box>
            <Group grow mt="md">
                <NumberInput
                    label="Horas de Estudio Hoy:"
                    placeholder="Ingresa horas"
                    min={0}
                    step={0.5}
                    value={inputHoras}
                    onChange={setInputHoras}
                    sx={{ flexGrow: 1 }}
                />
                <Button onClick={handleSaveEstudio} variant="filled" color="teal" leftSection={<IconBook size={16} />}>
                    Guardar
                </Button>
                {/* --- NUEVO BOTÓN PARA EXPORTAR --- */}
                <Button
                    onClick={handleExportEstudio}
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

export default EstudioSection;