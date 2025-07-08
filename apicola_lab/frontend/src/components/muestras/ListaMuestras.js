import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Flex, Text, VStack, HStack } from '@chakra-ui/react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const ListaMuestras = () => {
  const [muestras, setMuestras] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API_URL}/muestras/`)
      .then(res => setMuestras(res.data))
      .catch(err => console.error('Error al cargar muestras:', err));
  }, []);

  return (
    <Flex minH="100vh" align="center" justify="center" bg="transparent">
      <Box bg="white" p={8} rounded="lg" boxShadow="lg" w={{ base: '90%', md: '700px' }}>
        <VStack spacing={6} align="center">
          <HStack w="100%" justify="space-between" mb={4}>
            <Button colorScheme="blue" onClick={() => navigate('/menu')}>
              ← Volver al menú
            </Button>
            <Text as="h1" fontSize="3xl" fontWeight="bold">
              Muestras Palinológicas
            </Text>
            <Box w="100px"></Box> {/* Espaciador para centrar el título */}
          </HStack>
          {muestras.map(muestra => (
            <HStack key={muestra.id} w="100%" justify="space-between">
              <Text>{muestra.num_registro || muestra.id} - {muestra.fecha_extraccion}</Text>
              <Button colorScheme="yellow" onClick={() => navigate(`/editar-muestra/${muestra.id}`)}>
                Editar/Completar
              </Button>
            </HStack>
          ))}
        </VStack>
      </Box>
    </Flex>
  );
};

export default ListaMuestras; 