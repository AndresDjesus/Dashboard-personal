import React, { useState, useEffect } from 'react';
import { Paper, Title, Text, Avatar, Group, Center, TextInput, Button, Stack, rem, ActionIcon, Flex } from '@mantine/core'; // Agrega Flex
import { IconUserCircle, IconEdit, IconCheck, IconX, IconLink } from '@tabler/icons-react'; // Agrega IconLink

// Importa las utilidades de localStorage
import { cargarDatos, guardarDatos } from '../utils/localStorageUtils'; 

function PerfilSection() {
  // Carga el nombre del usuario desde localStorage o usa 'Tu Nombre' por defecto
  const [userName, setUserName] = useState(() => cargarDatos('userName', 'Tu Nombre'));
  // Carga la URL del avatar desde localStorage o usa una URL predeterminada de Dicebear
  const [avatarUrl, setAvatarUrl] = useState(() => 
    cargarDatos('avatarUrl', `https://api.dicebear.com/8.x/lorelei/svg?seed=${userName || 'default'}`)
  );

  const [editingProfile, setEditingProfile] = useState(false); 
  const [tempUserName, setTempUserName] = useState(userName); 
  const [tempAvatarUrl, setTempAvatarUrl] = useState(avatarUrl); 

  // Guarda el nombre y la URL del avatar en localStorage cada vez que cambian
  useEffect(() => {
    guardarDatos('userName', userName);
    console.log("Nombre de usuario guardado en localStorage:", userName);
  }, [userName]);

  useEffect(() => {
    guardarDatos('avatarUrl', avatarUrl);
    console.log("URL de avatar guardada en localStorage:", avatarUrl);
  }, [avatarUrl]);


  const handleSaveProfile = () => {
    setUserName(tempUserName); // Actualiza el nombre principal
    // Si el usuario borra la URL, volvemos a una de Dicebear basada en el nombre
    if (tempAvatarUrl.trim() === '') {
        setAvatarUrl(`https://api.dicebear.com/8.x/lorelei/svg?seed=${tempUserName || 'default'}`);
    } else {
        setAvatarUrl(tempAvatarUrl); // Actualiza la URL del avatar
    }
    setEditingProfile(false);
  };

  const handleCancelEdit = () => {
    setTempUserName(userName); 
    setTempAvatarUrl(avatarUrl); 
    setEditingProfile(false);
  };

  return (
    <Paper shadow="sm" p="lg" withBorder radius="md">
      <Title order={2} ta="center" mb="md" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
        <IconUserCircle size={28} />
        Mi Perfil
      </Title>

      <Center mb="md">
        <Stack align="center" spacing="sm">
          {/* Muestra el avatar. Si avatarUrl está vacío o es inválido, Avatar de Mantine muestra un fallback o su icono. */}
          <Avatar size={rem(120)} radius="100%" src={avatarUrl}>
            <IconUserCircle size={rem(80)} /> {/* Icono de fallback si no hay imagen */}
          </Avatar>
          
          {editingProfile ? (
            <Flex direction="column" align="center" gap="md" w="100%"> {/* Usar Flex para organizar mejor los campos de edición */}
              <TextInput
                label="Nombre:"
                value={tempUserName}
                onChange={(event) => setTempUserName(event.currentTarget.value)}
                placeholder="Ingresa tu nombre"
                size="md"
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    handleSaveProfile();
                  }
                }}
                w="100%"
              />
              <TextInput
                label="URL del Avatar:"
                icon={<IconLink size={18} />}
                value={tempAvatarUrl}
                onChange={(event) => setTempAvatarUrl(event.currentTarget.value)}
                placeholder="Pega la URL de tu imagen (ej. imgur.com/imagen.jpg)"
                size="md"
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    handleSaveProfile();
                  }
                }}
                w="100%"
              />
              <Group spacing="xs">
                <ActionIcon onClick={handleSaveProfile} variant="filled" color="green" size="lg">
                  <IconCheck style={{ width: rem(20), height: rem(20) }} />
                </ActionIcon>
                <ActionIcon onClick={handleCancelEdit} variant="filled" color="red" size="lg">
                  <IconX style={{ width: rem(20), height: rem(20) }} />
                </ActionIcon>
              </Group>
            </Flex>
          ) : (
            <Group spacing="xs">
              <Text size="xl" weight={700}>
                {userName}
              </Text>
              <ActionIcon onClick={() => {
                setTempUserName(userName); 
                setEditingProfile(true);
              }} variant="subtle" color="gray" size="lg">
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