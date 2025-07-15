// src/components/CitasMotivacionSection.jsx
import React, { useState, useEffect } from 'react';
import { Paper, Title, Text, Box } from '@mantine/core';
import { IconBulb } from '@tabler/icons-react'; 

// Importamos getDiaActual, cargarDatos y guardarDatos
import { cargarDatos, guardarDatos, getDiaActualIndex } from '../utils/localStorageUtils';

function CitasMotivacionSection() {
    const citas = [
        { texto: "El éxito es la suma de pequeños esfuerzos repetidos día tras día.", autor: "Robert Collier" },
        { texto: "La mejor forma de predecir el futuro es crearlo.", autor: "Peter Drucker" },
        { texto: "No te preguntes qué necesita el mundo. Pregúntate qué te hace sentir vivo y hazlo. Porque lo que el mundo necesita es gente que se sienta viva.", autor: "Howard Thurman" },
        { texto: "Cree en ti mismo y todo lo que eres. Reconoce que hay algo dentro de ti que es más grande que cualquier obstáculo.", autor: "Christian D. Larson" },
        { texto: "La vida es un 10% lo que te pasa y un 90% cómo reaccionas a ello.", autor: "Charles R. Swindoll" },
        { texto: "No es lo que tienes, sino cómo usas lo que tienes lo que marca la diferencia.", autor: "Zig Ziglar" },
        { texto: "El único modo de hacer un gran trabajo es amar lo que haces.", autor: "Steve Jobs" },
        { texto: "La disciplina es el puente entre metas y logros.", autor: "Jim Rohn" },
        { texto: "Cada día es una nueva oportunidad para cambiar tu vida.", autor: "Anónimo" },
        { texto: "Si puedes soñarlo, puedes lograrlo.", autor: "Zig Ziglar" }
    ];

    const [citaActual, setCitaActual] = useState({});

    useEffect(() => {
        const hoy = getDiaActualIndex();
        const storedQuoteData = cargarDatos('citaDelDia', { date: '', index: -1 });

        // Si es un nuevo día o no hay cita almacenada para hoy
        if (storedQuoteData.date !== hoy || storedQuoteData.index === -1) {
            // Selecciona un índice aleatorio
            const nuevoIndice = Math.floor(Math.random() * citas.length);
            setCitaActual(citas[nuevoIndice]);
            // Guarda la fecha y el índice en localStorage
            guardarDatos('citaDelDia', { date: hoy, index: nuevoIndice });
        } else {
            // Si ya hay una cita para hoy, la cargamos
            setCitaActual(citas[storedQuoteData.index]);
        }
    }, [citas]); 

    return (
        <Paper shadow="xl" p="xl" withBorder radius="md" style={{ backgroundColor: 'var(--mantine-color-dark-6)' }}>
            <Title order={1} ta="center" mb="lg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: 'var(--mantine-color-grape-4)' }}>
                <IconBulb size={40} /> {/* Usando IconSparkles como ejemplo */}
                Tu Frase del Dia
            </Title>

            <Box ta="center" py="lg">
                <Text
                    size="xl"
                    fw={700}
                    style={{
                        fontStyle: 'italic',
                        lineHeight: 1.4,
                        color: 'var(--mantine-color-grape-2)',
                        marginBottom: '1rem',
                        fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
                    }}
                >
                    "{citaActual.texto}"
                </Text>
                <Text size="md" c="dimmed" mt="md" style={{ fontWeight: 600 }}>
                    - {citaActual.autor}
                </Text>
            </Box>
        </Paper>
    );
}

export default CitasMotivacionSection;