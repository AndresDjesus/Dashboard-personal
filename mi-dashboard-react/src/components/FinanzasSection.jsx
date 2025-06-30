import React, { useState, useEffect } from 'react';
import { NumberInput, Button, Box, Paper, Title, Group, Select } from '@mantine/core';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title as ChartTitle, Tooltip, Legend } from 'chart.js';
import { cargarDatos, guardarDatos, getDiaActual } from '../utils/localStorageUtils';


ChartJS.register(CategoryScale, LinearScale, BarElement, ChartTitle, Tooltip, Legend);

const labelsDiasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

function FinanzasSection() {

    const [datosFinanzas, setDatosFinanzas] = useState(() =>
        cargarDatos('datosFinanzas', { ingresos: [0, 0, 0, 0, 0, 0, 0], gastos: [0, 0, 0, 0, 0, 0, 0] })
    );

  
    const [tipoTransaccion, setTipoTransaccion] = useState('gasto');
  
    const [montoTransaccion, setMontoTransaccion] = useState(0);

  
    useEffect(() => {
        setMontoTransaccion(0);
    }, [datosFinanzas]); 

    // Datos para el gráfico de finanzas
    const chartData = {
        labels: labelsDiasSemana,
        datasets: [
            {
                label: 'Ingresos',
                data: datosFinanzas.ingresos,
                backgroundColor: 'rgba(75, 192, 192, 0.8)', 
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            },
            {
                label: 'Gastos',
                data: datosFinanzas.gastos,
                backgroundColor: 'rgba(255, 99, 132, 0.8)', 
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1,
            },
        ],
    };

    // Opciones del gráfico de finanzas (apilado)
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                stacked: true, 
                title: {
                    display: true,
                    text: 'Día de la Semana'
                }
            },
            y: {
                stacked: false, 
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Monto ($)'
                }
            },
        },
        plugins: {
            legend: {
                display: true,
                position: 'top',
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        return context.dataset.label + ': $' + context.parsed.y;
                    }
                }
            }
        },
    };

    // Manejador del botón Guardar Transacción
    const handleSaveTransaccion = () => {
        if (!isNaN(montoTransaccion) && montoTransaccion >= 0) {
            const diaActual = getDiaActual();
            
            const nuevosDatosFinanzas = {
                ingresos: [...datosFinanzas.ingresos],
                gastos: [...datosFinanzas.gastos]
            };

          
            const claveDatos = tipoTransaccion === 'gasto' ? 'gastos' : 'ingresos';

            
            nuevosDatosFinanzas[claveDatos][diaActual] = montoTransaccion;

            setDatosFinanzas(nuevosDatosFinanzas);
            guardarDatos('datosFinanzas', nuevosDatosFinanzas); 
            alert(`Transacción de ${tipoTransaccion} guardada!`);
        } else {
            alert('Por favor, ingresa un monto válido para la transacción.');
        }
    };

    return (
        <Paper shadow="sm" p="lg" withBorder radius="md">
            <Title order={2} ta="center" mb="md">Gastos e Ingresos Diarios</Title>
            <Box style={{ position: 'relative', height: '300px', width: '100%' }}>
                {/* El componente <Bar /> para finanzas */}
                <Bar data={chartData} options={chartOptions} />
            </Box>
            <Group grow mt="md">
                <Select
                    label="Tipo de Transacción:"
                    placeholder="Selecciona tipo"
                    value={tipoTransaccion}
                    onChange={setTipoTransaccion} 
                    data={[
                        { value: 'ingreso', label: 'Ingreso' },
                        { value: 'gasto', label: 'Gasto' },
                    ]}
                    sx={{ flexGrow: 1 }}
                />
                <NumberInput
                    label="Monto ($):"
                    placeholder="Ingresa monto"
                    min={0}
                    step={5} // Paso de 5 en 5 para montos
                    value={montoTransaccion}
                    onChange={setMontoTransaccion}
                    parser={(value) => value.replace(/\$\s?|(,*)/g, '')} 
                    formatter={(value) =>
                        !Number.isNaN(parseFloat(value))
                            ? `$ ${value}`.replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ',') 
                            : '$ '
                    }
                    sx={{ flexGrow: 1 }}
                />
                <Button onClick={handleSaveTransaccion} variant="filled" color="blue">
                    Guardar Transacción
                </Button>
            </Group>
        </Paper>
    );
}

export default FinanzasSection;