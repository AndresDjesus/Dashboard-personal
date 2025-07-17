import React, { useState, useEffect } from 'react';
import { NumberInput, Button, Box, Paper, Title, Group, Text } from '@mantine/core';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title as ChartTitle, Tooltip, Legend } from 'chart.js';
import { notifications } from '@mantine/notifications'; // Importar para usar notificaciones Mantine
import { IconBook } from '@tabler/icons-react'; // Icono para la sección de estudio

// Importamos las funciones de localStorageUtils que tienes
import { cargarDatos, guardarDatos, getDiaActualIndex, getWeekNumber } from '../utils/localStorageUtils'; 

ChartJS.register(CategoryScale, LinearScale, BarElement, ChartTitle, Tooltip, Legend);

// Los labels de los días de la semana, que corresponden a los índices de getDiaActualIndex():
// Lunes (0) a Domingo (6)
const labelsDiasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

function EstudioSection() {
    // Estado para las horas de estudio por día [Lun, Mar, Mié, Jue, Vie, Sáb, Dom]
    const [horasEstudio, setHorasEstudio] = useState(() => {
        const datosGuardados = cargarDatos('datosEstudio', [0, 0, 0, 0, 0, 0, 0]);
        const ultimaActualizacion = cargarDatos('ultimaActualizacionEstudio', null);
        
        const hoy = new Date();
        const ultimoDiaGuardado = ultimaActualizacion ? new Date(ultimaActualizacion) : null;

        let datosIniciales = datosGuardados;

        // Comprobación de cambio de semana/año para reiniciar los datos
        if (ultimoDiaGuardado) {
            const esMismoAño = hoy.getFullYear() === ultimoDiaGuardado.getFullYear();
            const semanaHoy = getWeekNumber(hoy);
            const semanaUltimoGuardado = getWeekNumber(ultimoDiaGuardado);
            
            // Si hay cambio de año o cambio de semana, reiniciamos las horas de estudio
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
        // Aseguramos que los datos devueltos sean una copia limpia
        return JSON.parse(JSON.stringify(datosIniciales));
    });

    // Estado para el input de horas de estudio
    const [inputHoras, setInputHoras] = useState(0);

    // Efecto para inicializar el input de horas con el valor del día actual al cargar
    useEffect(() => {
        // Usamos getDiaActualIndex() de tu localStorageUtils, que mapea Lunes a 0.
        const diaActualIndex = getDiaActualIndex();
        setInputHoras(horasEstudio[diaActualIndex] || 0);
    }, [horasEstudio]); // Se ejecuta cuando horasEstudio cambia

    // Efecto para guardar 'horasEstudio' y 'ultimaActualizacionEstudio' en localStorage
    useEffect(() => {
        const dataToSave = JSON.parse(JSON.stringify(horasEstudio));
        guardarDatos('datosEstudio', dataToSave);
        guardarDatos('ultimaActualizacionEstudio', new Date().toISOString()); // Guarda la fecha y hora actual
        console.log("Horas de estudio guardadas en localStorage:", dataToSave);
    }, [horasEstudio]);

    // Datos para Chart.js
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

    // Función para manejar el guardado de horas de estudio
    const handleSaveEstudio = () => {
        const valorNumerico = parseFloat(inputHoras);

        if (!isNaN(valorNumerico) && valorNumerico >= 0) {
            // Usamos getDiaActualIndex() de tu localStorageUtils, que mapea Lunes a 0.
            const diaActualIndex = getDiaActualIndex();
            
            // Crea una copia *limpia* del array actual de horas
            const nuevosDatosEstudio = JSON.parse(JSON.stringify(horasEstudio));
            nuevosDatosEstudio[diaActualIndex] = valorNumerico;
            
            setHorasEstudio(nuevosDatosEstudio); // Actualiza el estado
            
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

    return (
        <Paper shadow="sm" p="lg" withBorder radius="md">
            <Title order={2} ta="center" mb="md" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <IconBook size={28} />
                Horas de Estudio Semanales
            </Title>
            <Box style={{ position: 'relative', height: '300px', width: '100%' }} mb="md">
                {/* La clave aquí ayuda a Chart.js a re-renderizar la gráfica cuando los datos cambian */}
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