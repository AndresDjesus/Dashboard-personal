import React, { useState, useEffect, useRef } from 'react';
import { Paper, Title, Text, Avatar, Group, Center, TextInput, Button, Stack, rem, ActionIcon, Flex, Box } from '@mantine/core';
import { IconUserCircle, IconEdit, IconCheck, IconX, IconLink, IconUpload } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications'; 

// Ya no necesitamos importar localStorageUtils aquí, App.jsx lo maneja
// import { cargarDatos, guardarDatos } from '../utils/localStorageUtils'; 

// El componente ahora recibe props del componente padre (App.jsx)
function PerfilSection({ userName, setUserName, avatarUrl, setAvatarUrl, generateDicebearUrl }) {
    // Los estados temporales siguen siendo locales, eso está bien.
    const [editingProfile, setEditingProfile] = useState(false); 
    const [tempUserName, setTempUserName] = useState(userName); 
    const [tempAvatarUrl, setTempAvatarUrl] = useState(avatarUrl);
    const [uploadedImageFile, setUploadedImageFile] = useState(null);
    const fileInputRef = useRef(null);

    // Sincroniza los estados temporales con las props que vienen de App.jsx
    useEffect(() => {
        setTempUserName(userName);
        setTempAvatarUrl(avatarUrl);
    }, [userName, avatarUrl]);


    // Manejador para la selección de archivos
    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setUploadedImageFile(reader.result);
                // Si el usuario sube un archivo, limpiamos la URL temporal
                setTempAvatarUrl('');
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

        // --- CAMBIO CLAVE: USAMOS LAS FUNCIONES DE LAS PROPS PARA ACTUALIZAR EL ESTADO GLOBAL ---
        setUserName(tempUserName);

        if (uploadedImageFile) {
            setAvatarUrl(uploadedImageFile);
            setUploadedImageFile(null); // Reseteamos el estado
        } else if (tempAvatarUrl.trim() === '') {
            setAvatarUrl(generateDicebearUrl(tempUserName));
        } else {
            setAvatarUrl(tempAvatarUrl);
        }

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
        setUploadedImageFile(null);
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
                        src={uploadedImageFile || tempAvatarUrl || avatarUrl} 
                        onError={() => {
                            setTempAvatarUrl(generateDicebearUrl(tempUserName));
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
                                    setUploadedImageFile(null);
                                }}
                                placeholder="Pega la URL de tu imagen"
                                size="md"
                                w="100%"
                            />
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