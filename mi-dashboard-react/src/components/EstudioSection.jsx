import React, { useState, useEffect, useRef } from 'react';
import { NumberInput, Button, Box, Paper, Title, Group, Text } from '@mantine/core';
import { Bar } from 'react-chartjs-2'; // Componente de Chart.js para React
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title as ChartTitle, Tooltip, Legend } from 'chart.js';
import { cargarDatos, guardarDatos, getDiaActual } from '../utils/localStorageUtils';

// Registra los componentes necesarios de Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, ChartTitle, Tooltip, Legend);

const labelsDiasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

function EstudioSection() {
    // Estado local para las horas de estudio (persisten en localStorage)
    const [horasEstudio, setHorasEstudio] = useState(() =>
        cargarDatos('datosEstudio', [0, 0, 0, 0, 0, 0, 0])
    );
    // Estado local para el valor del input (solo lo que el usuario escribe)
    const [inputHoras, setInputHoras] = useState(0);

    // Efecto para inicializar el input con el valor del día actual al cargar o actualizar los datos
    useEffect(() => {
        const diaActual = getDiaActual();
        setInputHoras(horasEstudio[diaActual] || 0);
    }, [horasEstudio]); // Dependencia: se ejecuta cuando 'horasEstudio' cambia

    // Datos para el gráfico
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

    // Opciones del gráfico
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Horas'
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
        }
    };

    // Manejador del botón Guardar
    const handleSaveEstudio = () => {
        if (!isNaN(inputHoras) && inputHoras >= 0) {
            const diaActual = getDiaActual();
            // Crea una copia del array para actualizar el estado inmutablemente
            const nuevosDatosEstudio = [...horasEstudio];
            nuevosDatosEstudio[diaActual] = inputHoras;
            setHorasEstudio(nuevosDatosEstudio); // Actualiza el estado de React
            guardarDatos('datosEstudio', nuevosDatosEstudio); // Guarda en localStorage
            alert('Horas de estudio guardadas!');
        } else {
            alert('Por favor, ingresa un número válido para las horas de estudio.');
        }
    };

    return (
        <Paper shadow="sm" p="lg" withBorder radius="md">
            <Title order={2} ta="center" mb="md">Horas de Estudio Semanales</Title>
            <Box style={{ position: 'relative', height: '300px', width: '100%' }}>
                {/* El componente <Bar /> de react-chartjs-2 */}
                <Bar data={chartData} options={chartOptions} />
            </Box>
            <Group grow mt="md">
                <NumberInput
                    label="Horas de Estudio Hoy:"
                    placeholder="Ingresa horas"
                    min={0}
                    step={0.5}
                    value={inputHoras}
                    onChange={setInputHoras} // Mantine NumberInput pasa el valor directamente
                    sx={{ flexGrow: 1 }}
                />
                <Button onClick={handleSaveEstudio} variant="filled" color="teal">
                    Guardar
                </Button>
            </Group>
        </Paper>
    );
}

export default EstudioSection;