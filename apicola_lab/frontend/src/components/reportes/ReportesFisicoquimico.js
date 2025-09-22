import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Text,
  SimpleGrid,
  Spinner,
  Alert,
  AlertIcon,
  VStack,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatGroup,
  Divider,
  Heading,
  Badge,
  Progress,
  HStack
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';

const ReportesFisicoquimico = () => {
  const { tipo } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/estadisticas/`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setData(response.data);
      } catch (err) {
        setError('No se pudieron cargar los reportes fisicoquímicos');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleVolver = () => {
    navigate('/analisis-fisicoquimico');
  };

  if (loading) {
    return (
      <Box textAlign="center" mt={10}><Spinner size="xl" /></Box>
    );
  }

  if (error) {
    return (
      <Alert status="error" mt={10} justifyContent="center">
        <AlertIcon /> {error}
      </Alert>
    );
  }

  return (
    <VStack spacing={8} align="center" mt={8} mb={8}>
      <Heading as="h1" size="xl" mb={4}>
        Reportes Fisicoquímicos
      </Heading>
      
      {/* Estadísticas de Análisis Fisicoquímicos */}
      <Box w={{ base: '95%', md: '70%' }} p={6} boxShadow="lg" borderRadius="lg" bg="white">
        <Heading as="h2" size="md" mb={4}>Estadísticas de Análisis Fisicoquímicos</Heading>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          <Stat>
            <StatLabel>Total Análisis Fisicoquímicos</StatLabel>
            <StatNumber>{data.estadisticas_generales.total_analisis.fisicoquimicos}</StatNumber>
          </Stat>
          <Stat>
            <StatLabel>Últimos 30 días</StatLabel>
            <StatNumber>{data.estadisticas_generales.ultimos_30_dias?.analisis_nuevos?.fisicoquimicos || 0}</StatNumber>
          </Stat>
        </SimpleGrid>
      </Box>

      {/* Promedio de Humedad por Apiario */}
      <Box w={{ base: '95%', md: '70%' }} p={6} boxShadow="lg" borderRadius="lg" bg="white">
        <Heading as="h2" size="md" mb={4}>Promedio de Humedad por Apiario</Heading>
        <VStack spacing={4} align="stretch">
          {data.humedad_por_apiario.map((item, idx) => (
            <Box key={idx} p={4} borderWidth={1} borderRadius="md" boxShadow="sm">
              <HStack justify="space-between" mb={2}>
                <Text fontWeight="bold">
                  {item['tambor__apiarios__nombre_apiario'] || 'Apiario sin nombre'}
                </Text>
                <Badge colorScheme="purple" fontSize="md">
                  {Number(item.promedio_humedad).toFixed(2)}%
                </Badge>
              </HStack>
              <Progress 
                value={Number(item.promedio_humedad)} 
                colorScheme="purple" 
                size="sm"
                borderRadius="md"
              />
              <Text fontSize="sm" color="gray.600" mt={1}>
                Humedad promedio
              </Text>
            </Box>
          ))}
        </VStack>
      </Box>

      {/* Rangos de Calidad */}
      <Box w={{ base: '95%', md: '70%' }} p={6} boxShadow="lg" borderRadius="lg" bg="white">
        <Heading as="h2" size="md" mb={4}>Rangos de Calidad Fisicoquímica</Heading>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          <Box p={4} borderWidth={1} borderRadius="md" bg="green.50">
            <Text fontWeight="bold" color="green.600">Humedad Óptima</Text>
            <Text fontSize="sm" color="gray.600">Menos de 18%</Text>
            <Text fontSize="xs" color="gray.500">Rango ideal para miel de calidad</Text>
          </Box>
          <Box p={4} borderWidth={1} borderRadius="md" bg="yellow.50">
            <Text fontWeight="bold" color="yellow.600">Humedad No Aceptable</Text>
            <Text fontSize="sm" color="gray.600">Mayor a 18%</Text>
            <Text fontSize="xs" color="gray.500">Requiere monitoreo</Text>
          </Box>
          <Box p={4} borderWidth={1} borderRadius="md" bg="blue.50">
            <Text fontWeight="bold" color="blue.600">Color Claro</Text>
            <Text fontSize="sm" color="gray.600">0 - 50 mm Pfund</Text>
            <Text fontSize="xs" color="gray.500">Miel clara</Text>
          </Box>
          <Box p={4} borderWidth={1} borderRadius="md" bg="orange.50">
            <Text fontWeight="bold" color="orange.600">Color Oscuro</Text>
            <Text fontSize="sm" color="gray.600">&gt; 50 mm Pfund</Text>
            <Text fontSize="xs" color="gray.500">Miel oscura</Text>
          </Box>
        </SimpleGrid>
      </Box>

      {/* Resumen de Calidad */}
      <Box w={{ base: '95%', md: '70%' }} p={6} boxShadow="lg" borderRadius="lg" bg="white">
        <Heading as="h2" size="md" mb={4}>Resumen de Calidad</Heading>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          <Stat>
            <StatLabel>Muestras en Rango Óptimo</StatLabel>
            <StatNumber color="green.500">
              {data.humedad_por_apiario.filter(item => 
                Number(item.promedio_humedad) >= 1 && 
                Number(item.promedio_humedad) <= 17
              ).length}
            </StatNumber>
            <StatHelpText>Humedad menor a 18%</StatHelpText>
          </Stat>
          <Stat>
            <StatLabel>Muestras No Aceptables</StatLabel>
            <StatNumber color="yellow.500">
              {data.humedad_por_apiario.filter(item => 
                Number(item.promedio_humedad) > 17 && 
                Number(item.promedio_humedad) <= 18
              ).length}
            </StatNumber>
            <StatHelpText>Humedad mayor a 18%</StatHelpText>
          </Stat>
          <Stat>
            <StatLabel>Muestras Críticas</StatLabel>
            <StatNumber color="red.500">
              {data.humedad_por_apiario.filter(item => 
                Number(item.promedio_humedad) > 18
              ).length}
            </StatNumber>
            <StatHelpText>Humedad &gt; 23% (Requiere monitoreo)</StatHelpText>
          </Stat>
        </SimpleGrid>
      </Box>

      {/* Botón volver */}
      <Box>
        <button 
          onClick={handleVolver} 
          style={{
            marginTop: 20, 
            padding: '10px 20px', 
            borderRadius: 8, 
            background: '#eee', 
            border: 'none', 
            cursor: 'pointer'
          }}
        >
          Volver al Análisis Fisicoquímico
        </button>
      </Box>
    </VStack>
  );
};

export default ReportesFisicoquimico; 