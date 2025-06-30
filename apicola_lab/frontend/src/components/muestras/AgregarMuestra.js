import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Button, Flex, Text, VStack } from '@chakra-ui/react';

const AgregarMuestra = () => {
  const { tipo } = useParams();
  const navigate = useNavigate();

  const handleVolver = () => {
    if (tipo === 'palinologico') {
      navigate('/analisis-palinologico');
    } else if (tipo === 'fisicoquimico') {
      navigate('/analisis-fisicoquimico');
    }
  };

  const getTipoAnalisis = () => {
    return tipo === 'palinologico' ? 'Palinológico' : 'Fisicoquímico';
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg="transparent">
      <Box
        bg="white"
        p={8}
        rounded="lg"
        boxShadow="lg"
        w={{ base: '90%', md: '600px' }}
        className="honeycomb-glow"
      >
        <VStack spacing={6} align="center">
          <Text as="h1" fontSize="3xl" fontWeight="bold" mb={6}>
            Agregar Muestra - Análisis {getTipoAnalisis()}
          </Text>
          <Text fontSize="lg" color="gray.600" mb={6}>
            Formulario para agregar una nueva muestra de análisis {getTipoAnalisis().toLowerCase()}
          </Text>
          <Box w="100%" p={4} border="1px" borderColor="gray.200" borderRadius="md">
            <Text fontSize="md" color="gray.500">
              Aquí irá el formulario para agregar una muestra de análisis {getTipoAnalisis().toLowerCase()}
            </Text>
          </Box>
          <Button
            colorScheme="gray"
            size="lg"
            onClick={handleVolver}
          >
            Volver al Análisis {getTipoAnalisis()}
          </Button>
        </VStack>
      </Box>
    </Flex>
  );
};

export default AgregarMuestra; 