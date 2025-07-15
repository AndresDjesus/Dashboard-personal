import React, { useState, useEffect } from 'react';
import { Paper, Title, Text, Avatar, Group, Center, TextInput, Button, Stack, rem, ActionIcon, Flex } from '@mantine/core'; // Agrega Flex
import { IconUserCircle, IconEdit, IconCheck, IconX, IconLink } from '@tabler/icons-react'; // Agrega IconLink

// Importa las utilidades de localStorage
import { cargarDatos, guardarDatos } from '../utils/localStorageUtils'; 

// Función auxiliar para generar la URL de Dicebear
// Esto nos asegura que siempre usamos la misma lógica para generar la URL predeterminada
const generateDicebearUrl = (name) => {
    return `https://api.dicebear.com/8.x/lorelei/svg?seed=${name || 'default'}`;
};

function PerfilSection() {
  // Carga el nombre del usuario desde localStorage o usa 'Tu Nombre' por defecto
  const [userName, setUserName] = useState(() => cargarDatos('userName', 'Tu Nombre'));
  
  // === MODIFICACIÓN CLAVE AQUÍ ===
  // Primero, intenta cargar la URL del avatar guardada.
  const initialSavedAvatarUrl = cargarDatos('avatarUrl', ''); // Carga como string vacío si no existe

  // Luego, inicializa avatarUrl:
  // Si hay una URL guardada, úsala.
  // Si no, genera una URL de Dicebear basada en el 'userName' inicial.
  const [avatarUrl, setAvatarUrl] = useState(() => {
    if (initialSavedAvatarUrl) {
      return initialSavedAvatarUrl;
    } else {
      return generateDicebearUrl(userName); // Usa el userName cargado inicialmente
    }
  });
  // === FIN DE LA MODIFICACIÓN CLAVE ===

  const [editingProfile, setEditingProfile] = useState(false); 
  const [tempUserName, setTempUserName] = useState(userName); 
  const [tempAvatarUrl, setTempAvatarUrl] = useState(avatarUrl); // Inicializa con la URL que se determinó

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

    // === MODIFICACIÓN CLAVE AQUÍ ===
    let newAvatarToSet;
    if (tempAvatarUrl.trim() === '') {
      // Si el usuario borra la URL, volvemos a una de Dicebear
      // PERO ahora usamos el `tempUserName` (el nombre que se va a guardar)
      newAvatarToSet = generateDicebearUrl(tempUserName);
    } else {
      // Si el usuario proporciona una URL, la usamos directamente
      newAvatarToSet = tempAvatarUrl; 
    }
    setAvatarUrl(newAvatarToSet); // Actualiza el estado principal del avatar
    // === FIN DE LA MODIFICACIÓN CLAVE ===

    setEditingProfile(false);
  };

  const handleCancelEdit = () => {
    setTempUserName(userName); 
    setTempAvatarUrl(avatarUrl); // Asegúrate de que vuelve a la URL real del estado
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
          <Avatar size={rem(120)} radius="100%" src={avatarUrl}>
            <IconUserCircle size={rem(80)} /> 
          </Avatar>
          
          {editingProfile ? (
            <Flex direction="column" align="center" gap="md" w="100%">
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
                // Importante: al editar, asegúrate de que tempAvatarUrl tenga el valor actual de avatarUrl
                setTempAvatarUrl(avatarUrl); 
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