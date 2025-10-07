import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Button, 
  Flex, 
  Text, 
  VStack, 
  HStack, 
  Spinner, 
  Select,
  Badge
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const TodosAnalisis = () => {
  const [muestras, setMuestras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [filtroEstudio, setFiltroEstudio] = useState('');
  const [filtroAnalista, setFiltroAnalista] = useState('');
  const [estudios, setEstudios] = useState([]);
  const [analistas, setAnalistas] = useState([]);

  useEffect(() => {
    const fetchMuestras = async () => {
      setLoading(true);
      setError('');
      try {
        // Obtener muestras palinológicas y fisicoquímicas
        const [palinoRes, fisicoRes, analistasRes] = await Promise.all([
          axios.get(`${API_URL}/api/muestras/`),
          axios.get(`${API_URL}/api/analisis-fisicoquimicos/`),
          axios.get(`${API_URL}/api/analistas/`)
        ]);

        // Procesar muestras palinológicas
        const muestrasPalino = palinoRes.data.map(muestra => ({
          ...muestra,
          tipo: 'Palinológico',
          id_muestra: muestra.id,
          estudio: muestra.num_registro || 'Sin estudio',
          analista: muestra.analista
        }));

        // Procesar muestras fisicoquímicas
        const muestrasFisico = fisicoRes.data.map(muestra => ({
          ...muestra,
          tipo: 'Fisicoquímico',
          id_muestra: muestra.id,
          estudio: muestra.num_registro || 'Sin estudio',
          analista: muestra.analista
        }));

        // Combinar todas las muestras
        const todasLasMuestras = [...muestrasPalino, ...muestrasFisico];

        setMuestras(todasLasMuestras);
        setAnalistas(analistasRes.data);

        // Extraer estudios únicos
        const estudiosUnicos = [...new Set(todasLasMuestras.map(m => m.estudio))];
        setEstudios(estudiosUnicos);

        console.log('Muestras cargadas:', todasLasMuestras.length);
        console.log('Estudios únicos:', estudiosUnicos);

      } catch (err) {
        console.error('Error al cargar muestras:', err);
        setError('Error al cargar las muestras: ' + err.message);
      }
      setLoading(false);
    };
    fetchMuestras();
  }, []);

  // Función para obtener el nombre completo del analista
  const getNombreAnalista = (analista) => {
    if (typeof analista === 'object' && analista !== null) {
      return `${analista.nombres || ''} ${analista.apellidos || ''}`.trim();
    } else if (analista !== undefined && analista !== null) {
      const analistaObj = analistas.find(a => a.id === analista);
      return analistaObj ? `${analistaObj.nombres} ${analistaObj.apellidos || ''}`.trim() : 'Sin analista';
    }
    return 'Sin analista';
  };

  // Filtrar muestras
  const muestrasFiltradas = muestras.filter(muestra => {
    const coincideEstudio = !filtroEstudio || muestra.estudio === filtroEstudio;
    const coincideAnalista = !filtroAnalista || getNombreAnalista(muestra.analista).toLowerCase().includes(filtroAnalista.toLowerCase());
    return coincideEstudio && coincideAnalista;
  });

  // Ordenar por fecha de análisis descendente
  const muestrasOrdenadas = [...muestrasFiltradas].sort((a, b) => 
    (b.fecha_analisis || '').localeCompare(a.fecha_analisis || '')
  );

  const handleEditar = (tipo, id) => {
    if (tipo === 'Palinológico') {
      navigate(`/editar-muestra/${id}`);
    } else {
      navigate(`/editar-muestra1/${id}`);
    }
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg="gray.50">
      <Box bg="white" p={8} rounded="lg" boxShadow="lg" w={{ base: '98%', md: '900px' }}>
        <VStack spacing={6} align="center">
          <Text as="h1" fontSize="2xl" fontWeight="bold">Todas las Muestras</Text>
          <Button colorScheme="gray" alignSelf="flex-start" onClick={() => navigate('/menu')} mb={2}>
            Volver al menú
          </Button>

          {/* Filtros */}
          <Flex w="100%" gap={4} flexWrap="wrap" justify="center">
            <Select
              placeholder="Filtrar por estudio"
              value={filtroEstudio}
              onChange={e => setFiltroEstudio(e.target.value)}
              maxW="250px"
              bg="white"
            >
              {estudios.map(estudio => (
                <option key={estudio} value={estudio}>
                  {estudio}
                </option>
              ))}
            </Select>
            <Select
              placeholder="Filtrar por analista"
              value={filtroAnalista}
              onChange={e => setFiltroAnalista(e.target.value)}
              maxW="250px"
              bg="white"
            >
              {analistas.map(analista => (
                <option key={analista.id} value={`${analista.nombres} ${analista.apellidos || ''}`}>
                  {analista.nombres} {analista.apellidos || ''}
                </option>
              ))}
            </Select>
          </Flex>

          {loading ? (
            <Spinner size="xl" />
          ) : error ? (
            <Text color="red.500">{error}</Text>
          ) : (
            <Box w="100%">
              <Text fontSize="sm" color="gray.600" mb={4}>
                Mostrando {muestrasOrdenadas.length} de {muestras.length} muestras
              </Text>

              {muestrasOrdenadas.map(muestra => (
                <Box 
                  key={`${muestra.tipo}-${muestra.id_muestra}`} 
                  borderWidth={1} 
                  borderRadius="md" 
                  p={4} 
                  mb={3} 
                  w="100%" 
                  bg="gray.50"
                  _hover={{ bg: "gray.100" }}
                >
                  <HStack justify="space-between" align="center">
                    <VStack align="start" spacing={1} flex={1}>
                      <HStack>
                        <Badge 
                          colorScheme={muestra.tipo === 'Palinológico' ? 'blue' : 'green'}
                          variant="subtle"
                        >
                          {muestra.tipo}
                        </Badge>
                        <Text fontWeight="bold">ID: {muestra.id_muestra}</Text>
                      </HStack>
                      <Text><b>Estudio:</b> {muestra.estudio}</Text>
                      <Text><b>Analista:</b> {getNombreAnalista(muestra.analista)}</Text>
                      {muestra.fecha_analisis && (
                        <Text><b>Fecha de análisis:</b> {muestra.fecha_analisis}</Text>
                      )}
                    </VStack>
                    <Button 
                      colorScheme="yellow" 
                      onClick={() => handleEditar(muestra.tipo, muestra.id_muestra)}
                      size="sm"
                    >
                      Editar
                    </Button>
                  </HStack>
                </Box>
              ))}

              {muestrasOrdenadas.length === 0 && (
                <Text textAlign="center" color="gray.500" py={8}>
                  No se encontraron muestras con los filtros aplicados.
                </Text>
              )}
            </Box>
          )}
        </VStack>
      </Box>
    </Flex>
  );
};

export default TodosAnalisis; 