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
  Heading,
  HStack
} from '@chakra-ui/react';
import { ArrowBackIcon, DownloadIcon } from '@chakra-ui/icons';
import { useColorModeValue } from '@chakra-ui/react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const ReportePorcentajes = () => {
  const [analisis, setAnalisis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const headerBg = useColorModeValue('blue.500', 'blue.600');
  const headerTextColor = useColorModeValue('white', 'white');

  useEffect(() => {
    cargarAnalisis();
  }, []);

  const cargarAnalisis = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_URL}/analisis-palinologicos/`);
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

  // Filtrar registros válidos (sin marca_especial)
  const filterValidRecords = useMemo(() => {
    return analisis.filter(item => item.marca_especial === null || item.marca_especial === '');
  }, [analisis]);

  // Calcular porcentajes por pool
  const calculatePercentages = useMemo(() => {
    const poolsMap = new Map();
    
    filterValidRecords.forEach(item => {
      const poolId = item.pool?.num_registro || item.pool || 'N/A';
      const especieId = item.especie?.id;
      const cantidad = item.cantidad_granos;
      
      if (!poolsMap.has(poolId)) {
        poolsMap.set(poolId, {
          id: poolId,
          fecha_analisis: item.pool?.fecha_analisis,
          total_granos: 0,
          especies: new Map()
        });
      }
      
      const pool = poolsMap.get(poolId);
      pool.total_granos += cantidad;
      
      if (especieId) {
        pool.especies.set(especieId, {
          cantidad,
          nombre: item.especie?.nombre_cientifico || 'N/A'
        });
      }
    });

    // Calcular porcentajes
    poolsMap.forEach(pool => {
      pool.especies.forEach((especie, especieId) => {
        const porcentaje = pool.total_granos > 0 ? (especie.cantidad / pool.total_granos) * 100 : 0;
        pool.especies.set(especieId, {
          ...especie,
          porcentaje: porcentaje
        });
      });
    });

    return Array.from(poolsMap.values());
  }, [filterValidRecords]);

  // Transformar a tabla pivoteada
  const transformToPivotTable = useMemo(() => {
    if (!calculatePercentages.length) return { pools: [], especies: [], pivotData: {} };

    const especiesSet = new Set();
    
    calculatePercentages.forEach(pool => {
      pool.especies.forEach((especie, especieId) => {
        especiesSet.add(JSON.stringify({ id: especieId, nombre: especie.nombre }));
      });
    });

    const especies = Array.from(especiesSet).map(especieStr => JSON.parse(especieStr));

    const pivotData = {};
    calculatePercentages.forEach(pool => {
      pivotData[pool.id] = {};
      especies.forEach(especie => {
        const conteo = pool.especies.get(especie.id);
        pivotData[pool.id][especie.id] = conteo || null;
      });
    });

    return { 
      pools: calculatePercentages, 
      especies, 
      pivotData,
      totalOriginal: analisis.length,
      totalFiltrado: filterValidRecords.length
    };
  }, [calculatePercentages, analisis.length, filterValidRecords.length]);

  const handleDescargarPDF = () => {
    alert('Función de descarga PDF en desarrollo');
  };

  if (loading) {
    return (
      <Flex minH="100vh" align="center" justify="center">
        <Spinner size="xl" />
      </Flex>
    );
  }

  const { pools, especies, pivotData, totalOriginal, totalFiltrado } = transformToPivotTable;

  return (
    <Flex minH="100vh" align="center" justify="center" bg="gray.50" p={4}>
      <Container maxW="95%" bg={bgColor} p={6} rounded="lg" boxShadow="lg" maxH="90vh" overflow="hidden">
        <VStack spacing={6} align="stretch" h="100%">
          {/* Header */}
          <Box bg={headerBg} p={4} rounded="lg" color={headerTextColor}>
            <Flex justify="space-between" align="center">
              <Button 
                leftIcon={<ArrowBackIcon />} 
                onClick={handleVolver} 
                colorScheme="whiteAlpha" 
                variant="outline"
                size="sm"
              >
                Volver
              </Button>
              <VStack spacing={1}>
                <Heading size="lg" textAlign="center">
                  Reporte de Porcentajes Palinológicos
                </Heading>
                <Text fontSize="sm" opacity={0.9}>
                  {new Date().toLocaleDateString('es-ES', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </Text>
              </VStack>
              <Button
                leftIcon={<DownloadIcon />}
                colorScheme="teal"
                size="sm"
                onClick={handleDescargarPDF}
              >
                Descargar PDF
              </Button>
            </Flex>
          </Box>

          {error && (
            <Alert status="error">
              <AlertIcon />
              {error}
            </Alert>
          )}

          {/* Estadísticas del filtrado */}
          <Box p={4} bg="blue.50" rounded="md">
            <HStack justify="space-between" align="center">
              <VStack align="start" spacing={1}>
                <Text fontSize="sm" fontWeight="bold" color="blue.700">
                  Filtrado de Datos
                </Text>
                <Text fontSize="xs" color="blue.600">
                  Registros originales: {totalOriginal} | Registros válidos: {totalFiltrado}
                </Text>
              </VStack>
              <Badge colorScheme={totalFiltrado > 0 ? "green" : "red"} variant="solid">
                {totalFiltrado > 0 ? `${((totalFiltrado / totalOriginal) * 100).toFixed(1)}% válidos` : 'Sin datos válidos'}
              </Badge>
            </HStack>
          </Box>

          {pools.length === 0 ? (
            <Text textAlign="center" color="gray.500" fontSize="lg">
              No hay análisis palinológicos válidos para mostrar.
            </Text>
          ) : (
            <Box overflowX="auto" overflowY="auto" flex={1}>
              <TableContainer>
                <Table variant="striped" size="sm" borderWidth={1} borderColor={borderColor}>
                  <Thead position="sticky" top={0} bg={headerBg} zIndex={1}>
                    <Tr>
                      <Th borderWidth={1} borderColor={borderColor} minW="120px" color={headerTextColor}>
                        Pool ID
                      </Th>
                      <Th borderWidth={1} borderColor={borderColor} minW="100px" color={headerTextColor}>
                        Fecha Análisis
                      </Th>
                      <Th borderWidth={1} borderColor={borderColor} minW="80px" color={headerTextColor}>
                        Total Granos
                      </Th>
                      {especies.map(especie => (
                        <Th 
                          key={especie.id} 
                          borderWidth={1} 
                          borderColor={borderColor}
                          minW="120px"
                          textAlign="center"
                          color={headerTextColor}
                          transform="rotate(-45deg)"
                          transformOrigin="center"
                          height="80px"
                        >
                          <Text fontSize="xs" fontWeight="bold" whiteSpace="nowrap">
                            {especie.nombre}
                          </Text>
                        </Th>
                      ))}
                      <Th borderWidth={1} borderColor={borderColor} minW="80px" color={headerTextColor}>
                        Total %
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {pools.map((pool) => {
                      let totalPorcentaje = 0;
                      return (
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
                              new Date(pool.fecha_analisis).toLocaleDateString() : 
                              'Sin fecha'
                            }
                          </Td>
                          <Td borderWidth={1} borderColor={borderColor} textAlign="center">
                            <Badge colorScheme="blue" fontSize="sm">
                              {pool.total_granos}
                            </Badge>
                          </Td>
                          {especies.map(especie => {
                            const conteo = pivotData[pool.id][especie.id];
                            if (conteo) {
                              totalPorcentaje += conteo.porcentaje;
                            }
                            return (
                              <Td 
                                key={especie.id} 
                                borderWidth={1} 
                                borderColor={borderColor}
                                textAlign="center"
                              >
                                {conteo ? (
                                  <Badge colorScheme="teal" fontSize="sm" px={2} py={1}>
                                    {conteo.porcentaje.toFixed(1)}%
                                  </Badge>
                                ) : (
                                  <Text color="gray.400" fontSize="sm">-</Text>
                                )}
                              </Td>
                            );
                          })}
                          <Td borderWidth={1} borderColor={borderColor} textAlign="center">
                            <Badge 
                              colorScheme={Math.abs(totalPorcentaje - 100) < 1 ? "green" : "orange"} 
                              fontSize="sm"
                            >
                              {totalPorcentaje.toFixed(1)}%
                            </Badge>
                          </Td>
                        </Tr>
                      );
                    })}
                  </Tbody>
                </Table>
              </TableContainer>
            </Box>
          )}

          <Flex justify="space-between" align="center" mt={4}>
            <Text fontSize="sm" color="gray.600">
              Total de pools: {pools.length}
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

export default ReportePorcentajes; 