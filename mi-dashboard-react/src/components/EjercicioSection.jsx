import React, { useState, useEffect } from 'react';
import { NumberInput, Button, Box, Paper, Title, Group } from '@mantine/core';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title as ChartTitle, Tooltip, Legend } from 'chart.js';
import { cargarDatos, guardarDatos, getDiaActual } from '../utils/localStorageUtils';
import { IconBarbell } from '@tabler/icons-react'; 

// Registra los componentes necesarios de Chart.js para el gráfico de línea
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ChartTitle, Tooltip, Legend);

const labelsDiasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

function EjercicioSection() {
    // Estado local para las horas de ejercicio (persisten en localStorage)
    // Cambiamos el nombre de 'minutosEjercicio' a 'horasEjercicio'
    const [horasEjercicio, setHorasEjercicio] = useState(() =>
        cargarDatos('datosEjercicio', [0, 0, 0, 0, 0, 0, 0]) // La clave de localStorage sigue siendo 'datosEjercicio' para compatibilidad
    );
    // Estado local para el valor del input, ahora para horas
    const [inputHoras, setInputHoras] = useState(0);

    // Efecto para inicializar el input con el valor del día actual
    useEffect(() => {
        const diaActual = getDiaActual();
        setInputHoras(horasEjercicio[diaActual] || 0);
    }, [horasEjercicio]);

    // Datos para el gráfico
    const chartData = {
        labels: labelsDiasSemana,
        datasets: [{
            label: 'Horas de Ejercicio', // Cambiado a Horas
            data: horasEjercicio,
            backgroundColor: 'rgba(153, 102, 255, 0.6)',
            borderColor: 'rgba(153, 102, 255, 1)',
            borderWidth: 1,
            fill: false,
            tension: 0.3,
        }],
    };

    // Opciones del gráfico
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Horas' // Cambiado a Horas
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
                        // Cambiado a Horas
                        return context.dataset.label + ': ' + context.parsed.y + ' horas';
                    }
                }
            }
        }
    };

    // Manejador del botón Guardar
    const handleSaveEjercicio = () => {
        if (!isNaN(inputHoras) && inputHoras >= 0) {
            const diaActual = getDiaActual();
            const nuevosDatosEjercicio = [...horasEjercicio];
            nuevosDatosEjercicio[diaActual] = inputHoras;
            setHorasEjercicio(nuevosDatosEjercicio);
            guardarDatos('datosEjercicio', nuevosDatosEjercicio); // La clave de localStorage sigue siendo 'datosEjercicio'
            alert('Horas de ejercicio guardadas!');
        } else {
            alert('Por favor, ingresa un número válido para las horas de ejercicio.');
        }
    };

    return (
        <Paper shadow="sm" p="lg" withBorder radius="md">
              <Title order={2} ta="center" mb="md" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <IconBarbell size={28} />
                    Horas de Ejercicio Semanales
              </Title>
            <Box style={{ position: 'relative', height: '300px', width: '100%' }}>
                <Line data={chartData} options={chartOptions} />
            </Box>
            <Group grow mt="md">
                <NumberInput
                    label="Horas de Ejercicio Hoy:" // Cambiado a Horas
                    placeholder="Ingresa horas"
                    min={0}
                    step={0.5} // Ajustado el step para horas (0.5 para media hora)
                    value={inputHoras}
                    onChange={setInputHoras}
                    sx={{ flexGrow: 1 }}
                />
                <Button onClick={handleSaveEjercicio} variant="filled" color="grape">
                    Guardar
                </Button>
            </Group>
        </Paper>
    );
}

export default EjercicioSection;