import React, { useState, useEffect, useRef } from 'react'; // Eliminamos useRef si no se usa
import { NumberInput, Button, Box, Paper, Title, Group, Text } from '@mantine/core';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title as ChartTitle, Tooltip, Legend } from 'chart.js';
import { cargarDatos, guardarDatos, getDiaActualIndex, getWeekNumber } from '../utils/localStorageUtils'; 
import { IconBook } from '@tabler/icons-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, ChartTitle, Tooltip, Legend);

const labelsDiasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

function EstudioSection() {
    const [horasEstudio, setHorasEstudio] = useState(() => {
        const datosGuardados = cargarDatos('datosEstudio', [0, 0, 0, 0, 0, 0, 0]);
        const ultimaActualizacion = cargarDatos('ultimaActualizacionEstudio', null);
        const hoy = new Date();
        const ultimoDiaGuardado = ultimaActualizacion ? new Date(ultimaActualizacion) : null;

        const cleanedDatosGuardados = JSON.parse(JSON.stringify(datosGuardados));

        if (ultimoDiaGuardado) {
            const esMismoAño = hoy.getFullYear() === ultimoDiaGuardado.getFullYear();
            const semanaHoy = getWeekNumber(hoy);
            const semanaUltimoGuardado = getWeekNumber(ultimoDiaGuardado);
            
            if (!esMismoAño || semanaHoy !== semanaUltimoGuardado) {
                console.log("Detectado cambio de semana/año para estudio, reseteando horas.");
                return [0, 0, 0, 0, 0, 0, 0]; 
            }
        }
        return cleanedDatosGuardados;
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
            
            const nuevosDatosEstudio = JSON.parse(JSON.stringify(horasEstudio));
            nuevosDatosEstudio[diaActualIndex] = valorNumerico;
            setHorasEstudio(nuevosDatosEstudio); 
            alert('Horas de estudio guardadas!');
        } else {
            alert('Por favor, ingresa un número válido (0 o mayor) para las horas de estudio.');
        }
    };

    return (
        <Paper shadow="sm" p="lg" withBorder radius="md">
            <Title order={2} ta="center" mb="md" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <IconBook size={28} />
                Horas de Estudio Semanales
            </Title>
            <Box style={{ position: 'relative', height: '300px', width: '100%' }} mb="md">
                {/* <<<<<<<<<< CAMBIO CLAVE AQUÍ: Añadimos una 'key' que cambia con los datos >>>>>>>>>> */}
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
                <Button onClick={handleSaveEstudio} variant="filled" color="teal">
                    Guardar
                </Button>
            </Group>
            <Text size="sm" c="dimmed" mt="xs" ta="center">
                *Las horas se reinician cada inicio de semana.
            </Text>
        </Paper>
    );
}

export default EstudioSection;