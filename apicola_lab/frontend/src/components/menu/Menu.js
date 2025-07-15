import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Flex, Text, VStack } from '@chakra-ui/react';

const Menu = () => {
  const navigate = useNavigate();

  const handleAnalisisPalinologico = () => {
    navigate('/analisis-palinologico');
  };

  const handleAnalisisFisicoquimico = () => {
    navigate('/analisis-fisicoquimico');
  };

  const handleVerAnalisis = () => {
    navigate('/todos-analisis');
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg="transparent">
      <Box
        bg="white"
        p={8}
        rounded="lg"
        boxShadow="lg"
        w={{ base: '90%', md: '500px' }}
        className="honeycomb-glow"
      >
        <VStack spacing={6} align="center">
          <Text as="h1" fontSize="3xl" fontWeight="bold" mb={6}>
          Selecciona el tipo de análisis que deseas realizar:
          </Text>
          <Text fontSize="lg" color="gray.600" mb={6}>
            Análisis posibles:
          </Text>
          <VStack spacing={4} w="100%">
            <Button
              colorScheme="blue"
              size="lg"
              w="100%"
              onClick={handleAnalisisPalinologico}
            >
              Análisis Palinológico
            </Button>
            <Button
              colorScheme="green"
              size="lg"
              w="100%"
              onClick={handleAnalisisFisicoquimico}
            >
              Análisis Fisicoquímico
            </Button>
            <Button
              colorScheme="yellow"
              size="lg"
              w="100%"
              onClick={handleVerAnalisis}
            >
              Ver todos los análisis
            </Button>
          </VStack>
        </VStack>
      </Box>
    </Flex>
  );
};

export default Menu; 