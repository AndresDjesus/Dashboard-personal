import React, { useState, useEffect } from 'react';
import {
    Paper, Title, Text, Group, TextInput, Button, Select, ActionIcon,
    Table, Badge, Flex, Center, rem, Box
} from '@mantine/core';
import { IconPigMoney, IconTrash, IconPlus, IconWallet } from '@tabler/icons-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    BarChart, Bar
} from 'recharts';

import { 
    cargarDatos, 
    guardarDatos, 
    getDiasSemanaNombres, 
    getStartOfWeek, 
    // REMOVIDO: getDiaActualIndex, // <-- Esta función devuelve un número, no una fecha completa
    getTodayFormattedDate // <-- AÑADIDO: Esta es la función correcta que devuelve 'YYYY-MM-DD'
} from '../utils/localStorageUtils'; // ¡Asegúrate de que este archivo ya tenga 'getTodayFormattedDate' definido!

function FinanzasSection() {
    const [movimientos, setMovimientos] = useState(() => cargarDatos('finanzasMovimientos', []));
    const [descripcion, setDescripcion] = useState('');
    const [monto, setMonto] = useState('');
    const [tipo, setTipo] = useState('ingreso'); // 'ingreso' o 'gasto'
    const [categoriaGasto, setCategoriaGasto] = useState(''); // Nuevo estado para la categoría de gasto

    const [categoriasPresupuesto, setCategoriasPresupuesto] = useState([]);

    useEffect(() => {
        const loadCategories = () => {
            const presupuestoItems = cargarDatos('presupuestoItems', []);
            const options = presupuestoItems.map(item => ({
                value: item.categoria,
                label: item.categoria
            }));
            setCategoriasPresupuesto(options);
        };

        loadCategories();

        const handleStorageChange = (event) => {
            if (event.key === 'presupuestoItems' || !event.key) {
                loadCategories();
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    useEffect(() => {
        guardarDatos('finanzasMovimientos', movimientos);
        console.log("Movimientos guardados en localStorage:", movimientos);
    }, [movimientos]);

    const handleAddMovimiento = () => {
        if (!descripcion.trim() || !monto || parseFloat(monto) <= 0) {
            alert('Por favor, ingresa una descripción y un monto válido.');
            return;
        }
        if (tipo === 'gasto' && !categoriaGasto) {
            alert('Por favor, selecciona una categoría para el gasto.');
            return;
        }

        const nuevoMovimiento = {
            id: Date.now().toString(),
            descripcion: descripcion.trim(),
            monto: parseFloat(monto),
            tipo: tipo,
            fecha: getTodayFormattedDate(), // <-- CORREGIDO: Usar la función correcta
            categoria: tipo === 'gasto' ? categoriaGasto : undefined,
        };

        setMovimientos(prevMovimientos => [...prevMovimientos, nuevoMovimiento]);

        setDescripcion('');
        setMonto('');
        setTipo('ingreso');
        setCategoriaGasto('');
    };

    const handleDeleteMovimiento = (id) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este movimiento?')) {
            setMovimientos(prevMovimientos => prevMovimientos.filter(mov => mov.id !== id));
        }
    };

    const balanceTotal = movimientos.reduce((acc, mov) => {
        return mov.tipo === 'ingreso' ? acc + mov.monto : acc - mov.monto;
    }, 0);

    const totalIngresos = movimientos.filter(mov => mov.tipo === 'ingreso').reduce((sum, mov) => sum + mov.monto, 0);
    const totalGastos = movimientos.filter(mov => mov.tipo === 'gasto').reduce((sum, mov) => sum + mov.monto, 0);

    const getWeekRange = (startOfWeek) => {
        const days = [];
        const currentDay = new Date(startOfWeek);
        for (let i = 0; i < 7; i++) {
            const date = new Date(currentDay);
            date.setDate(currentDay.getDate() + i);
            days.push(date.toISOString().split('T')[0]);
        }
        return days;
    };

    const diasSemanaNombres = getDiasSemanaNombres();
    const currentWeekStartFormatted = getStartOfWeek().toISOString().split('T')[0];
    const currentWeekDays = getWeekRange(currentWeekStartFormatted);

    const chartData = diasSemanaNombres.map((diaNombre, index) => {
        const fechaDelDia = currentWeekDays[index];
        const ingresosDelDia = movimientos
            .filter(mov => mov.fecha === fechaDelDia && mov.tipo === 'ingreso')
            .reduce((sum, mov) => sum + mov.monto, 0);
        const gastosDelDia = movimientos
            .filter(mov => mov.fecha === fechaDelDia && mov.tipo === 'gasto')
            .reduce((sum, mov) => sum + mov.monto, 0);

        return {
            name: diaNombre,
            Ingresos: ingresosDelDia,
            Gastos: gastosDelDia,
        };
    });

    const rows = movimientos.map((movimiento) => (
        <Table.Tr key={movimiento.id}>
            <Table.Td>{movimiento.descripcion}</Table.Td>
            <Table.Td>{movimiento.fecha}</Table.Td>
            <Table.Td>{movimiento.tipo === 'gasto' && movimiento.categoria ? `(${movimiento.categoria})` : ''}</Table.Td>
            <Table.Td style={{ color: movimiento.tipo === 'ingreso' ? 'green' : 'red' }}>
                {movimiento.tipo === 'gasto' && '-'} ${movimiento.monto.toFixed(2)}
            </Table.Td>
            <Table.Td ta="center">
                <ActionIcon
                    variant="light"
                    color="red"
                    onClick={() => handleDeleteMovimiento(movimiento.id)}
                    size="md"
                    aria-label={`Eliminar movimiento ${movimiento.descripcion}`}
                >
                    <IconTrash style={{ width: rem(16), height: rem(16) }} />
                </ActionIcon>
            </Table.Td>
        </Table.Tr>
    ));

    return (
        <Paper shadow="sm" p="lg" withBorder radius="md">
            <Title order={2} ta="center" mb="md" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <IconPigMoney size={28} />
                Mis Finanzas
            </Title>

            <Group position="apart" mb="md">
                <Badge color="teal" size="lg" variant="light" leftSection={<IconWallet size={16} />}>
                    Balance: ${balanceTotal.toFixed(2)}
                </Badge>
                <Badge color="green" size="lg" variant="light">
                    Ingresos: ${totalIngresos.toFixed(2)}
                </Badge>
                <Badge color="red" size="lg" variant="light">
                    Gastos: ${totalGastos.toFixed(2)}
                </Badge>
            </Group>

            <Flex direction={{ base: 'column', sm: 'row' }} gap="md" mb="xl">
                <TextInput
                    label="Descripción"
                    placeholder="Ej. Salario, Café"
                    value={descripcion}
                    onChange={(event) => setDescripcion(event.currentTarget.value)}
                    style={{ flexGrow: 1 }}
                />
                <TextInput
                    label="Monto"
                    placeholder="0.00"
                    type="number"
                    value={monto}
                    onChange={(event) => setMonto(event.currentTarget.value)}
                    min={0}
                    step="0.01"
                    style={{ flexBasis: '20%' }}
                />
                <Select
                    label="Tipo"
                    data={[{ value: 'ingreso', label: 'Ingreso' }, { value: 'gasto', label: 'Gasto' }]}
                    value={tipo}
                    onChange={(value) => {
                        setTipo(value);
                        if (value === 'ingreso') setCategoriaGasto('');
                    }}
                    style={{ flexBasis: '20%' }}
                />
                {tipo === 'gasto' && (
                    <Select
                        label="Categoría de Gasto"
                        placeholder="Selecciona una categoría"
                        data={categoriasPresupuesto}
                        value={categoriaGasto}
                        onChange={setCategoriaGasto}
                        searchable
                        clearable
                        style={{ flexBasis: '25%' }}
                    />
                )}
                <Button
                    onClick={handleAddMovimiento}
                    leftSection={<IconPlus size={16} />}
                    mt="auto"
                    style={{ flexBasis: '15%' }}
                >
                    Añadir
                </Button>
            </Flex>

            <Title order={3} ta="center" mb="md">Ingresos y Gastos Semanales</Title>
            <Box h={300} mb="xl">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={chartData}
                        margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.5} />
                        <XAxis dataKey="name" stroke="#888888" />
                        <YAxis stroke="#888888" />
                        <Tooltip
                            formatter={(value, name) => [`$${value.toFixed(2)}`, name]}
                            contentStyle={{ backgroundColor: '#333', border: 'none', borderRadius: '4px' }}
                            labelStyle={{ color: '#fff' }}
                        />
                        <Legend />
                        <Bar dataKey="Ingresos" fill="#82ca9d" />
                        <Bar dataKey="Gastos" fill="#ff7f50" />
                    </BarChart>
                </ResponsiveContainer>
            </Box>

            <Title order={3} ta="center" mb="md">Historial de Movimientos</Title>
            {movimientos.length === 0 ? (
                <Text ta="center" c="dimmed" mt="xl">
                    No tienes movimientos registrados. ¡Empieza a añadir algunos!
                </Text>
            ) : (
                <Box style={{ overflowX: 'auto' }}>
                    <Table striped highlightOnHover withTableBorder withColumnBorders verticalSpacing="xs">
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Descripción</Table.Th>
                                <Table.Th>Fecha</Table.Th>
                                <Table.Th>Categoría</Table.Th>
                                <Table.Th>Monto</Table.Th>
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

export default FinanzasSection;