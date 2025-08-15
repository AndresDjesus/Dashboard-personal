// src/components/PerfilSection.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Paper, Title, Text, Avatar, Group, Center, TextInput, Button, Stack, rem, ActionIcon, Flex, Box } from '@mantine/core';
import { IconUserCircle, IconEdit, IconCheck, IconX, IconLink, IconUpload } from '@tabler/icons-react'; // Agregamos IconUpload
import { notifications } from '@mantine/notifications';

import { cargarDatos, guardarDatos } from '../utils/localStorageUtils';

const generateDicebearUrl = (name) => {
    return `https://api.dicebear.com/8.x/lorelei/svg?seed=${name || 'default'}`;
};

function PerfilSection() {
    const [userName, setUserName] = useState(() => cargarDatos('userName', 'Tu Nombre'));
    const initialSavedAvatarUrl = cargarDatos('avatarUrl', '');
    const [avatarUrl, setAvatarUrl] = useState(() => {
        if (initialSavedAvatarUrl && initialSavedAvatarUrl.startsWith('data:')) {
            // Si la URL guardada es una Data URL, la usamos
            return initialSavedAvatarUrl;
        } else if (initialSavedAvatarUrl) {
            // Si es una URL externa, la usamos
            return initialSavedAvatarUrl;
        } else {
            // Si no hay URL, generamos una de Dicebear
            return generateDicebearUrl(userName);
        }
    });
    
    const [editingProfile, setEditingProfile] = useState(false);
    const [tempUserName, setTempUserName] = useState(userName);
    const [tempAvatarUrl, setTempAvatarUrl] = useState(initialSavedAvatarUrl);
    const [uploadedImageFile, setUploadedImageFile] = useState(null); // Nuevo estado para el archivo subido
    const fileInputRef = useRef(null); // Referencia para el input de archivo

    useEffect(() => {
        guardarDatos('userName', userName);
        console.log("Nombre de usuario guardado en localStorage:", userName);
    }, [userName]);

    useEffect(() => {
        // Guardamos solo si la URL no es temporal de Dicebear para evitar guardar un avatar genérico.
        // Si no hay una URL personalizada, guardamos un string vacío.
        const urlToSave = avatarUrl.startsWith('https://api.dicebear.com/') ? '' : avatarUrl;
        guardarDatos('avatarUrl', urlToSave);
        console.log("URL de avatar guardada en localStorage:", urlToSave);
    }, [avatarUrl]);

    // Manejador para la selección de archivos
    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                // `reader.result` es la Data URL
                setUploadedImageFile(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveProfile = () => {
        if (tempUserName.trim() === '') {
            notifications.show({
                title: 'Error al Guardar Perfil',
                message: 'El nombre de usuario no puede estar vacío.',
                color: 'red',
            });
            return;
        }

        setUserName(tempUserName);

        let newAvatarToSet;
        if (uploadedImageFile) {
            // Si se subió un archivo, usamos su Data URL
            newAvatarToSet = uploadedImageFile;
            setUploadedImageFile(null); // Reseteamos el estado para el próximo uso
        } else if (tempAvatarUrl.trim() === '') {
            // Si se borra la URL y no hay archivo, volvemos a Dicebear
            newAvatarToSet = generateDicebearUrl(tempUserName);
        } else {
            // Si hay una URL en el campo, la usamos
            newAvatarToSet = tempAvatarUrl;
        }
        setAvatarUrl(newAvatarToSet);

        setEditingProfile(false);
        notifications.show({
            title: 'Perfil Guardado',
            message: 'Tu información de perfil ha sido actualizada.',
            color: 'green',
        });
    };

    const handleCancelEdit = () => {
        setTempUserName(userName);
        setTempAvatarUrl(avatarUrl);
        setUploadedImageFile(null); // Reseteamos el archivo subido
        setEditingProfile(false);
        notifications.show({
            title: 'Edición Cancelada',
            message: 'Los cambios en el perfil no fueron guardados.',
            color: 'gray',
        });
    };

    return (
        <Paper shadow="sm" p="lg" withBorder radius="md">
            <Title order={2} ta="center" mb="md" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <IconUserCircle size={28} />
                Mi Perfil
            </Title>
            <Center mb="md">
                <Stack align="center" spacing="sm">
                    <Avatar
                        size={rem(120)}
                        radius="100%"
                        src={uploadedImageFile || tempAvatarUrl || avatarUrl} // Usa el archivo subido si existe, si no, la URL temporal o la URL principal
                        onError={() => {
                            if (!tempAvatarUrl.startsWith('data:')) {
                                setTempAvatarUrl(generateDicebearUrl(tempUserName));
                            }
                        }}
                    >
                        {!uploadedImageFile && !tempAvatarUrl && !avatarUrl && <IconUserCircle size={rem(80)} />}
                    </Avatar>
                    
                    {editingProfile ? (
                        <Flex direction="column" align="center" gap="md" w="100%">
                            <TextInput
                                label="Nombre:"
                                value={tempUserName}
                                onChange={(event) => setTempUserName(event.currentTarget.value)}
                                placeholder="Ingresa tu nombre"
                                size="md"
                                w="100%"
                            />
                            <TextInput
                                label="URL del Avatar (opcional):"
                                icon={<IconLink size={18} />}
                                value={tempAvatarUrl}
                                onChange={(event) => {
                                    setTempAvatarUrl(event.currentTarget.value);
                                    setUploadedImageFile(null); // Limpia el archivo subido si el usuario edita la URL
                                }}
                                placeholder="Pega la URL de tu imagen"
                                size="md"
                                w="100%"
                            />

                            {/* --- CAMBIO AQUÍ: Nuevo botón y input de archivo --- */}
                            <Box w="100%">
                                <Button
                                    fullWidth
                                    variant="outline"
                                    onClick={() => fileInputRef.current.click()}
                                    leftSection={<IconUpload size={18} />}
                                >
                                    {uploadedImageFile ? 'Archivo seleccionado' : 'Subir foto desde el equipo'}
                                </Button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleImageUpload}
                                    style={{ display: 'none' }}
                                    accept="image/png, image/jpeg, image/jpg"
                                />
                            </Box>
                            {/* --- FIN DEL CAMBIO --- */}

                            <Group spacing="xs">
                                <ActionIcon onClick={handleSaveProfile} variant="filled" color="green" size="lg" title="Guardar cambios">
                                    <IconCheck style={{ width: rem(20), height: rem(20) }} />
                                </ActionIcon>
                                <ActionIcon onClick={handleCancelEdit} variant="filled" color="red" size="lg" title="Cancelar edición">
                                    <IconX style={{ width: rem(20), height: rem(20) }} />
                                </ActionIcon>
                            </Group>
                        </Flex>
                    ) : (
                        <Group spacing="xs">
                            <Text size="xl" fw={700}>
                                {userName}
                            </Text>
                            <ActionIcon onClick={() => {
                                setTempUserName(userName);
                                setTempAvatarUrl(avatarUrl);
                                setEditingProfile(true);
                            }} variant="subtle" color="gray" size="lg" title="Editar perfil">
                                <IconEdit style={{ width: rem(20), height: rem(20) }} />
                            </ActionIcon>
                        </Group>
                    )}
                    <Text c="dimmed" size="sm">¡Bienvenido a tu espacio personal!</Text>
                </Stack>
            </Center>
        </Paper>
    );
}

export default PerfilSection;