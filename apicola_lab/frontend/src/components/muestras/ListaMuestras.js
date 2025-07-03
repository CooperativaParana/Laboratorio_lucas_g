import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Flex, Text, VStack, HStack } from '@chakra-ui/react';

const ListaMuestras = () => {
  const [muestras, setMuestras] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/muestras/')
      .then(res => res.json())
      .then(data => setMuestras(data));
  }, []);

  return (
    <Flex minH="100vh" align="center" justify="center" bg="transparent">
      <Box bg="white" p={8} rounded="lg" boxShadow="lg" w={{ base: '90%', md: '700px' }}>
        <VStack spacing={6} align="center">
          <Text as="h1" fontSize="3xl" fontWeight="bold" mb={6}>
            Muestras Palinológicas
          </Text>
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