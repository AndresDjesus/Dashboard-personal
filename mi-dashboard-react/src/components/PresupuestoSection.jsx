import React, { useState, useEffect } from 'react';
import {
    Paper, Title, Text, Group, TextInput, Button, Select, ActionIcon,
    Table, Badge, Flex, Progress, rem, Box
} from '@mantine/core';
import { IconPigMoney, IconTrash, IconPlus, IconWallet, IconMoneybag } from '@tabler/icons-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import { cargarDatos, guardarDatos } from '../utils/localStorageUtils';

// Colores para el nuevo gráfico Presupuesto vs. Gastos
// Verde para el "Presupuesto Restante" (o no gastado)
// Rojo/Naranja para el "Gastado"
const BUDGET_VS_SPENT_COLORS = ['#4CAF50', '#FF5722']; // Verde para Restante, Naranja/Rojo para Gastado


// Función personalizada para la etiqueta del gráfico (lo que se muestra dentro de la porción)
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value, name, percent, index }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

    // No mostrar la etiqueta si el valor es 0 o si la porción es demasiado pequeña
    if (value === 0 || percent < 0.05) return null;

    return (
        <text
            x={x}
            y={y}
            fill="white" // Color del texto de la etiqueta
            textAnchor={x > cx ? 'start' : 'end'}
            dominantBaseline="central"
            style={{ fontSize: '12px', fontWeight: 'bold' }}
        >
            {`${name}: ${(percent * 100).toFixed(0)}%`} {/* Muestra nombre y porcentaje */}
        </text>
    );
};

// Función personalizada para el tooltip del gráfico de Presupuesto vs Gastos
const renderBudgetSpentTooltipContent = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Paper p="xs" shadow="xs" style={{ backgroundColor: '#333', border: 'none', borderRadius: '4px' }}>
          <Text size="sm" style={{ color: payload[0].fill }}>{data.name}</Text>
          <Text size="sm" c="dimmed">${data.value.toFixed(2)}</Text>
        </Paper>
      );
    }
    return null;
};


function PresupuestoSection() {
    const [presupuestoItems, setPresupuestoItems] = useState(() => cargarDatos('presupuestoItems', []));
    const [categoria, setCategoria] = useState('');
    const [montoPresupuestado, setMontoPresupuestado] = useState('');

    const [finanzasUpdateCounter, setFinanzasUpdateCounter] = useState(0);

    useEffect(() => {
        const handleStorageChange = (event) => {
            // Re-renderiza si cambian los movimientos de finanzas o los ítems de presupuesto
            if (event.key === 'finanzasMovimientos' || event.key === 'presupuestoItems' || !event.key) {
                setFinanzasUpdateCounter(prev => prev + 1);
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    useEffect(() => {
        guardarDatos('presupuestoItems', presupuestoItems);
        console.log("Ítems de presupuesto guardados en localStorage:", presupuestoItems);
        // También fuerza un update del contador de finanzas para que el gráfico se refresque
        setFinanzasUpdateCounter(prev => prev + 1);
    }, [presupuestoItems]);

    // Función para calcular los gastos reales por categoría
    const calcularGastosActuales = () => {
        const todosLosMovimientos = cargarDatos('finanzasMovimientos', []);
        const gastosPorCategoria = {};

        todosLosMovimientos.forEach(mov => {
            if (mov.tipo === 'gasto' && mov.categoria) { // Asegúrate de que sea un gasto y tenga categoría
                gastosPorCategoria[mov.categoria] = (gastosPorCategoria[mov.categoria] || 0) + mov.monto;
            }
        });
        return gastosPorCategoria;
    };

    const gastosActuales = calcularGastosActuales(); // Recalcula cada vez que los ítems de presupuesto o el contador de finanzas cambian

    // <<<<<<< DATOS PARA EL ÚNICO GRÁFICO DE PRESUPUESTO VS GASTOS >>>>>>>
    const totalPresupuestado = presupuestoItems.reduce((sum, item) => sum + item.montoPresupuestado, 0);
    
    // Suma todos los gastos que están categorizados en tus presupuestoItems
    const totalGastadoEnCategorias = Object.keys(gastosActuales).reduce((sum, categoria) => {
        // Solo suma los gastos si la categoría existe en tu presupuestoItems
        if (presupuestoItems.some(item => item.categoria === categoria)) {
            return sum + gastosActuales[categoria];
        }
        return sum;
    }, 0);

    const restanteDelPresupuesto = totalPresupuestado - totalGastadoEnCategorias;

    const pieChartBudgetSpentData = [];

    // Solo añadir porciones si hay un total presupuestado o total gastado
    if (totalPresupuestado > 0 || totalGastadoEnCategorias > 0) {
        if (totalGastadoEnCategorias > 0) {
            pieChartBudgetSpentData.push({ name: 'Gastado', value: totalGastadoEnCategorias });
        }
        if (restanteDelPresupuesto > 0) {
            pieChartBudgetSpentData.push({ name: 'Presupuesto Restante', value: restanteDelPresupuesto });
        }
        // Si no hay restante positivo, pero si hubo un presupuesto, considera el "sobre-gasto"
        if (totalGastadoEnCategorias > totalPresupuestado && totalPresupuestado > 0) {
             pieChartBudgetSpentData.push({ name: 'Sobre-Gasto', value: totalGastadoEnCategorias - totalPresupuestado });
             // Ajusta el "Gastado" para que no se duplique, o maneja esta lógica con cuidado
             // Para un gráfico simple de dos porciones, lo ideal es Gastado vs Restante del Presupuesto
             // Si el gastado es mayor que el presupuesto, el "Restante" será negativo o 0, y el gastado ocupará todo.
             // Para mostrar sobre-gasto, necesitaríamos una lógica de gráfico diferente o un tercer color.
             // Por ahora, nos enfocaremos en Presupuesto Restante (si > 0) y Gastado.
        }
    }

    // Asegurarse de que el gráfico siempre tenga al menos una porción si hay algo de dinero
    if (pieChartBudgetSpentData.length === 0 && (totalPresupuestado > 0 || totalGastadoEnCategorias > 0)) {
        if (totalPresupuestado === 0 && totalGastadoEnCategorias > 0) {
            // Caso donde solo hay gastos pero no presupuesto
            pieChartBudgetSpentData.push({ name: 'Gastado (sin presupuesto)', value: totalGastadoEnCategorias });
        } else if (totalPresupuestado > 0 && totalGastadoEnCategorias === 0) {
            // Caso donde hay presupuesto pero no gastos
            pieChartBudgetSpentData.push({ name: 'Presupuesto no usado', value: totalPresupuestado });
        }
    }


    const handleAddPresupuestoItem = () => {
        if (!categoria.trim() || !montoPresupuestado || parseFloat(montoPresupuestado) <= 0) {
            alert('Por favor, ingresa una categoría y un monto presupuestado válido.');
            return;
        }

        // Evitar categorías duplicadas
        if (presupuestoItems.some(item => item.categoria.toLowerCase() === categoria.trim().toLowerCase())) {
            alert('Esta categoría ya existe en tu presupuesto.');
            return;
        }

        const nuevoItem = {
            id: Date.now().toString(),
            categoria: categoria.trim(),
            montoPresupuestado: parseFloat(montoPresupuestado),
        };

        setPresupuestoItems(prevItems => [...prevItems, nuevoItem]);

        setCategoria('');
        setMontoPresupuestado('');
    };

    const handleDeletePresupuestoItem = (id) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este ítem del presupuesto? Esto no eliminará los gastos asociados en Finanzas.')) {
            setPresupuestoItems(prevItems => prevItems.filter(item => item.id !== id));
        }
    };

    const rows = presupuestoItems.map((item) => {
        const gastoReal = gastosActuales[item.categoria] || 0;
        const restante = item.montoPresupuestado - gastoReal;
        const porcentajeUsado = item.montoPresupuestado > 0 ? (gastoReal / item.montoPresupuestado) * 100 : 0;

        let progressColor = 'green';
        if (porcentajeUsado >= 75 && porcentajeUsado < 100) {
            progressColor = 'orange';
        }
        if (porcentajeUsado >= 100) {
            progressColor = 'red';
        }

        return (
            <Table.Tr key={item.id}>
                <Table.Td>{item.categoria}</Table.Td>
                <Table.Td>${item.montoPresupuestado.toFixed(2)}</Table.Td>
                <Table.Td>${gastoReal.toFixed(2)}</Table.Td>
                <Table.Td>${restante.toFixed(2)}</Table.Td>
                <Table.Td>
                    <Progress value={porcentajeUsado} color={progressColor} size="lg" radius="xl" />
                    <Text size="xs" ta="center" mt={4}>{porcentajeUsado.toFixed(1)}%</Text>
                </Table.Td>
                <Table.Td ta="center">
                    <ActionIcon
                        variant="light"
                        color="red"
                        onClick={() => handleDeletePresupuestoItem(item.id)}
                        size="md"
                        aria-label={`Eliminar presupuesto de ${item.categoria}`}
                    >
                        <IconTrash style={{ width: rem(16), height: rem(16) }} />
                    </ActionIcon>
                </Table.Td>
            </Table.Tr>
        );
    });

    return (
        <Paper shadow="sm" p="lg" withBorder radius="md">
            <Title order={2} ta="center" mb="md" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <IconMoneybag size={28} />
                Mi Presupuesto
            </Title>

            <Flex direction={{ base: 'column', sm: 'row' }} gap="md" mb="xl">
                <TextInput
                    label="Categoría"
                    placeholder="Ej. Comida, Transporte"
                    value={categoria}
                    onChange={(event) => setCategoria(event.currentTarget.value)}
                    style={{ flexGrow: 1 }}
                />
                <TextInput
                    label="Monto Presupuestado"
                    placeholder="0.00"
                    type="number"
                    value={montoPresupuestado}
                    onChange={(event) => setMontoPresupuestado(event.currentTarget.value)}
                    min={0}
                    step="0.01"
                    style={{ flexBasis: '40%' }}
                />
                <Button
                    onClick={handleAddPresupuestoItem}
                    leftSection={<IconPlus size={16} />}
                    mt="auto"
                    style={{ flexBasis: '15%' }}
                >
                    Añadir
                </Button>
            </Flex>

            {/* ÚNICO Gráfico de Presupuesto Total vs. Gastos Totales */}
            <Title order={3} ta="center" mb="md">Resumen Global del Presupuesto</Title>
            {pieChartBudgetSpentData.length === 0 ? (
                <Text ta="center" c="dimmed" mb="xl">
                    No hay presupuesto ni gastos para mostrar en el resumen global.
                    Añade categorías de presupuesto y registra gastos en Finanzas.
                </Text>
            ) : (
                <Box h={250} mb="xl">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieChartBudgetSpentData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={renderCustomizedLabel} // Usar la etiqueta personalizada para porcentaje
                                outerRadius={80}
                                innerRadius={40}
                                fill="#8884d8"
                                dataKey="value"
                                nameKey="name"
                                paddingAngle={3}
                                cornerRadius={3}
                            >
                                {pieChartBudgetSpentData.map((entry, index) => (
                                    <Cell key={`cell-budget-spent-${index}`} fill={BUDGET_VS_SPENT_COLORS[index % BUDGET_VS_SPENT_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip content={renderBudgetSpentTooltipContent} />
                            <Legend layout="horizontal" align="center" verticalAlign="bottom" />
                        </PieChart>
                    </ResponsiveContainer>
                    <Text ta="center" size="lg" mt="sm">
                        Presupuesto Total: <Text span c="green" fw={700}>${totalPresupuestado.toFixed(2)}</Text> |
                        Gastos Totales: <Text span c="red" fw={700}>${totalGastadoEnCategorias.toFixed(2)}</Text>
                    </Text>
                </Box>
            )}

            <Title order={3} ta="center" mb="md">Detalle de Presupuesto por Categoría</Title>
            {presupuestoItems.length === 0 ? (
                <Text ta="center" c="dimmed" mt="xl">
                    No tienes ítems de presupuesto. ¡Empieza a planificar tus finanzas!
                </Text>
            ) : (
                <Box style={{ overflowX: 'auto' }}>
                    <Table striped highlightOnHover withTableBorder withColumnBorders verticalSpacing="xs">
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Categoría</Table.Th>
                                <Table.Th>Presupuestado</Table.Th>
                                <Table.Th>Gastado</Table.Th>
                                <Table.Th>Restante</Table.Th>
                                <Table.Th>Progreso</Table.Th>
                                <Table.Th ta="center">Acción</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>{rows}</Table.Tbody>
                    </Table>
                </Box>
            )}
        </Paper>
    );
}

export default PresupuestoSection;