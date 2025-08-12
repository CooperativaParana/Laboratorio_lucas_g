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
  HStack,
  Tooltip,
  Divider,
  Grid,
  GridItem,
  Card,
  CardBody,
  CardHeader,
  IconButton,
  useToast
} from '@chakra-ui/react';
import { 
  ArrowBackIcon, 
  DownloadIcon, 
  RepeatIcon, 
  ViewIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@chakra-ui/icons';
import { useColorModeValue } from '@chakra-ui/react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const ReportePorcentajes = () => {
  const [analisis, setAnalisis] = useState([]);
  const [pools, setPools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentView, setCurrentView] = useState('lista'); // 'lista' o 'reporte'
  const [selectedPool, setSelectedPool] = useState(null);
  const [poolAnalisis, setPoolAnalisis] = useState([]);
  const navigate = useNavigate();
  const toast = useToast();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const headerBg = useColorModeValue('blue.500', 'blue.600');
  const headerTextColor = useColorModeValue('white', 'white');
  const cardBg = useColorModeValue('gray.50', 'gray.700');

  useEffect(() => {
    cargarDatos();
  }, []);

  // Recargar datos cuando el componente recibe el foco
  useEffect(() => {
    const handleFocus = () => {
      if (currentView === 'lista') {
        cargarDatos();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [currentView]);

  const cargarDatos = async () => {
    setLoading(true);
    setError('');
    try {
      // Obtener análisis palinológicos con información de pool y especie
      const timestamp = new Date().getTime();
      const response = await axios.get(`${API_URL}/analisis-palinologicos/?_t=${timestamp}`);
      setAnalisis(response.data);
      
      // Extraer pools únicos de los análisis
      const poolsUnicos = extraerPoolsUnicos(response.data);
      setPools(poolsUnicos);
    } catch (err) {
      setError('Error al cargar los datos: ' + (err.response?.data ? JSON.stringify(err.response.data) : err.message));
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los datos',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const extraerPoolsUnicos = (analisisData) => {
    const poolsMap = new Map();
    
    analisisData.forEach(item => {
      if (item.pool && !poolsMap.has(item.pool.id)) {
        poolsMap.set(item.pool.id, {
          id: item.pool.id,
          num_registro: item.pool.num_registro || `Pool ${item.pool.id}`,
          fecha_analisis: item.pool.fecha_analisis,
          analista: item.pool.analista,
          observaciones: item.pool.observaciones,
          created_at: item.pool.created_at
        });
      }
    });

    return Array.from(poolsMap.values()).sort((a, b) => {
      if (a.fecha_analisis && b.fecha_analisis) {
        return new Date(b.fecha_analisis) - new Date(a.fecha_analisis);
      }
      return new Date(b.created_at) - new Date(a.created_at);
    });
  };

  const cargarAnalisisPool = async (poolId) => {
    try {
      const timestamp = new Date().getTime();
      const response = await axios.get(`${API_URL}/analisis-palinologicos/?pool=${poolId}&_t=${timestamp}`);
      setPoolAnalisis(response.data);
    } catch (err) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los análisis del pool',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleVerReporte = async (pool) => {
    setSelectedPool(pool);
    await cargarAnalisisPool(pool.id);
    setCurrentView('reporte');
  };

  const handleVolver = () => {
    setCurrentView('lista');
    setSelectedPool(null);
    setPoolAnalisis([]);
  };

  const handleVolverMenu = () => {
    navigate('/analisis-palinologico');
  };

  const handleDescargarPDF = () => {
    toast({
      title: 'Función en desarrollo',
      description: 'La descarga de PDF estará disponible próximamente',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  // Calcular porcentajes por especie para el pool seleccionado
  const calcularPorcentajesPool = useMemo(() => {
    if (!poolAnalisis.length) return [];

    const especiesMap = new Map();
    let totalGranos = 0;

    poolAnalisis.forEach(item => {
      if (item.especie && item.cantidad_granos) {
        const especieId = item.especie.id;
        const cantidad = item.cantidad_granos;
        
        if (!especiesMap.has(especieId)) {
          especiesMap.set(especieId, {
            id: especieId,
            nombre_cientifico: item.especie.nombre_cientifico || 'N/A',
            nombre_comun: item.especie.nombre_comun || 'N/A',
            familia: item.especie.familia || 'N/A',
            cantidad_granos: 0,
            porcentaje: 0
          });
        }
        
        especiesMap.get(especieId).cantidad_granos += cantidad;
        totalGranos += cantidad;
      }
    });

    // Calcular porcentajes
    especiesMap.forEach(especie => {
      especie.porcentaje = totalGranos > 0 ? (especie.cantidad_granos / totalGranos) * 100 : 0;
    });

    return Array.from(especiesMap.values())
      .sort((a, b) => b.porcentaje - a.porcentaje);
  }, [poolAnalisis]);

  if (loading) {
    return (
      <Flex minH="100vh" align="center" justify="center">
        <Spinner size="xl" />
      </Flex>
    );
  }

  // VISTA 1: Lista de Estudios
  if (currentView === 'lista') {
    return (
      <Flex minH="100vh" align="center" justify="center" bg="transparent" p={4}>
        <Container maxW="95%" bg="white" p={6} rounded="lg" boxShadow="lg" maxH="95vh" overflow="hidden" className="honeycomb-glow">
          <VStack spacing={6} align="stretch" h="100%">
            {/* Header */}
            <Box bg={headerBg} p={4} rounded="lg" color={headerTextColor} flexShrink={0}>
              <Flex justify="space-between" align="center">
                <Button 
                  leftIcon={<ArrowBackIcon />} 
                  onClick={handleVolverMenu} 
                  colorScheme="whiteAlpha" 
                  variant="outline"
                  size="sm"
                >
                  Volver
                </Button>
                <VStack spacing={1}>
                  <Heading size="lg" textAlign="center">
                    Estudios Melispalinológicos
                  </Heading>
                  <Text fontSize="sm" opacity={0.9}>
                    {new Date().toLocaleDateString('es-ES', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </Text>
                </VStack>
                <HStack spacing={2}>
                  <Button
                    leftIcon={<RepeatIcon />}
                    colorScheme="blue"
                    size="sm"
                    onClick={cargarDatos}
                    isLoading={loading}
                  >
                    Recargar
                  </Button>
                </HStack>
              </Flex>
            </Box>

            {error && (
              <Alert status="error" flexShrink={0}>
                <AlertIcon />
                {error}
              </Alert>
            )}

            {/* Estadísticas */}
            <Box p={4} bg="blue.50" rounded="md" flexShrink={0}>
              <HStack justify="space-between" align="center">
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm" fontWeight="bold" color="blue.700">
                    Resumen de Estudios
                  </Text>
                  <Text fontSize="xs" color="blue.600">
                    Total de estudios: {pools.length} | Total de análisis: {analisis.length}
                  </Text>
                </VStack>
                <Badge colorScheme={pools.length > 0 ? "green" : "red"} variant="solid">
                  {pools.length > 0 ? `${pools.length} estudios disponibles` : 'Sin estudios disponibles'}
                </Badge>
              </HStack>
            </Box>

            {pools.length === 0 ? (
              <Text textAlign="center" color="gray.500" fontSize="lg" flexShrink={0}>
                No hay estudios melispalinológicos disponibles.
              </Text>
            ) : (
              <Box 
                overflowX="auto" 
                overflowY="auto" 
                flex={1}
                minH="0"
                maxH="calc(95vh - 300px)"
              >
                <TableContainer>
                  <Table variant="striped" size="sm" borderWidth={1} borderColor={borderColor} minW="800px">
                    <Thead position="sticky" top={0} bg={headerBg} zIndex={1}>
                      <Tr>
                        <Th borderWidth={1} borderColor={borderColor} minW="100px" color={headerTextColor}>
                          ID Estudio
                        </Th>
                        <Th borderWidth={1} borderColor={borderColor} minW="120px" color={headerTextColor}>
                          N° Registro
                        </Th>
                        <Th borderWidth={1} borderColor={borderColor} minW="120px" color={headerTextColor}>
                          Fecha Análisis
                        </Th>
                        <Th borderWidth={1} borderColor={borderColor} minW="150px" color={headerTextColor}>
                          Analista
                        </Th>
                        <Th borderWidth={1} borderColor={borderColor} minW="100px" color={headerTextColor}>
                          Acciones
                        </Th>
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
                            {pool.num_registro}
                          </Td>
                          <Td borderWidth={1} borderColor={borderColor}>
                            {pool.fecha_analisis ? 
                              new Date(pool.fecha_analisis).toLocaleDateString('es-ES') : 
                              'Sin fecha'
                            }
                          </Td>
                          <Td borderWidth={1} borderColor={borderColor}>
                            {pool.analista ? 
                              `${pool.analista.nombres || ''} ${pool.analista.apellidos || ''}`.trim() || 'N/A' : 
                              'N/A'
                            }
                          </Td>
                          <Td borderWidth={1} borderColor={borderColor} textAlign="center">
                            <Button
                              leftIcon={<ViewIcon />}
                              colorScheme="blue"
                              size="sm"
                              onClick={() => handleVerReporte(pool)}
                            >
                              Ver Reporte
                            </Button>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            <Flex justify="center" align="center" mt={4} flexShrink={0}>
              <Text fontSize="sm" color="gray.600">
                Total de estudios: {pools.length}
              </Text>
            </Flex>
          </VStack>
        </Container>
      </Flex>
    );
  }

  // VISTA 2: Reporte Individual
  return (
    <Flex minH="100vh" align="flex-start" justify="center" bg="transparent" p={{ base: 2, md: 4 }}>
      <Container maxW="95%" bg="white" p={{ base: 4, md: 6 }} rounded="lg" boxShadow="lg" className="honeycomb-glow" my={4}>
        <VStack spacing={6} align="stretch">
          {/* Header del Reporte */}
          <Box bg={headerBg} p={4} rounded="lg" color={headerTextColor} flexShrink={0} position="sticky" top={0} zIndex={10}>
            <Flex 
              justify="space-between" 
              align="center"
              direction={{ base: "column", md: "row" }}
              spacing={{ base: 3, md: 0 }}
              gap={3}
            >
              <Button 
                leftIcon={<ChevronLeftIcon />} 
                onClick={handleVolver} 
                colorScheme="whiteAlpha" 
                variant="outline"
                size="sm"
                order={{ base: 1, md: 1 }}
              >
                Volver a Lista
              </Button>
              <VStack spacing={1} order={{ base: 2, md: 2 }}>
                <Heading size={{ base: "md", md: "lg" }} textAlign="center">
                  Reporte Melispalinológico
                </Heading>
                <Text fontSize={{ base: "xs", md: "sm" }} opacity={0.9} textAlign="center">
                  Estudio ID: {selectedPool?.id} - {new Date().toLocaleDateString('es-ES', { 
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
                order={{ base: 3, md: 3 }}
              >
                Descargar PDF
              </Button>
            </Flex>
          </Box>

          {/* Información del Estudio */}
          <Card bg={cardBg} borderWidth={1} borderColor={borderColor}>
            <CardHeader>
              <Heading size="md" color="blue.700">
                Información del Estudio
              </Heading>
            </CardHeader>
            <CardBody>
              <Grid templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={{ base: 3, md: 4 }}>
                <GridItem>
                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm" fontWeight="bold" color="gray.600">
                      Protocolo/ID:
                    </Text>
                    <Text fontSize="md" fontWeight="semibold">
                      {selectedPool?.num_registro || `Pool ${selectedPool?.id}`}
                    </Text>
                  </VStack>
                </GridItem>
                <GridItem>
                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm" fontWeight="bold" color="gray.600">
                      Solicitante:
                    </Text>
                    <Text fontSize="md">
                      {selectedPool?.analista ? 
                        `${selectedPool.analista.nombres || ''} ${selectedPool.analista.apellidos || ''}`.trim() || 'N/A' : 
                        'N/A'
                      }
                    </Text>
                  </VStack>
                </GridItem>
                <GridItem>
                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm" fontWeight="bold" color="gray.600">
                      Fecha de Análisis:
                    </Text>
                    <Text fontSize="md">
                      {selectedPool?.fecha_analisis ? 
                        new Date(selectedPool.fecha_analisis).toLocaleDateString('es-ES') : 
                        'Sin fecha'
                      }
                    </Text>
                  </VStack>
                </GridItem>
                <GridItem>
                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm" fontWeight="bold" color="gray.600">
                      Fecha de Creación:
                    </Text>
                    <Text fontSize="md">
                      {selectedPool?.created_at ? 
                        new Date(selectedPool.created_at).toLocaleDateString('es-ES') : 
                        'N/A'
                      }
                    </Text>
                  </VStack>
                </GridItem>
                <GridItem colSpan={{ base: 1, md: 2, lg: 2 }}>
                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm" fontWeight="bold" color="gray.600">
                      Observaciones:
                    </Text>
                    <Text fontSize="md">
                      {selectedPool?.observaciones || 'Sin observaciones'}
                    </Text>
                  </VStack>
                </GridItem>
              </Grid>
            </CardBody>
          </Card>

          {/* Tabla de Especies */}
          <Card bg={cardBg} borderWidth={1} borderColor={borderColor} flex={1}>
            <CardHeader>
              <Heading size="md" color="blue.700">
                Análisis de Especies Botánicas
              </Heading>
            </CardHeader>
            <CardBody>
              {calcularPorcentajesPool.length === 0 ? (
                <Text textAlign="center" color="gray.500" fontSize="lg">
                  No hay análisis de especies disponibles para este estudio.
                </Text>
              ) : (
                <Box 
                  overflowX="auto" 
                  maxH={{ base: "300px", md: "400px" }} 
                  overflowY="auto"
                  borderWidth={1}
                  borderColor={borderColor}
                  rounded="md"
                >
                  <Table variant="striped" size="sm" borderWidth={1} borderColor={borderColor} minW={{ base: "500px", md: "600px" }}>
                    <Thead bg={headerBg} position="sticky" top={0} zIndex={1}>
                      <Tr>
                        <Th borderWidth={1} borderColor={borderColor} color={headerTextColor} minW={{ base: "120px", md: "150px" }}>
                          Nombre Científico
                        </Th>
                        <Th borderWidth={1} borderColor={borderColor} color={headerTextColor} minW={{ base: "100px", md: "120px" }}>
                          Nombre Vulgar
                        </Th>
                        <Th borderWidth={1} borderColor={borderColor} color={headerTextColor} minW={{ base: "80px", md: "100px" }}>
                          Familia
                        </Th>
                        <Th borderWidth={1} borderColor={borderColor} color={headerTextColor} minW={{ base: "80px", md: "100px" }}>
                          Cantidad Granos
                        </Th>
                        <Th borderWidth={1} borderColor={borderColor} color={headerTextColor} minW={{ base: "80px", md: "100px" }}>
                          Porcentaje
                        </Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {calcularPorcentajesPool.map((especie) => (
                        <Tr key={especie.id} _hover={{ bg: 'gray.50' }}>
                          <Td borderWidth={1} borderColor={borderColor} fontWeight="semibold">
                            {especie.nombre_cientifico}
                          </Td>
                          <Td borderWidth={1} borderColor={borderColor}>
                            {especie.nombre_comun}
                          </Td>
                          <Td borderWidth={1} borderColor={borderColor}>
                            {especie.familia}
                          </Td>
                          <Td borderWidth={1} borderColor={borderColor} textAlign="center">
                            <Badge colorScheme="blue" fontSize="sm">
                              {especie.cantidad_granos}
                            </Badge>
                          </Td>
                          <Td borderWidth={1} borderColor={borderColor} textAlign="center">
                            <Badge colorScheme="teal" fontSize="sm" px={2} py={1}>
                              {especie.porcentaje.toFixed(1)}%
                            </Badge>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              )}
            </CardBody>
          </Card>

          {/* Resumen y Totales */}
          <Card bg={cardBg} borderWidth={1} borderColor={borderColor}>
            <CardBody>
              <Grid templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }} gap={{ base: 3, md: 4 }}>
                <GridItem>
                  <VStack align="center" spacing={1}>
                    <Text fontSize="sm" fontWeight="bold" color="gray.600">
                      Total de Especies
                    </Text>
                    <Badge colorScheme="green" fontSize="lg" px={3} py={1}>
                      {calcularPorcentajesPool.length}
                    </Badge>
                  </VStack>
                </GridItem>
                <GridItem>
                  <VStack align="center" spacing={1}>
                    <Text fontSize="sm" fontWeight="bold" color="gray.600">
                      Total de Granos
                    </Text>
                    <Badge colorScheme="blue" fontSize="lg" px={3} py={1}>
                      {calcularPorcentajesPool.reduce((sum, especie) => sum + especie.cantidad_granos, 0)}
                    </Badge>
                  </VStack>
                </GridItem>
                <GridItem>
                  <VStack align="center" spacing={1}>
                    <Text fontSize="sm" fontWeight="bold" color="gray.600">
                      Porcentaje Total
                    </Text>
                    <Badge 
                      colorScheme="teal" 
                      fontSize="lg" 
                      px={3} 
                      py={1}
                    >
                      {calcularPorcentajesPool.reduce((sum, especie) => sum + especie.porcentaje, 0).toFixed(1)}%
                    </Badge>
                  </VStack>
                </GridItem>
              </Grid>
            </CardBody>
          </Card>

          {/* Botones de Acción */}
          <Flex 
            justify={{ base: "center", md: "space-between" }} 
            align="center" 
            flexShrink={0}
            direction={{ base: "column", md: "row" }}
            spacing={{ base: 3, md: 0 }}
            gap={3}
          >
            <Button
              leftIcon={<ChevronLeftIcon />}
              colorScheme="blue"
              variant="outline"
              onClick={handleVolver}
              size={{ base: "md", md: "md" }}
              width={{ base: "full", md: "auto" }}
            >
              Volver a Lista
            </Button>
            <Button
              leftIcon={<DownloadIcon />}
              colorScheme="teal"
              onClick={handleDescargarPDF}
              size={{ base: "md", md: "md" }}
              width={{ base: "full", md: "auto" }}
            >
              Generar PDF
            </Button>
          </Flex>
        </VStack>
      </Container>
    </Flex>
  );
};

export default ReportePorcentajes; 