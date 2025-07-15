import React, { useEffect, useState } from 'react';
import { Box, Button, Flex, Text, VStack, HStack, Spinner, Input } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const TodosAnalisis = () => {
  const [analisis, setAnalisis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [filtroAnalista, setFiltroAnalista] = useState('');
  const [filtroFechaDesde, setFiltroFechaDesde] = useState('');
  const [filtroFechaHasta, setFiltroFechaHasta] = useState('');
  const [pools, setPools] = useState([]);
  const [analistas, setAnalistas] = useState([]);

  useEffect(() => {
    const fetchAnalisis = async () => {
      setLoading(true);
      setError('');
      try {
        // Obtener ambos tipos de análisis, pools y analistas
        const [palinoRes, fisicoRes, poolsRes, analistasRes] = await Promise.all([
          axios.get(`${API_URL}/analisis-palinologicos/`),
          axios.get(`${API_URL}/analisis-fisicoquimicos/`),
          axios.get(`${API_URL}/muestras/`),
          axios.get(`${API_URL}/analistas/`)
        ]);
        // Agrupar análisis palinológicos por pool
        const palinoPorPool = {};
        palinoRes.data.forEach(a => {
          if (!palinoPorPool[a.pool]) palinoPorPool[a.pool] = [];
          palinoPorPool[a.pool].push(a);
        });
        // Filtrar pools que tienen análisis palinológico
        const poolsConPalino = poolsRes.data.filter(pool => palinoPorPool[pool.id]);
        // Marcar tipo y guardar ids de análisis palinológicos
        const poolsPalino = poolsConPalino.map(pool => ({
          ...pool,
          tipo: 'Palinológico',
          analisisPalinologicoIds: palinoPorPool[pool.id]?.map(a => a.id) || []
        }));
        // Agregar tipo a fisicoquímicos
        const fisico = fisicoRes.data.map(a => ({ ...a, tipo: 'Fisicoquímico' }));
        setPools(poolsPalino);
        setAnalisis(fisico);
        setAnalistas(analistasRes.data);
      } catch (err) {
        setError('Error al cargar los análisis');
      }
      setLoading(false);
    };
    fetchAnalisis();
  }, []);

  // Función para obtener el nombre completo del analista por ID
  const getNombreAnalista = (id) => {
    const analista = analistas.find(a => a.id === id);
    return analista ? `${analista.nombres} ${analista.apellidos || ''}` : id;
  };

  // Filtrado de análisis
  const poolsFiltrados = pools.filter(pool => {
    // Filtrar por analista (nombre o apellido)
    let nombreAnalista = '';
    if (typeof pool.analista === 'object' && pool.analista !== null) {
      nombreAnalista = pool.analista.nombres || '';
    } else if (pool.analista !== undefined && pool.analista !== null) {
      nombreAnalista = pool.analista;
    }
    const coincideAnalista = nombreAnalista.toString().toLowerCase().includes(filtroAnalista.toLowerCase());
    // Filtrar por fecha (fecha_analisis)
    let coincideFecha = true;
    if (filtroFechaDesde) {
      coincideFecha = pool.fecha_analisis >= filtroFechaDesde;
    }
    if (coincideFecha && filtroFechaHasta) {
      coincideFecha = pool.fecha_analisis <= filtroFechaHasta;
    }
    return coincideAnalista && coincideFecha;
  });
  const analisisFiltrados = analisis.filter(a => {
    let nombreAnalista = '';
    if (typeof a.analista === 'object' && a.analista !== null) {
      nombreAnalista = a.analista.nombres || '';
    } else if (a.analista !== undefined && a.analista !== null) {
      nombreAnalista = a.analista;
    }
    const coincideAnalista = nombreAnalista.toString().toLowerCase().includes(filtroAnalista.toLowerCase());
    // Filtrar por fecha (fecha_analisis)
    let coincideFecha = true;
    if (filtroFechaDesde) {
      coincideFecha = a.fecha_analisis >= filtroFechaDesde;
    }
    if (coincideFecha && filtroFechaHasta) {
      coincideFecha = a.fecha_analisis <= filtroFechaHasta;
    }
    return coincideAnalista && coincideFecha;
  });

  // Ordenar por fecha de análisis descendente
  const poolsOrdenados = [...poolsFiltrados].sort((a, b) => (b.fecha_analisis || '').localeCompare(a.fecha_analisis || ''));
  const analisisOrdenados = [...analisisFiltrados].sort((a, b) => (b.fecha_analisis || '').localeCompare(a.fecha_analisis || ''));

  const handleEditar = (tipo, id, poolId) => {
    if (tipo === 'Palinológico') {
      navigate(`/contador-polen/${poolId}`);
    } else {
      navigate(`/editar-analisis-fisicoquimico/${id}`);
    }
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg="gray.50">
      <Box bg="white" p={8} rounded="lg" boxShadow="lg" w={{ base: '98%', md: '800px' }}>
        <VStack spacing={6} align="center">
          <Text as="h1" fontSize="2xl" fontWeight="bold">Todos los análisis</Text>
          <Button colorScheme="gray" alignSelf="flex-start" onClick={() => navigate('/menu')} mb={2}>
            Volver al menú
          </Button>
          {/* Filtros */}
          <Flex w="100%" gap={4} flexWrap="wrap" justify="center">
            <Input
              placeholder="Buscar por analista..."
              value={filtroAnalista}
              onChange={e => setFiltroAnalista(e.target.value)}
              maxW="220px"
              bg="white"
            />
            <Input
              type="date"
              placeholder="Desde"
              value={filtroFechaDesde}
              onChange={e => setFiltroFechaDesde(e.target.value)}
              maxW="160px"
              bg="white"
            />
            <Input
              type="date"
              placeholder="Hasta"
              value={filtroFechaHasta}
              onChange={e => setFiltroFechaHasta(e.target.value)}
              maxW="160px"
              bg="white"
            />
          </Flex>
          {loading ? <Spinner size="xl" /> : error ? <Text color="red.500">{error}</Text> : (
            <Box w="100%">
              {/* Mostrar pools con análisis palinológico */}
              {poolsOrdenados.map(pool => (
                <Box key={pool.id} borderWidth={1} borderRadius="md" p={4} mb={3} w="100%" bg="gray.100">
                  <HStack justify="space-between" align="center">
                    <VStack align="start" spacing={1}>
                      <Text><b>ID Pool:</b> {pool.id}</Text>
                      <Text><b>Analista:</b> {typeof pool.analista === 'object' && pool.analista !== null ? `${pool.analista.nombres} ${pool.analista.apellidos || ''}` : getNombreAnalista(pool.analista)}</Text>
                      <Text><b>Tipo:</b> {pool.tipo}</Text>
                      <Text><b>Fecha de análisis:</b> {pool.fecha_analisis}</Text>
                    </VStack>
                    <Button colorScheme="yellow" onClick={() => handleEditar(pool.tipo, null, pool.id)}>
                      Editar
                    </Button>
                  </HStack>
                </Box>
              ))}
              {/* Mostrar análisis fisicoquímicos individuales */}
              {analisisOrdenados.map(a => (
                <Box key={a.id} borderWidth={1} borderRadius="md" p={4} mb={3} w="100%" bg="gray.100">
                  <HStack justify="space-between" align="center">
                    <VStack align="start" spacing={1}>
                      <Text><b>ID:</b> {a.id}</Text>
                      <Text><b>Analista:</b> {typeof a.analista === 'object' && a.analista !== null ? `${a.analista.nombres} ${a.analista.apellidos || ''}` : getNombreAnalista(a.analista)}</Text>
                      <Text><b>Tipo:</b> {a.tipo}</Text>
                      <Text><b>Fecha de análisis:</b> {a.fecha_analisis}</Text>
                    </VStack>
                    <Button colorScheme="yellow" onClick={() => handleEditar(a.tipo, a.id)}>
                      Editar
                    </Button>
                  </HStack>
                </Box>
              ))}
              {poolsOrdenados.length === 0 && analisisOrdenados.length === 0 && (
                <Text>No hay análisis registrados.</Text>
              )}
            </Box>
          )}
        </VStack>
      </Box>
    </Flex>
  );
};

export default TodosAnalisis; 