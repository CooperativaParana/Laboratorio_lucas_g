import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Flex,
  Text,
  VStack,
  HStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  Alert,
  AlertIcon,
  Badge,
  IconButton,
  Tooltip
} from '@chakra-ui/react';
import { ViewIcon } from '@chakra-ui/icons';

const ListaPools = () => {
  const navigate = useNavigate();
  const [pools, setPools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    fetchPools();
  }, []);

  const fetchPools = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/pools/`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      setPools(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerGraficos = (poolId) => {
    navigate(`/graficas-consultas/${poolId}`);
  };

  const handleVolver = () => {
    navigate('/analisis-palinologico');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No especificada';
    return new Date(dateString).toLocaleDateString('es-ES', { timeZone: 'UTC' });
  };

  if (loading) {
    return (
      <Flex minH="100vh" align="center" justify="center" bg="transparent">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Cargando GPOs...</Text>
        </VStack>
      </Flex>
    );
  }

  if (error) {
    return (
      <Flex minH="100vh" align="center" justify="center" bg="transparent">
        <Alert status="error" maxW="600px">
          <AlertIcon />
          <VStack align="start" spacing={2}>
            <Text fontWeight="bold">Error al cargar los GPO</Text>
            <Text>{error}</Text>
            <Button onClick={handleVolver} colorScheme="blue" size="sm">
              Volver
            </Button>
          </VStack>
        </Alert>
      </Flex>
    );
  }

  return (
    <Flex minH="100vh" bg="transparent" p={4}>
      <Box w="100%" maxW="1200px" mx="auto">
        {/* Header */}
        <Box bg="white" p={6} rounded="lg" boxShadow="lg" mb={6} className="honeycomb-glow">
          <VStack spacing={4} align="center">
            <Text as="h1" fontSize="3xl" fontWeight="bold">
              Lista de GPOs
            </Text>
            <Text fontSize="lg" color="gray.600" textAlign="center">
              Visualiza y analiza los datos de todos los GPOs de análisis palinológico
            </Text>
            <Button onClick={handleVolver} colorScheme="gray" size="lg">
              Volver al Análisis Palinológico
            </Button>
          </VStack>
        </Box>

        {/* Tabla de Pools */}
        <Box bg="white" rounded="lg" boxShadow="lg" overflow="hidden" className="honeycomb-glow">
          <Box p={6}>
            <Text fontSize="xl" fontWeight="bold" mb={4}>
              GPOs Disponibles ({pools.length})
            </Text>
          </Box>
          
          <Box overflowX="auto">
            <Table variant="simple">
              <Thead bg="gray.50">
                <Tr>
                  <Th>ID</Th>
                  <Th>Número de Registro</Th>
                  <Th>Analista</Th>
                  <Th>Fecha de Análisis</Th>
                  <Th>Observaciones</Th>
                  <Th>Acciones</Th>
                </Tr>
              </Thead>
              <Tbody>
                {pools.map((pool) => (
                  <Tr key={pool.id} _hover={{ bg: 'gray.50' }}>
                    <Td fontWeight="bold">{pool.id}</Td>
                    <Td>
                      <Badge colorScheme="blue" variant="subtle">
                        {pool.num_registro || 'N/A'}
                      </Badge>
                    </Td>
                    <Td>{pool.analista || 'N/A'}</Td>
                    <Td>{formatDate(pool.fecha_analisis)}</Td>
                    <Td>
                      <Text noOfLines={2} maxW="200px">
                        {pool.observaciones || 'Sin observaciones'}
                      </Text>
                    </Td>
                    <Td>
                      <Tooltip label="Ver gráficos del pool" hasArrow>
                        <IconButton
                          icon={<ViewIcon />}
                          colorScheme="blue"
                          variant="outline"
                          size="sm"
                          onClick={() => handleVerGraficos(pool.id)}
                          aria-label="Ver gráficos"
                        />
                      </Tooltip>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
          
          {pools.length === 0 && (
            <Box p={8} textAlign="center">
              <Text color="gray.500">No hay GPOs disponibles</Text>
            </Box>
          )}
        </Box>
      </Box>
    </Flex>
  );
};

export default ListaPools;
