// src/components/CitasMotivacionSection.jsx
import React, { useState, useEffect } from 'react';
import { Paper, Title, Text, Box } from '@mantine/core'; // Añadido Box
import { IconBulb } from '@tabler/icons-react'; // Cambiado a IconBulb como en tu código original

// Importamos cargarDatos, guardarDatos y la nueva getDiaActualIndex
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

    const [citaActual, setCitaActual] = useState({ texto: "", autor: "" }); // Inicializar con valores vacíos

    useEffect(() => {
        const hoy = getDiaActualIndex(); // Obtiene la fecha actual en formato "YYYY-MM-DD"
        const storedQuoteData = cargarDatos('citaDelDia', { date: '', index: -1 });

        // Verifica si es un nuevo día O si no hay cita almacenada para hoy
        // La condición `storedQuoteData.index === -1` maneja el caso inicial o de reseteo
        if (storedQuoteData.date !== hoy || storedQuoteData.index === -1) {
            // Selecciona un índice aleatorio
            const nuevoIndice = Math.floor(Math.random() * citas.length);
            setCitaActual(citas[nuevoIndice]);
            // Guarda la fecha y el índice en localStorage
            guardarDatos('citaDelDia', { date: hoy, index: nuevoIndice });
        } else {
            // Si ya hay una cita para hoy, la cargamos desde el índice guardado
            // Asegúrate de que el índice sea válido para evitar errores si las citas cambian
            if (storedQuoteData.index >= 0 && storedQuoteData.index < citas.length) {
                setCitaActual(citas[storedQuoteData.index]);
            } else {
                // Si el índice guardado es inválido, carga una nueva cita aleatoria
                const nuevoIndice = Math.floor(Math.random() * citas.length);
                setCitaActual(citas[nuevoIndice]);
                guardarDatos('citaDelDia', { date: hoy, index: nuevoIndice });
            }
        }
    }, []); // El array de dependencias vacío asegura que se ejecute solo una vez al montar

    return (
        <Paper shadow="xl" p="xl" withBorder radius="md" 
            style={{ 
                backgroundColor: 'var(--mantine-color-dark-6)', 
                // Asegúrate de que los colores 'grape' estén disponibles en tu tema Mantine,
                // o usa colores predeterminados si no has personalizado.
            }}
        >
            <Title order={1} ta="center" mb="lg" 
                style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '10px', 
                    color: 'var(--mantine-color-grape-4)' // Color personalizado
                }}
            >
                <IconBulb size={40} /> 
                Tu Frase del Día
            </Title>

            <Box ta="center" py="lg">
                <Text
                    size="xl"
                    fw={700}
                    style={{
                        fontStyle: 'italic',
                        lineHeight: 1.4,
                        color: 'var(--mantine-color-grape-2)', // Color personalizado
                        marginBottom: '1rem',
                        fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', // Responsivo
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