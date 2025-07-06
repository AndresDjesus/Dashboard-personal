// src/components/EjercicioSection.jsx
import React, { useState, useEffect } from 'react';
import { NumberInput, Button, Box, Paper, Title, Group, Text } from '@mantine/core';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title as ChartTitle, Tooltip, Legend } from 'chart.js';
// Importamos getWeekNumber desde localStorageUtils ahora
import { cargarDatos, guardarDatos, getDiaActual, getWeekNumber } from '../utils/localStorageUtils'; 
import { IconBarbell } from '@tabler/icons-react'; 

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ChartTitle, Tooltip, Legend);

const labelsDiasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

function EjercicioSection() {
    const [horasEjercicio, setHorasEjercicio] = useState(() => {
        const datosGuardados = cargarDatos('datosEjercicio', [0, 0, 0, 0, 0, 0, 0]);
        const ultimaActualizacion = cargarDatos('ultimaActualizacionEjercicio', null);
        const hoy = new Date();
        const ultimoDiaGuardado = ultimaActualizacion ? new Date(ultimaActualizacion) : null;

        // <<<<<<<<<< MUY IMPORTANTE AQUÍ TAMBIÉN: Limpiar los datos al cargar >>>>>>>>>>
        // Esto asegura que si el localStorage tiene datos "sucios" de una sesión anterior, se limpien al cargar.
        const cleanedDatosGuardados = JSON.parse(JSON.stringify(datosGuardados));

        if (ultimoDiaGuardado) {
            const esMismoAño = hoy.getFullYear() === ultimoDiaGuardado.getFullYear();
            const semanaHoy = getWeekNumber(hoy);
            const semanaUltimoGuardado = getWeekNumber(ultimoDiaGuardado);
            
            if (!esMismoAño || semanaHoy !== semanaUltimoGuardado) {
                console.log("Detectado cambio de semana/año, reseteando horas de ejercicio.");
                return [0, 0, 0, 0, 0, 0, 0]; 
            }
        }
        return cleanedDatosGuardados; // Retorna los datos cargados Y limpios
    });

    const [inputHoras, setInputHoras] = useState(0);

    useEffect(() => {
        const diaActual = getDiaActual(); // `getDiaActual` ahora devuelve YYYY-MM-DD
        const currentDayIndex = new Date().getDay(); // Obtiene el índice 0-6 (Domingo-Sábado)
        setInputHoras(horasEjercicio[currentDayIndex] || 0); // Usa el índice para el array
    }, [horasEjercicio]);

    // EFECTO CLAVE: Guarda 'horasEjercicio' y 'ultimaActualizacionEjercicio' cada vez que horasEjercicio cambia
    useEffect(() => {
        // <<<<<<<<<< CAMBIO CLAVE AQUÍ: Aseguramos que se guarde una copia limpia >>>>>>>>>>
        // Incluso si Chart.js muta 'horasEjercicio' después de pasar a 'data',
        // aquí forzamos una copia profunda antes de enviarla a 'guardarDatos'.
        const dataToSave = JSON.parse(JSON.stringify(horasEjercicio));
        guardarDatos('datosEjercicio', dataToSave); 
        guardarDatos('ultimaActualizacionEjercicio', new Date().toISOString());
        console.log("Horas de ejercicio guardadas en localStorage:", dataToSave); // Consologuea la copia limpia
    }, [horasEjercicio]);

    const chartData = {
        labels: labelsDiasSemana,
        // Chart.js consume este 'horasEjercicio' y lo puede mutar.
        // Lo importante es que setHorasEjercicio siempre reciba un array nuevo y limpio.
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
            // `getDiaActual()` de `localStorageUtils` ahora devuelve "YYYY-MM-DD"
            // Necesitamos el índice numérico del día de la semana para el array [0-6]
            const diaIndex = new Date().getDay(); 
            
            // Crea una copia *limpia* del array actual de horas
            // Esto asegura que React detecta un cambio de referencia y Chart.js también
            const nuevosDatosEjercicio = JSON.parse(JSON.stringify(horasEjercicio)); 
            nuevosDatosEjercicio[diaIndex] = valorNumerico;
            setHorasEjercicio(nuevosDatosEjercicio); 
            alert('Horas de ejercicio guardadas!');
        } else {
            alert('Por favor, ingresa un número válido (0 o mayor) para las horas de ejercicio.');
        }
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
                <Button onClick={handleSaveEjercicio} variant="filled" color="grape">
                    Guardar
                </Button>
            </Group>
            <Text size="sm" c="dimmed" mt="xs" ta="center">
                *Las horas se reinician cada inicio de semana.
            </Text>
        </Paper>
    );
}

export default EjercicioSection;