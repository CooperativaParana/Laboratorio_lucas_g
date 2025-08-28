import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Flex, Text, VStack } from '@chakra-ui/react';

const AnalisisPalinologico = () => {
  const navigate = useNavigate();

  const handleAgregarMuestra = () => {
    navigate('/agregar-muestra/palinologico');
  };

  const handleHacerConteo = () => {
    navigate('/muestras');
  };

  const handleReportes = () => {
    navigate('/reporte-porcentajes');
  };

  const handleGraficasConsultas = () => {
    navigate('/graficas-consultas');
  };

  const handleVolver = () => {
    navigate('/menu');
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
            Análisis Palinológico
          </Text>
          <Text fontSize="lg" color="gray.600" mb={6}>
            Selecciona la opción que deseas realizar:
          </Text>
          <VStack spacing={4} w="100%">
            <Button
              colorScheme="orange"
              size="lg"
              w="100%"
              onClick={handleAgregarMuestra}
            >
              Crear Grupo
            </Button>
            <Button
              colorScheme="yellow"
              size="lg"
              w="100%"
              onClick={handleHacerConteo}
            >
              Hacer Conteo
            </Button>
            <Button
              colorScheme="purple"
              size="lg"
              w="100%"
              onClick={() => navigate('/ver-analisis')}
            >
              Ver Análisis
            </Button>
            <Button
              colorScheme="blue"
              size="lg"
              w="100%"
              onClick={handleReportes}
            >
              Reportes
            </Button>
            <Button
              colorScheme="green"
              size="lg"
              w="100%"
              onClick={handleGraficasConsultas}
            >
              Gráficas
            </Button>
            <Button
              colorScheme="gray"
              size="lg"
              w="100%"
              onClick={handleVolver}
            >
              Volver al Menú
            </Button>
          </VStack>
        </VStack>
      </Box>
    </Flex>
  );
};

export default AnalisisPalinologico; 