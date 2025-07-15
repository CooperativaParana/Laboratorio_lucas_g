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

  useEffect(() => {
    const fetchAnalisis = async () => {
      setLoading(true);
      setError('');
      try {
        // Obtener ambos tipos de análisis
        const [palinoRes, fisicoRes] = await Promise.all([
          axios.get(`${API_URL}/analisis-palinologicos/`),
          axios.get(`${API_URL}/analisis-fisicoquimicos/`)
        ]);
        // Agregar tipo a cada uno
        const palino = palinoRes.data.map(a => ({ ...a, tipo: 'Palinológico' }));
        const fisico = fisicoRes.data.map(a => ({ ...a, tipo: 'Fisicoquímico' }));
        setAnalisis([...palino, ...fisico]);
      } catch (err) {
        setError('Error al cargar los análisis');
      }
      setLoading(false);
    };
    fetchAnalisis();
  }, []);

  // Filtrado de análisis
  const analisisFiltrados = analisis.filter(a => {
    // Filtrar por analista (nombre o apellido)
    const nombreAnalista = (a.analista?.nombres || a.analista || '').toLowerCase();
    const coincideAnalista = nombreAnalista.includes(filtroAnalista.toLowerCase());
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

  const handleEditar = (tipo, id) => {
    if (tipo === 'Palinológico') {
      navigate(`/editar-analisis-palinologico/${id}`);
    } else {
      navigate(`/editar-analisis-fisicoquimico/${id}`);
    }
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg="gray.50">
      <Box bg="white" p={8} rounded="lg" boxShadow="lg" w={{ base: '98%', md: '800px' }}>
        <VStack spacing={6} align="center">
          <Text as="h1" fontSize="2xl" fontWeight="bold">Todos los análisis</Text>
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
              {analisisFiltrados.length === 0 ? (
                <Text>No hay análisis registrados.</Text>
              ) : (
                analisisFiltrados.map(a => (
                  <Box key={a.id} borderWidth={1} borderRadius="md" p={4} mb={3} w="100%" bg="gray.100">
                    <HStack justify="space-between" align="center">
                      <VStack align="start" spacing={1}>
                        <Text><b>ID:</b> {a.id}</Text>
                        <Text><b>Analista:</b> {a.analista?.nombres || a.analista}</Text>
                        <Text><b>Tipo:</b> {a.tipo}</Text>
                      </VStack>
                      <Button colorScheme="yellow" onClick={() => handleEditar(a.tipo, a.id)}>
                        Editar
                      </Button>
                    </HStack>
                  </Box>
                ))
              )}
            </Box>
          )}
        </VStack>
      </Box>
    </Flex>
  );
};

export default TodosAnalisis; 