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
  Badge
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';

const Reportes = () => {
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
        setError('No se pudieron cargar los reportes palinológicos');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleVolver = () => {
    navigate('/analisis-palinologico');
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
    <VStack spacing={8} align="center" mt={8} mb={8} bg="transparent">
      <Heading as="h1" size="xl" mb={4}>
        Reportes Palinológicos
      </Heading>
      
      {/* Estadísticas de Análisis Palinológicos */}
      <Box w={{ base: '95%', md: '70%' }} p={6} boxShadow="lg" borderRadius="lg" bg="white" className="honeycomb-glow">
        <Heading as="h2" size="md" mb={4}>Estadísticas de Análisis Palinológicos</Heading>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          <Stat>
            <StatLabel>Total Análisis Palinológicos</StatLabel>
            <StatNumber>{data.estadisticas_generales.total_analisis.palinologicos}</StatNumber>
          </Stat>
          <Stat>
            <StatLabel>Últimos 30 días</StatLabel>
            <StatNumber>{data.estadisticas_generales.ultimos_30_dias?.analisis_nuevos?.palinologicos || 0}</StatNumber>
          </Stat>
        </SimpleGrid>
      </Box>

      {/* Muestras por mes */}
      <Box w={{ base: '95%', md: '70%' }} p={6} boxShadow="lg" borderRadius="lg" bg="white" className="honeycomb-glow">
        <Heading as="h2" size="md" mb={4}>Muestras Analizadas por Mes</Heading>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
          {data.muestras_por_mes.map((item, idx) => (
            <Stat key={idx}>
              <StatLabel>{item.mes ? new Date(item.mes).toLocaleString('es-ES', { month: 'long', year: 'numeric' }) : 'Sin fecha'}</StatLabel>
              <StatNumber>{item.total}</StatNumber>
            </Stat>
          ))}
        </SimpleGrid>
      </Box>

      {/* Top 10 Especies Analizadas */}
      <Box w={{ base: '95%', md: '70%' }} p={6} boxShadow="lg" borderRadius="lg" bg="white" className="honeycomb-glow">
        <Heading as="h2" size="md" mb={4}>Top 10 Especies de Polen Encontradas</Heading>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          {data.analisis_por_especie.map((item, idx) => (
            <Box key={idx} p={4} borderWidth={1} borderRadius="md" boxShadow="sm">
              <Text fontWeight="bold" fontSize="md">{item['especie__nombre_cientifico']}</Text>
              <Text fontSize="sm" color="gray.600">Total análisis: <Badge colorScheme="blue">{item.total}</Badge></Text>
              <Text fontSize="sm" color="gray.600">Promedio granos: <Badge colorScheme="green">{Number(item.promedio_granos).toFixed(2)}</Badge></Text>
            </Box>
          ))}
        </SimpleGrid>
      </Box>

      {/* Estadísticas Generales */}
      <Box w={{ base: '95%', md: '70%' }} p={6} boxShadow="lg" borderRadius="lg" bg="white" className="honeycomb-glow">
        <Heading as="h2" size="md" mb={4}>Estadísticas Generales del Sistema</Heading>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          <Stat>
            <StatLabel>Total Apicultores</StatLabel>
            <StatNumber>{data.estadisticas_generales.total_apicultores}</StatNumber>
          </Stat>
          <Stat>
            <StatLabel>Total Apiarios</StatLabel>
            <StatNumber>{data.estadisticas_generales.total_apiarios}</StatNumber>
          </Stat>
          <Stat>
            <StatLabel>Total Muestras</StatLabel>
            <StatNumber>{data.estadisticas_generales.total_muestras}</StatNumber>
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
          Volver al Análisis Palinológico
        </button>
      </Box>
    </VStack>
  );
};

export default Reportes; 