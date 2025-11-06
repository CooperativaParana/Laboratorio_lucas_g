import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Flex, Text, VStack, Input, Textarea, FormControl, FormLabel, Select as ChakraSelect, useToast, Badge, HStack, IconButton, SimpleGrid } from '@chakra-ui/react';
import { CheckCircleIcon, CloseIcon } from '@chakra-ui/icons';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const AgregarMuestra = () => {
  const [analistas, setAnalistas] = useState([]);
  const [tambores, setTambores] = useState([]);
  const [selectedTambores, setSelectedTambores] = useState([]);
  const [form, setForm] = useState({
    analista: '',
    fecha_extraccion: '',
    fecha_analisis: '',
    num_registro: '',
    observaciones: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Obtener la lista de analistas
    axios.get(`${API_URL}/api/analistas/`)
      .then(res => setAnalistas(res.data))
      .catch(err => setError('Error al cargar analistas: ' + (err.response?.data ? JSON.stringify(err.response.data) : err.message)));
    
    // Obtener solo tambores disponibles (estado_analisis_palinologico = false)
    axios.get(`${API_URL}/api/tambores/?disponibles=true`)
      .then(res => setTambores(res.data))
      .catch(err => setError('Error al cargar tambores: ' + (err.response?.data ? JSON.stringify(err.response.data) : err.message)));
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Función para verificar tambores duplicados en la selección actual
  const hayTamboresDuplicados = () => {
    const tamboresIds = selectedTambores.map(id => parseInt(id));
    return new Set(tamboresIds).size !== tamboresIds.length;
  };

  // Obtener tambores disponibles (no seleccionados aún)
  const tamboresDisponibles = tambores.filter(t => 
    !selectedTambores.includes(String(t.id))
  );

  // Obtener tambores ya seleccionados
  const tamboresSeleccionados = tambores.filter(t => selectedTambores.includes(String(t.id)));

  const handleAgregarTambor = (id) => {
    // Verificar que no esté ya seleccionado
    if (selectedTambores.includes(String(id))) {
      setError('Este tambor ya está seleccionado.');
      return;
    }
    setSelectedTambores(prev => [...prev, String(id)]);
    setError(''); // Limpiar error si la selección es válida
  };

  const handleQuitarTambor = (id) => {
    setSelectedTambores(prev => prev.filter(tid => tid !== String(id)));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
   
    // Validaciones antes de crear el pool
    if (!form.analista || selectedTambores.length === 0) {
      setError('Debe seleccionar un analista y al menos un tambor.');
      setLoading(false);
      return;
    }
   
    // Verificar tambores duplicados en la selección
    if (hayTamboresDuplicados()) {
      setError('No puede seleccionar el mismo tambor más de una vez.');
      setLoading(false);
      return;
    }
   
    try {
      // Crear el pool (muestra)
      const res = await axios.post(`${API_URL}/api/muestras/`, form);
      const poolId = res.data.id;
      
      // Asociar tambores al pool y actualizar su estado
      await Promise.all(selectedTambores.map(tamborId =>
        axios.post(`${API_URL}/api/contiene-pool/`, {
          pool: poolId,
          tambor: tamborId,
          fecha_asociacion: form.fecha_analisis
        })
      ));

      // Actualizar el estado de los tambores a True (asignados)
      await Promise.all(selectedTambores.map(tamborId =>
        axios.patch(`${API_URL}/api/tambores/${tamborId}/`, {
          estado_analisis_palinologico: true
        })
      ));

      toast({
        title: 'Grupo creado',
        description: `Analista: ${analistas.find(a => a.id === Number(form.analista))?.nombres || ''}\nTambores: ${tamboresSeleccionados.map(t => t.num_registro).join(', ')}\nFecha análisis: ${form.fecha_analisis}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
        icon: <CheckCircleIcon color="green.400" boxSize={5} />
      });

      // Resetear formulario
      setForm({ analista: '', fecha_analisis: '', num_registro: '', observaciones: '' });
      setSelectedTambores([]);
      
      // Recargar tambores disponibles
      axios.get(`${API_URL}/api/tambores/?disponibles=true`)
        .then(res => setTambores(res.data))
        .catch(err => console.error('Error al recargar tambores:', err));

    } catch (err) {
      setError('Error al crear la muestra o asociar tambores: ' + (err.response?.data ? JSON.stringify(err.response.data) : err.message));
    }
    setLoading(false);
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg="gray.50" p={2}>
      <Box bg="white" p={6} rounded="lg" boxShadow="lg" w={{ base: '100%', md: '1100px' }}>
        <VStack spacing={6} align="center" w="100%">
          <Text as="h1" fontSize="3xl" fontWeight="bold" mb={2} color="blue.700">
            Crear Grupo - Análisis Palinológico
          </Text>
          <FormControl mb={2} isRequired w="100%">
            <FormLabel>Analista</FormLabel>
              <ChakraSelect name="analista" value={form.analista} onChange={handleChange} placeholder="Seleccione un analista">
                {analistas.map(analista => (
                  <option key={analista.id} value={analista.id}>
                    {analista.nombres} {analista.apellidos}
                  </option>
                ))}
              </ChakraSelect>
            </FormControl>
          <Flex direction={{ base: 'column', md: 'row' }} gap={6} w="100%">
            {/* Izquierda: Tambores disponibles */}
            <Box flex={1} bg="gray.100" p={4} rounded="md" minH="400px">
              <Text fontWeight="bold" mb={2} color="blue.800">
                Tambores disponibles ({tamboresDisponibles.length})
              </Text>
              {tamboresDisponibles.length === 0 && (
                <Box p={4} bg="blue.50" rounded="md" borderWidth={1} borderColor="blue.200">
                  <Text color="blue.700" fontWeight="medium" mb={2}>
                    📋 No hay tambores disponibles para seleccionar
                  </Text>
                  <Text fontSize="sm" color="blue.600">
                    Todos los tambores han sido asignados a grupos de análisis. 
                    Para crear un nuevo grupo, primero debe liberar tambores de grupos existentes.
                  </Text>
                </Box>
              )}
              <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
                {tamboresDisponibles.map(tambor => {
                  const primerApiario = tambor.apiarios && tambor.apiarios.length > 0 ? tambor.apiarios[0] : null;
                  const apicultor = primerApiario && primerApiario.apicultor
                    ? `${primerApiario.apicultor.nombre} ${primerApiario.apicultor.apellido}`
                    : '-';
                  const nombresApiarios = tambor.apiarios && tambor.apiarios.length > 0
                    ? tambor.apiarios.map(a => a.nombre_apiario).join(', ')
                    : '-';
                  const fechaExtraccion = tambor.fecha_de_extraccion ? new Date(tambor.fecha_de_extraccion).toLocaleDateString('es-ES', { timeZone: 'UTC' }) : '-';
                  const tipo = tambor.fecha_de_extraccion ? 'Interno' : 'Externo';
                  const badgeColor = tambor.fecha_de_extraccion ? 'green' : 'orange';
                  return (
                    <Box
                      key={tambor.id}
                      borderWidth={2}
                      borderColor="blue.200"
                      bg="white"
                  borderRadius="md"
                      p={3}
                      boxShadow="sm"
                      cursor="pointer"
                      _hover={{ boxShadow: 'md', borderColor: 'blue.400', bg: 'blue.50' }}
                      transition="all 0.2s"
                      onClick={() => handleAgregarTambor(tambor.id)}
                      display="flex"
                      flexDirection="column"
                      alignItems="flex-start"
                    >
                      <HStack w="100%" justify="space-between">
                        <Text fontWeight="bold" fontSize="xl" color="blue.700">#{tambor.num_registro}</Text>
                        <Badge colorScheme={badgeColor}>{tipo}</Badge>
                      </HStack>
                      <Text fontSize="sm" color="gray.700"><b>Apiario:</b> {nombresApiarios}</Text>
                      <Text fontSize="sm" color="gray.700"><b>Productor:</b> {apicultor}</Text>
                      <Text fontSize="sm" color="gray.700"><b>Fecha extracción:</b> {fechaExtraccion}</Text>
                    </Box>
                  );
                })}
              </SimpleGrid>
            </Box>
            {/* Derecha: Tambores seleccionados y datos pool */}
            <Box flex={1} bg="gray.100" p={4} rounded="md" minH="400px">
              <Text fontWeight="bold" mb={2} color="blue.800">Tambores seleccionados</Text>
              <VStack align="stretch" spacing={2} mb={4}>
                {tamboresSeleccionados.length === 0 && <Text color="gray.500">Seleccione tambores de la izquierda</Text>}
                {tamboresSeleccionados.map(tambor => {
                      const primerApiario = tambor.apiarios && tambor.apiarios.length > 0 ? tambor.apiarios[0] : null;
                      const apicultor = primerApiario && primerApiario.apicultor
                        ? `${primerApiario.apicultor.nombre} ${primerApiario.apicultor.apellido}`
                        : '-';
                      const nombresApiarios = tambor.apiarios && tambor.apiarios.length > 0
                        ? tambor.apiarios.map(a => a.nombre_apiario).join(', ')
                        : '-';
                  const fechaExtraccion = tambor.fecha_de_extraccion ? new Date(tambor.fecha_de_extraccion).toLocaleDateString('es-ES', { timeZone: 'UTC' }) : '-';
                  const tipo = tambor.fecha_de_extraccion ? 'Interno' : 'Externo';
                  const badgeColor = tambor.fecha_de_extraccion ? 'green' : 'orange';
                      return (
                        <Box
                          key={tambor.id}
                      borderWidth={2}
                      borderColor="blue.300"
                      bg="white"
                          borderRadius="md"
                      p={3}
                      boxShadow="sm"
                      display="flex"
                      flexDirection="row"
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Box>
                        <HStack>
                          <Text fontWeight="bold" fontSize="lg" color="blue.700">#{tambor.num_registro}</Text>
                          <Badge colorScheme={badgeColor}>{tipo}</Badge>
                        </HStack>
                        <Text fontSize="sm" color="gray.700"><b>Apiario:</b> {nombresApiarios}</Text>
                        <Text fontSize="sm" color="gray.700"><b>Productor:</b> {apicultor}</Text>
                        <Text fontSize="sm" color="gray.700"><b>Fecha extracción:</b> {fechaExtraccion}</Text>
                      </Box>
                      <IconButton
                        aria-label="Quitar tambor"
                        icon={<CloseIcon boxSize={4} />}
                        colorScheme="red"
                        variant="ghost"
                        onClick={() => handleQuitarTambor(tambor.id)}
                      />
                        </Box>
                      );
                    })}
              </VStack>
              <form onSubmit={handleSubmit}>
                <FormControl mb={3}>
              <FormLabel>Fecha de Análisis</FormLabel>
              <Input type="date" name="fecha_analisis" value={form.fecha_analisis} onChange={handleChange} />
            </FormControl>
                <FormControl mb={3}>
              <FormLabel>Observaciones</FormLabel>
              <Textarea name="observaciones" value={form.observaciones} onChange={handleChange} />
            </FormControl>
                {error && <Text color="red.500" mb={2}>{error}</Text>}
                <Button colorScheme="blue" type="submit" isLoading={loading} w="100%" leftIcon={<CheckCircleIcon boxSize={5} />}>
                  Crear Grupo
                </Button>
                <Button mt={2} colorScheme="gray" variant="outline" w="100%" onClick={() => navigate('/muestras')}>
                  Ir a lista de Grupos
            </Button>
          </form>
            </Box>
          </Flex>
        </VStack>
      </Box>
    </Flex>
  );
};

export default AgregarMuestra; 