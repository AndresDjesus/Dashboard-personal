import React, { useState, useEffect, useCallback } from 'react';
import {
    Paper, Title, Text, Group, TextInput, Button, Select, ActionIcon,
    Table, Badge, Flex, Progress, rem, Box
} from '@mantine/core';
import { IconPigMoney, IconTrash, IconPlus, IconMoneybag, IconFileSpreadsheet } from '@tabler/icons-react'; // ¡Importa el nuevo icono!
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// ¡Importa la nueva función para exportar a XLSX!
import { cargarDatos, guardarDatos, exportToXlsxWithStyle } from '../utils/localStorageUtils';

// Colores para el gráfico Presupuesto vs. Gastos
const BUDGET_VS_SPENT_COLORS = ['#4CAF50', '#FF5722', '#F44336'];

// Función personalizada para la etiqueta del gráfico (sin cambios)
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value, name, percent }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
    if (value === 0 || percent < 0.05) return null;
    return (
        <text
            x={x}
            y={y}
            fill="white"
            textAnchor={x > cx ? 'start' : 'end'}
            dominantBaseline="central"
            style={{ fontSize: '12px', fontWeight: 'bold' }}
        >
            {`${name.split(' ')[0]}: ${(percent * 100).toFixed(0)}%`}
        </text>
    );
};

// Función personalizada para el tooltip del gráfico de Presupuesto vs Gastos (sin cambios)
const renderBudgetSpentTooltipContent = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <Paper p="xs" shadow="xs" style={{ backgroundColor: 'var(--mantine-color-body)', border: '1px solid var(--mantine-color-default-border)', borderRadius: '4px' }}>
                <Text size="sm" style={{ color: payload[0].fill, fontWeight: 600 }}>{data.name}</Text>
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
    const [finanzasChanged, setFinanzasChanged] = useState(0);

    useEffect(() => {
        const handleStorageChange = (event) => {
            if (event.key === 'finanzasMovimientos' || event.key === 'presupuestoItems') {
                setFinanzasChanged(prev => prev + 1);
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    useEffect(() => {
        guardarDatos('presupuestoItems', presupuestoItems);
        setFinanzasChanged(prev => prev + 1);
    }, [presupuestoItems]);

    const calcularGastosActuales = useCallback(() => {
        const todosLosMovimientos = cargarDatos('finanzasMovimientos', []);
        const gastosPorCategoria = {};
        todosLosMovimientos.forEach(mov => {
            if (mov.tipo === 'gasto' && mov.categoria) {
                gastosPorCategoria[mov.categoria] = (gastosPorCategoria[mov.categoria] || 0) + mov.monto;
            }
        });
        return gastosPorCategoria;
    }, [finanzasChanged]);

    const gastosActuales = calcularGastosActuales();

    const totalPresupuestado = presupuestoItems.reduce((sum, item) => sum + item.montoPresupuestado, 0);
    
    const totalGastadoEnCategorias = Object.keys(gastosActuales).reduce((sum, categoria) => {
        if (presupuestoItems.some(item => item.categoria === categoria)) {
            return sum + gastosActuales[categoria];
        }
        return sum;
    }, 0);

    const restanteDelPresupuesto = totalPresupuestado - totalGastadoEnCategorias;

    const pieChartBudgetSpentData = [];

    if (totalPresupuestado > 0 || totalGastadoEnCategorias > 0) {
        if (restanteDelPresupuesto > 0) {
            pieChartBudgetSpentData.push({ name: 'Presupuesto Restante', value: restanteDelPresupuesto });
        }
        if (totalGastadoEnCategorias > totalPresupuestado) {
            pieChartBudgetSpentData.push({ name: 'Sobre-Gasto', value: totalGastadoEnCategorias - totalPresupuestado });
        } 
        if (totalGastadoEnCategorias > 0 && totalGastadoEnCategorias <= totalPresupuestado) {
            pieChartBudgetSpentData.push({ name: 'Gastado', value: totalGastadoEnCategorias });
        } else if (totalGastadoEnCategorias > 0 && totalPresupuestado === 0) {
            pieChartBudgetSpentData.push({ name: 'Gastado (sin presupuesto)', value: totalGastadoEnCategorias });
        }
    }

    const handleAddPresupuestoItem = () => {
        const parsedMonto = parseFloat(montoPresupuestado);
        if (!categoria.trim() || isNaN(parsedMonto) || parsedMonto <= 0) {
            notifications.show({
                title: 'Error al Añadir',
                message: 'Por favor, ingresa una categoría y un monto presupuestado válido (mayor que 0).',
                color: 'red',
            });
            return;
        }
        if (presupuestoItems.some(item => item.categoria.toLowerCase() === categoria.trim().toLowerCase())) {
            notifications.show({
                title: 'Error de Duplicado',
                message: 'Esta categoría ya existe en tu presupuesto. Considera editarla si quieres cambiar el monto.',
                color: 'yellow',
            });
            return;
        }

        const nuevoItem = {
            id: Date.now().toString(),
            categoria: categoria.trim(),
            montoPresupuestado: parsedMonto,
        };

        setPresupuestoItems(prevItems => [...prevItems, nuevoItem]);
        notifications.show({
            title: 'Ítem de Presupuesto Añadido',
            message: `"${categoria.trim()}" presupuestado con $${parsedMonto.toFixed(2)}.`,
            color: 'green',
        });
        setCategoria('');
        setMontoPresupuestado('');
    };

    const handleDeletePresupuestoItem = (id) => {
        modals.openConfirmModal({
            title: 'Confirmar Eliminación',
            children: (
                <Text size="sm">
                    ¿Estás seguro de que quieres eliminar este ítem del presupuesto? Los gastos asociados a esta categoría en la sección de Finanzas **no serán eliminados**, solo dejarán de ser contabilizados en este presupuesto.
                </Text>
            ),
            labels: { confirm: 'Sí, eliminar', cancel: 'No, cancelar' },
            confirmProps: { color: 'red' },
            onCancel: () => notifications.show({
                title: 'Eliminación Cancelada',
                message: 'La eliminación del ítem de presupuesto fue cancelada.',
                color: 'gray',
            }),
            onConfirm: () => {
                setPresupuestoItems(prevItems => prevItems.filter(item => item.id !== id));
                notifications.show({
                    title: 'Ítem de Presupuesto Eliminado',
                    message: 'El ítem de presupuesto ha sido borrado con éxito.',
                    color: 'blue',
                });
            },
        });
    };

    // --- NUEVA FUNCIÓN PARA EXPORTAR A EXCEL ---
    const handleExportPresupuesto = () => {
        const dataForExport = presupuestoItems.map(item => {
            const gastoReal = gastosActuales[item.categoria] || 0;
            const restante = item.montoPresupuestado - gastoReal;
            return {
                Categoría: item.categoria,
                Presupuestado: `$${item.montoPresupuestado.toFixed(2)}`,
                Gastado: `$${gastoReal.toFixed(2)}`,
                Restante: `$${restante.toFixed(2)}`
            };
        });
        exportToXlsxWithStyle(dataForExport, 'presupuesto_por_categoria', 'Presupuesto');
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
                    <Progress value={Math.min(porcentajeUsado, 100)} color={progressColor} size="lg" radius="xl" />
                    <Text size="xs" ta="center" mt={4}>{porcentajeUsado.toFixed(1)}%</Text>
                </Table.Td>
                <Table.Td ta="center">
                    <ActionIcon
                        variant="light"
                        color="red"
                        onClick={() => handleDeletePresupuestoItem(item.id)}
                        size="md"
                        aria-label={`Eliminar presupuesto de ${item.categoria}`}
                        title="Eliminar ítem de presupuesto"
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
            <Flex direction={{ base: 'column', sm: 'row' }} gap="md" mb="xl" align="flex-end">
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
                    style={{ flexBasis: '15%' }}
                >
                    Añadir
                </Button>
            </Flex>
            <Title order={3} ta="center" mb="md">Resumen Global del Presupuesto</Title>
            {pieChartBudgetSpentData.length === 0 ? (
                <Text ta="center" c="dimmed" mb="xl">
                    No hay presupuesto ni gastos relevantes para mostrar en el resumen global.
                    Añade categorías de presupuesto y registra gastos en la sección de Finanzas.
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
                                label={renderCustomizedLabel}
                                outerRadius={80}
                                innerRadius={40}
                                fill="#8884d8"
                                dataKey="value"
                                nameKey="name"
                                paddingAngle={3}
                                cornerRadius={3}
                            >
                                {pieChartBudgetSpentData.map((entry, index) => (
                                    <Cell 
                                        key={`cell-budget-spent-${index}`} 
                                        fill={BUDGET_VS_SPENT_COLORS[index % BUDGET_VS_SPENT_COLORS.length]} 
                                    />
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
            
            {/* --- NUEVO BOTÓN PARA EXPORTAR --- */}
            {presupuestoItems.length > 0 && (
                <Flex justify="flex-end" mb="md">
                    <Button
                        onClick={handleExportPresupuesto}
                        leftSection={<IconFileSpreadsheet size={16} />}
                        variant="outline"
                        color="green"
                    >
                        Exportar a Excel
                    </Button>
                </Flex>
            )}

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