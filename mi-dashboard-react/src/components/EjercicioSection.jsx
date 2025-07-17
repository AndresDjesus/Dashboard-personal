// src/components/EjercicioSection.jsx
import React, { useState, useEffect } from 'react';
import { NumberInput, Button, Box, Paper, Title, Group, Text } from '@mantine/core';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title as ChartTitle, Tooltip, Legend } from 'chart.js';
import { notifications } from '@mantine/notifications'; // Importar para usar notificaciones
import { IconBarbell } from '@tabler/icons-react';

// Importamos getWeekNumber y cargar/guardarDatos desde tu localStorageUtils
// OJO: NO importamos getDiaActualIndex aquí, usaremos new Date().getDay() directamente.
import { cargarDatos, guardarDatos, getWeekNumber } from '../utils/localStorageUtils';

// Definimos los labels de los días de la semana, que corresponden a new Date().getDay()
// 0=Domingo, 1=Lunes, ..., 6=Sábado
const labelsDiasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

function EjercicioSection() {
    // Estado para las horas de ejercicio por día [Dom, Lun, Mar, Mié, Jue, Vie, Sáb]
    const [horasEjercicio, setHorasEjercicio] = useState(() => {
        const datosGuardados = cargarDatos('datosEjercicio', [0, 0, 0, 0, 0, 0, 0]);
        const ultimaActualizacion = cargarDatos('ultimaActualizacionEjercicio', null);
        
        const hoy = new Date();
        const ultimoDiaGuardado = ultimaActualizacion ? new Date(ultimaActualizacion) : null;

        let datosIniciales = datosGuardados;

        // Comprobación de cambio de semana/año
        if (ultimoDiaGuardado) {
            const esMismoAño = hoy.getFullYear() === ultimoDiaGuardado.getFullYear();
            const semanaHoy = getWeekNumber(hoy);
            const semanaUltimoGuardado = getWeekNumber(ultimoDiaGuardado);
            
            // Si hay cambio de año o cambio de semana, reiniciamos las horas de ejercicio
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
        // Aseguramos que los datos devueltos sean una copia limpia para evitar mutaciones accidentales
        // por parte de Chart.js si el array se pasara directamente sin copiar.
        return JSON.parse(JSON.stringify(datosIniciales));
    });

    // Estado para el input de horas de ejercicio
    const [inputHoras, setInputHoras] = useState(0);

    // Efecto para inicializar el input de horas con el valor del día actual al cargar
    useEffect(() => {
        const currentDayIndex = new Date().getDay(); // Obtiene el índice 0-6 (Domingo-Sábado)
        setInputHoras(horasEjercicio[currentDayIndex] || 0);
    }, [horasEjercicio]); // Se ejecuta cuando horasEjercicio cambia (incluyendo la carga inicial)

    // EFECTO CLAVE: Guarda 'horasEjercicio' y 'ultimaActualizacionEjercicio' cada vez que horasEjercicio cambia
    useEffect(() => {
        // Guardamos una copia limpia del array antes de enviarla al localStorage
        const dataToSave = JSON.parse(JSON.stringify(horasEjercicio));
        guardarDatos('datosEjercicio', dataToSave);
        guardarDatos('ultimaActualizacionEjercicio', new Date().toISOString()); // Guarda la fecha y hora actual
        console.log("Horas de ejercicio guardadas en localStorage:", dataToSave);
    }, [horasEjercicio]);

    // Datos para Chart.js
    const chartData = {
        labels: labelsDiasSemana,
        datasets: [{
            label: 'Horas de Ejercicio',
            data: horasEjercicio, // Este array se pasa a Chart.js
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

    // Opciones para Chart.js
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
                    precision: 0 // Asegura que las etiquetas del eje Y sean números enteros
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

    // Función para manejar el guardado de horas de ejercicio
    const handleSaveEjercicio = () => {
        const valorNumerico = parseFloat(inputHoras);

        if (!isNaN(valorNumerico) && valorNumerico >= 0) {
            // Usamos new Date().getDay() para obtener el índice correcto del día (0=Dom, 1=Lun, etc.)
            const diaIndex = new Date().getDay();
            
            // Crea una copia *limpia* del array actual de horas
            const nuevosDatosEjercicio = JSON.parse(JSON.stringify(horasEjercicio));
            nuevosDatosEjercicio[diaIndex] = valorNumerico;
            
            setHorasEjercicio(nuevosDatosEjercicio); // Actualiza el estado
            
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