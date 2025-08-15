// src/components/FinanzasSection.jsx
import React, { useState, useEffect } from 'react';
import {
    Paper, Title, Text, Group, TextInput, Button, Select, ActionIcon,
    Table, Badge, Flex, Center, rem, Box
} from '@mantine/core';
// Importa el nuevo icono para Excel
import { IconPigMoney, IconTrash, IconPlus, IconWallet, IconFileSpreadsheet } from '@tabler/icons-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    BarChart, Bar
} from 'recharts';
import { notifications } from '@mantine/notifications'; // Importar notificaciones de Mantine

import {
    cargarDatos,
    guardarDatos,
    getDiasSemanaNombres,
    getStartOfWeek,
    getTodayFormattedDate,

    exportToXlsxWithStyle
} from '../utils/localStorageUtils'; // ¡Usamos tus funciones de localStorageUtils!

function FinanzasSection() {
    const [movimientos, setMovimientos] = useState(() => cargarDatos('finanzasMovimientos', []));
    const [descripcion, setDescripcion] = useState('');
    const [monto, setMonto] = useState('');
    const [tipo, setTipo] = useState('ingreso'); // 'ingreso' o 'gasto'
    const [categoriaGasto, setCategoriaGasto] = useState(''); // Estado para la categoría de gasto

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
        if (!descripcion.trim()) {
            notifications.show({
                title: 'Error de Entrada',
                message: 'La descripción no puede estar vacía.',
                color: 'red',
            });
            return;
        }
        const parsedMonto = parseFloat(monto);
        if (isNaN(parsedMonto) || parsedMonto <= 0) {
            notifications.show({
                title: 'Error de Monto',
                message: 'Por favor, ingresa un monto válido y mayor que cero.',
                color: 'red',
            });
            return;
        }
        if (tipo === 'gasto' && !categoriaGasto) {
            notifications.show({
                title: 'Categoría Requerida',
                message: 'Por favor, selecciona una categoría para el gasto.',
                color: 'red',
            });
            return;
        }

        const nuevoMovimiento = {
            id: Date.now().toString(),
            descripcion: descripcion.trim(),
            monto: parsedMonto,
            tipo: tipo,
            fecha: getTodayFormattedDate(),
            categoria: tipo === 'gasto' ? categoriaGasto : undefined,
        };

        setMovimientos(prevMovimientos => [...prevMovimientos, nuevoMovimiento]);

        setDescripcion('');
        setMonto('');
        setTipo('ingreso');
        setCategoriaGasto('');

        notifications.show({
            title: 'Movimiento Añadido',
            message: `${tipo === 'ingreso' ? 'Ingreso' : 'Gasto'} de $${parsedMonto.toFixed(2)} registrado.`,
            color: tipo === 'ingreso' ? 'green' : 'orange',
            icon: <IconPigMoney size={18} />,
        });
    };

    const handleDeleteMovimiento = (id) => {
        notifications.show({
            title: 'Confirmar Eliminación',
            message: '¿Estás seguro de que quieres eliminar este movimiento?',
            color: 'red',
            autoClose: false,
            withCloseButton: true,
            actions: [
                {
                    color: 'red',
                    label: 'Sí, eliminar',
                    onClick: () => {
                        setMovimientos(prevMovimientos => prevMovimientos.filter(mov => mov.id !== id));
                        notifications.show({
                            title: 'Movimiento Eliminado',
                            message: 'El movimiento ha sido eliminado.',
                            color: 'blue',
                        });
                    },
                },
                {
                    label: 'Cancelar',
                    onClick: () => notifications.hide('Confirmar Eliminación'),
                },
            ],
            id: 'Confirmar Eliminación'
        });
    };

    // --- FUNCIÓN ACTUALIZADA PARA EXPORTAR A XLSX ---
    const handleExportFinanzas = () => {
        const dataForExport = movimientos.map(({ id, ...rest }) => rest);
        // ¡CAMBIA ESTA LÍNEA!
        // Reemplaza 'exportToXlsx' por 'exportToXlsxWithStyle'
        exportToXlsxWithStyle(dataForExport, 'movimientos_financieros', 'Movimientos');
    };

    const balanceTotal = movimientos.reduce((acc, mov) => {
        return mov.tipo === 'ingreso' ? acc + mov.monto : acc - mov.monto;
    }, 0);

    const totalIngresos = movimientos.filter(mov => mov.tipo === 'ingreso').reduce((sum, mov) => sum + mov.monto, 0);
    const totalGastos = movimientos.filter(mov => mov.tipo === 'gasto').reduce((sum, mov) => sum + mov.monto, 0);

    const getWeekRange = (startOfWeekDate) => {
        const days = [];
        const currentDay = new Date(startOfWeekDate);
        for (let i = 0; i < 7; i++) {
            const date = new Date(currentDay);
            date.setDate(currentDay.getDate() + i);
            days.push(date.toISOString().split('T')[0]);
        }
        return days;
    };

    const diasSemanaNombres = getDiasSemanaNombres();
    const startOfCurrentWeek = getStartOfWeek();
    const currentWeekDaysFormatted = getWeekRange(startOfCurrentWeek);

    const chartData = diasSemanaNombres.map((diaNombre, index) => {
        const fechaDelDia = currentWeekDaysFormatted[index];
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

    const rows = movimientos
        .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
        .map((movimiento) => (
            <Table.Tr key={movimiento.id}>
                <Table.Td>{movimiento.descripcion}</Table.Td>
                <Table.Td>{movimiento.fecha}</Table.Td>
                <Table.Td>{movimiento.tipo === 'gasto' && movimiento.categoria ? movimiento.categoria : '-'}</Table.Td>
                <Table.Td style={{ color: movimiento.tipo === 'ingreso' ? 'var(--mantine-color-green-7)' : 'var(--mantine-color-red-7)' }}>
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

            <Group position="apart" mb="md" grow>
                <Badge color={balanceTotal >= 0 ? 'teal' : 'red'} size="xl" variant="light" leftSection={<IconWallet size={20} />}>
                    Balance: ${balanceTotal.toFixed(2)}
                </Badge>
                <Badge color="green" size="lg" variant="light">
                    Ingresos: ${totalIngresos.toFixed(2)}
                </Badge>
                <Badge color="red" size="lg" variant="light">
                    Gastos: ${totalGastos.toFixed(2)}
                </Badge>
            </Group>

            <Flex direction={{ base: 'column', sm: 'row' }} gap="md" mb="xl" wrap="wrap">
                <TextInput
                    label="Descripción"
                    placeholder="Ej. Salario, Café"
                    value={descripcion}
                    onChange={(event) => setDescripcion(event.currentTarget.value)}
                    style={{ flexGrow: 1, minWidth: '150px' }}
                />
                <TextInput
                    label="Monto"
                    placeholder="0.00"
                    type="number"
                    value={monto}
                    onChange={(event) => setMonto(event.currentTarget.value)}
                    min={0}
                    step="0.01"
                    style={{ flexGrow: 1, minWidth: '100px' }}
                />
                <Select
                    label="Tipo"
                    data={[{ value: 'ingreso', label: 'Ingreso' }, { value: 'gasto', label: 'Gasto' }]}
                    value={tipo}
                    onChange={(value) => {
                        setTipo(value);
                        if (value === 'ingreso') setCategoriaGasto('');
                    }}
                    style={{ flexGrow: 1, minWidth: '120px' }}
                />
                {tipo === 'gasto' && (
                    <Select
                        label="Categoría de Gasto"
                        placeholder="Selecciona o añade"
                        data={categoriasPresupuesto}
                        value={categoriaGasto}
                        onChange={setCategoriaGasto}
                        searchable
                        clearable
                        nothingFoundMessage="No hay categorías. Añádelas en la sección de Presupuesto."
                        style={{ flexGrow: 1, minWidth: '150px' }}
                    />
                )}
                <Button
                    onClick={handleAddMovimiento}
                    leftSection={<IconPlus size={16} />}
                    mt="auto"
                    style={{ flexGrow: 1, minWidth: '100px' }}
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
                        <XAxis dataKey="name" stroke="var(--mantine-color-text)" />
                        <YAxis stroke="var(--mantine-color-text)" />
                        <Tooltip
                            formatter={(value, name) => [`$${value.toFixed(2)}`, name]}
                            contentStyle={{ backgroundColor: 'var(--mantine-color-body)', border: '1px solid var(--mantine-color-dark-4)', borderRadius: '4px' }}
                            labelStyle={{ color: 'var(--mantine-color-text)' }}
                        />
                        <Legend />
                        <Bar dataKey="Ingresos" fill="#82ca9d" />
                        <Bar dataKey="Gastos" fill="#ff7f50" />
                    </BarChart>
                </ResponsiveContainer>
            </Box>

            <Title order={3} ta="center" mb="md">Historial de Movimientos</Title>
            
            {movimientos.length > 0 && (
                <Flex justify="flex-end" mb="md">
                    <Button
                        onClick={handleExportFinanzas}
                        leftSection={<IconFileSpreadsheet size={16} />}
                        variant="outline"
                        color="green"
                    >
                        Exportar a Excel
                    </Button>
                </Flex>
            )}

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