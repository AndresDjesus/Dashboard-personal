import React, { useState, useEffect } from 'react';
import { NumberInput, Button, Box, Paper, Title, Group, Text, Alert, Progress } from '@mantine/core';
import { Pie } from 'react-chartjs-2'; // Importamos Pie para gráficos circulares
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { cargarDatos, guardarDatos } from '../utils/localStorageUtils'; 
import { IconCash } from '@tabler/icons-react';

// Registra los componentes necesarios de Chart.js para el gráfico de pastel/anillo
ChartJS.register(ArcElement, Tooltip, Legend);

function PresupuestoSection({ datosFinanzas }) { // Recibiremos datosFinanzas como prop
    // Estado para el presupuesto mensual establecido por el usuario
    const [presupuestoMensual, setPresupuestoMensual] = useState(() =>
        cargarDatos('presupuestoMensual', 0)
    );
    // Estado para el input del presupuesto
    const [inputPresupuesto, setInputPresupuesto] = useState(0);

  
    const gastoTotal = datosFinanzas?.gastos?.reduce((sum, current) => sum + current, 0) || 0;

    // Calcular el monto restante/excedido
    const restante = presupuestoMensual - gastoTotal;
    const porcentajeGastado = presupuestoMensual > 0 ? (gastoTotal / presupuestoMensual) * 100 : 0;

    
    useEffect(() => {
        setInputPresupuesto(presupuestoMensual);
    }, [presupuestoMensual]);

    // Datos para el gráfico de anillo (Pie Chart)
    const chartData = {
        labels: ['Gastado', 'Restante'],
        datasets: [{
            data: [gastoTotal, Math.max(0, restante)], 
            backgroundColor: [
                'rgba(255, 99, 132, 0.8)', 
                'rgba(75, 192, 192, 0.8)', 
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(75, 192, 192, 1)',
            ],
            borderWidth: 1,
        }],
    };

  
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%', 
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    color: 'white' 
                }
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const label = context.label || '';
                        const value = context.raw;
                        const percentage = context.formattedValue;
                        return `${label}: $${value.toFixed(2)} (${percentage})`;
                    }
                }
            }
        }
    };

    // Manejador para guardar el presupuesto
    const handleSavePresupuesto = () => {
        if (!isNaN(inputPresupuesto) && inputPresupuesto >= 0) {
            setPresupuestoMensual(inputPresupuesto); // Actualiza el estado
            guardarDatos('presupuestoMensual', inputPresupuesto); // Guarda en localStorage
            alert('Presupuesto mensual guardado!');
        } else {
            alert('Por favor, ingresa un valor válido para el presupuesto.');
        }
    };

    return (
        <Paper shadow="sm" p="lg" withBorder radius="md">
             <Title order={2} ta="center" mb="md" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
        <IconCash size={28} />
        Presupuesto Mensual
         </Title>

            {/* Input y botón para establecer el presupuesto */}
            <Group grow mt="md" mb="xl">
                <NumberInput
                    label="Establecer Presupuesto Mensual ($):"
                    placeholder="Ej. 1000"
                    min={0}
                    step={50}
                    value={inputPresupuesto}
                    onChange={setInputPresupuesto}
                    parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                    formatter={(value) =>
                        !Number.isNaN(parseFloat(value))
                            ? `$ ${value}`.replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ',')
                            : '$ '
                    }
                    sx={{ flexGrow: 1 }}
                />
                <Button onClick={handleSavePresupuesto} variant="filled" color="cyan">
                    Establecer
                </Button>
            </Group>

            {/* Resumen del presupuesto */}
            {presupuestoMensual > 0 && (
                <Box mt="md" ta="center">
                    <Text size="lg" fw={700}>
                        Presupuesto: <Text span c="green" fw={700}>${presupuestoMensual.toFixed(2)}</Text>
                    </Text>
                    <Text size="lg" fw={700}>
                        Gastado: <Text span c="red" fw={700}>${gastoTotal.toFixed(2)}</Text>
                    </Text>
                    <Text size="xl" fw={700} mt="sm">
                        {restante >= 0 ? `Restante: ` : `Excedido: `}
                        <Text span c={restante >= 0 ? 'green' : 'red'} fw={700}>
                            ${Math.abs(restante).toFixed(2)}
                        </Text>
                    </Text>

                    {/* Barra de progreso visual */}
                    <Box my="md">
                        <Progress value={porcentajeGastado} size="xl" radius="xl"
                            color={porcentajeGastado < 80 ? 'green' : porcentajeGastado < 100 ? 'yellow' : 'red'}
                            label={`${porcentajeGastado.toFixed(1)}%`}
                        />
                    </Box>

                    {/* Alerta si se excede el presupuesto */}
                    {restante < 0 && (
                        <Alert
                            icon={<span>⚠️</span>} // Puedes usar un icono de Mantine si quieres
                            title="¡Alerta de Presupuesto!"
                            color="red"
                            variant="light"
                            mt="md"
                        >
                            Te has excedido de tu presupuesto mensual por ${Math.abs(restante).toFixed(2)}. ¡Considera ajustar tus gastos!
                        </Alert>
                    )}
                </Box>
            )}

            {/* Gráfico de anillo */}
            {presupuestoMensual > 0 && (gastoTotal > 0 || restante > 0) ? (
                <Box style={{ position: 'relative', height: '250px', width: '100%', maxWidth: '300px', margin: '20px auto' }}>
                    <Pie data={chartData} options={chartOptions} />
                </Box>
            ) : (
                presupuestoMensual > 0 && (
                    <Text ta="center" mt="md" c="dimmed">
                        Aún no hay gastos registrados para este presupuesto.
                    </Text>
                )
            )}
             {presupuestoMensual === 0 && (
                <Text ta="center" mt="md" c="dimmed">
                    Establece tu presupuesto mensual para empezar.
                </Text>
            )}
        </Paper>
    );
}

export default PresupuestoSection;