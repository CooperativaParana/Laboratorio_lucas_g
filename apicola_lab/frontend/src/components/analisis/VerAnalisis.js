import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Button, 
  Flex, 
  Text, 
  VStack, 
  Table, 
  Thead, 
  Tbody, 
  Tr, 
  Th, 
  Td, 
  TableContainer,
  Spinner,
  Alert,
  AlertIcon,
  Badge,
  Container,
  Heading
} from '@chakra-ui/react';
import { ArrowBackIcon, RepeatIcon } from '@chakra-ui/icons';
import { useColorModeValue } from '@chakra-ui/react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const VerAnalisis = () => {
  const [analisis, setAnalisis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Colores para el tema
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const headerBg = useColorModeValue('gray.100', 'gray.700');

  useEffect(() => {
    cargarAnalisis();
  }, []);

  // Recargar datos cuando el componente recibe el foco
  useEffect(() => {
    const handleFocus = () => {
      cargarAnalisis();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const cargarAnalisis = async () => {
    setLoading(true);
    setError('');
    try {
      // Agregar timestamp para evitar caché sin usar headers problemáticos
      const timestamp = new Date().getTime();
      const response = await axios.get(`${API_URL}/api/analisis-palinologicos/?_t=${timestamp}`);
      setAnalisis(response.data);
    } catch (err) {
      setError('Error al cargar los análisis: ' + (err.response?.data ? JSON.stringify(err.response.data) : err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleVolver = () => {
    navigate('/analisis-palinologico');
  };

  // Función para transformar datos a tabla pivoteada
  const transformToPivotTable = useMemo(() => {
    if (!analisis.length) return { pools: [], especies: [], pivotData: {} };

    // Agrupar datos por pool_id
    const poolsMap = new Map();
    const especiesSet = new Set();

    analisis.forEach(item => {
      const poolId = item.pool?.num_registro || item.pool || 'N/A';
      const especieId = item.especie?.id;
      const especieNombre = item.especie?.nombre_cientifico || 'N/A';
      const cantidad = item.cantidad_granos;
      const marca = item.marca_especial;

      // Agregar especie a la lista de especies únicas
      if (especieId) {
        especiesSet.add(JSON.stringify({ id: especieId, nombre: especieNombre }));
      }

      // Agrupar por pool
      if (!poolsMap.has(poolId)) {
        poolsMap.set(poolId, {
          id: poolId,
          fecha_analisis: item.pool?.fecha_analisis,
          especies: new Map()
        });
      }

      const pool = poolsMap.get(poolId);
      if (especieId) {
        pool.especies.set(especieId, {
          cantidad,
          marca,
          nombre: especieNombre
        });
      }
    });

    // Convertir a arrays
    const pools = Array.from(poolsMap.values()).map(pool => ({
      id: pool.id,
      fecha_analisis: pool.fecha_analisis,
      especies: pool.especies
    }));

    const especies = Array.from(especiesSet).map(especieStr => JSON.parse(especieStr));

    // Crear matriz pivote
    const pivotData = {};
    pools.forEach(pool => {
      pivotData[pool.id] = {};
      especies.forEach(especie => {
        const conteo = pool.especies.get(especie.id);
        pivotData[pool.id][especie.id] = conteo || null;
      });
    });

    return { pools, especies, pivotData };
  }, [analisis]);

  if (loading) {
    return (
      <Flex minH="100vh" align="center" justify="center">
        <Spinner size="xl" />
      </Flex>
    );
  }

  const { pools, especies, pivotData } = transformToPivotTable;

  return (
    <Flex minH="100vh" align="center" justify="center" bg="gray.50" p={4}>
      <Container maxW="95%" bg={bgColor} p={6} rounded="lg" boxShadow="lg" maxH="90vh" overflow="hidden">
        <VStack spacing={6} align="stretch" h="100%">
          <Flex justify="space-between" align="center">
            <Button leftIcon={<ArrowBackIcon />} onClick={handleVolver} colorScheme="gray" variant="outline">
              Volver
            </Button>
            <Heading size="lg" textAlign="center">
              Análisis Palinológicos - Vista Pivoteada
            </Heading>
            <Button 
              leftIcon={<RepeatIcon />} 
              onClick={cargarAnalisis} 
              colorScheme="blue" 
              variant="outline"
              isLoading={loading}
            >
              Recargar
            </Button>
          </Flex>

          {error && (
            <Alert status="error">
              <AlertIcon />
              {error}
            </Alert>
          )}

          {pools.length === 0 ? (
            <Text textAlign="center" color="gray.500" fontSize="lg">
              No hay análisis palinológicos registrados.
            </Text>
          ) : (
            <Box overflowX="auto" overflowY="auto" flex={1}>
              <TableContainer>
                <Table variant="simple" size="sm" borderWidth={1} borderColor={borderColor}>
                  <Thead position="sticky" top={0} bg={headerBg} zIndex={1}>
                    <Tr>
                      <Th borderWidth={1} borderColor={borderColor} minW="120px">GPO ID</Th>
                      <Th borderWidth={1} borderColor={borderColor} minW="100px">Fecha Análisis</Th>
                      {especies.map(especie => (
                        <Th 
                          key={especie.id} 
                          borderWidth={1} 
                          borderColor={borderColor}
                          minW="150px"
                          textAlign="center"
                        >
                          <VStack spacing={0}>
                            <Text fontSize="xs" fontWeight="bold">
                              {especie.nombre}
                            </Text>
                          </VStack>
                        </Th>
                      ))}
                    </Tr>
                  </Thead>
                  <Tbody>
                    {pools.map((pool) => (
                      <Tr key={pool.id} _hover={{ bg: 'gray.50' }}>
                        <Td 
                          borderWidth={1} 
                          borderColor={borderColor}
                          fontWeight="bold" 
                          color="blue.600"
                        >
                          {pool.id}
                        </Td>
                        <Td borderWidth={1} borderColor={borderColor}>
                          {pool.fecha_analisis ? 
                            new Date(pool.fecha_analisis).toLocaleDateString('es-ES', { timeZone: 'UTC' }) : 
                            'Sin fecha'
                          }
                        </Td>
                        {especies.map(especie => {
                          const conteo = pivotData[pool.id][especie.id];
                          return (
                            <Td 
                              key={especie.id} 
                              borderWidth={1} 
                              borderColor={borderColor}
                              textAlign="center"
                            >
                              {conteo ? (
                                <VStack spacing={1}>
                                  <Badge colorScheme="green" fontSize="md" px={2} py={1}>
                                    {conteo.cantidad}
                                  </Badge>
                                  {conteo.marca && (
                                    <Badge colorScheme="orange" variant="outline" fontSize="xs">
                                      {conteo.marca}
                                    </Badge>
                                  )}
                                </VStack>
                              ) : (
                                <Text color="gray.400" fontSize="sm">-</Text>
                              )}
                            </Td>
                          );
                        })}
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            </Box>
          )}

          <Flex justify="space-between" align="center" mt={4}>
            <Text fontSize="sm" color="gray.600">
              Total de GPO: {pools.length}
            </Text>
            <Text fontSize="sm" color="gray.600">
              Total de especies: {especies.length}
            </Text>
          </Flex>
        </VStack>
      </Container>
    </Flex>
  );
};

export default VerAnalisis; 