import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Flex, Text, VStack, Input, Textarea, FormControl, FormLabel, Select as ChakraSelect, useToast, Badge, HStack, IconButton, SimpleGrid } from '@chakra-ui/react';
import { CheckCircleIcon, CloseIcon } from '@chakra-ui/icons';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const AgregarMuestra = () => {
  // hay que obtener el id del usuario logueado
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
  const [pools, setPools] = useState([]);
  const toast = useToast();

  useEffect(() => {
    // Obtener la lista de analistas
    axios.get(`${API_URL}/analistas/`)
      .then(res => setAnalistas(res.data))
      .catch(err => setError('Error al cargar analistas: ' + (err.response?.data ? JSON.stringify(err.response.data) : err.message)));
    // Obtener la lista de tambores
    axios.get(`${API_URL}/tambores/`)
      .then(res => setTambores(res.data))
      .catch(err => setError('Error al cargar tambores: ' + (err.response?.data ? JSON.stringify(err.response.data) : err.message)));
    // Obtener la lista de pools existentes para validar tambores
    axios.get(`${API_URL}/muestras/`)
      .then(res => setPools(res.data))
      .catch(err => console.error('Error al cargar pools:', err));
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Función para verificar si un tambor ya está en algún pool
  const tamborYaEnPool = (tamborId) => {
    return pools.some(pool => {
      if (!pool.tambores || !Array.isArray(pool.tambores)) {
        return false;
      }
      return pool.tambores.some(t => t && t.id === tamborId);
    });
  };

  // Función para verificar tambores duplicados en la selección actual
  const hayTamboresDuplicados = () => {
    const tamboresIds = selectedTambores.map(id => parseInt(id));
    return new Set(tamboresIds).size !== tamboresIds.length;
  };

  // Función para obtener tambores disponibles (no en ningún pool)
  const tamboresDisponibles = tambores.filter(t => 
    !selectedTambores.includes(String(t.id)) && !tamborYaEnPool(t.id)
  );



  // Función para obtener tambores ya usados en otros pools
  const tamboresEnOtrosPools = tambores.filter(t => tamborYaEnPool(t.id));

  const tamboresSeleccionados = tambores.filter(t => selectedTambores.includes(String(t.id)));

  const handleAgregarTambor = (id) => {
    // Verificar que no esté ya seleccionado
    if (selectedTambores.includes(String(id))) {
      setError('Este tambor ya está seleccionado.');
      return;
    }
    // Verificar que no esté en otro pool
    if (tamborYaEnPool(id)) {
      setError('Este tambor ya está asignado a otro pool.');
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
   
   // Verificar que los tambores no estén ya en otros pools
   const tamboresEnOtrosPools = selectedTambores.filter(tamborId => tamborYaEnPool(parseInt(tamborId)));
   if (tamboresEnOtrosPools.length > 0) {
     setError(`Los siguientes tambores ya están asignados a otros pools: ${tamboresEnOtrosPools.join(', ')}`);
     setLoading(false);
     return;
   }
   
    try {
      const res = await axios.post(`${API_URL}/muestras/`, form);
      const poolId = res.data.id;
      await Promise.all(selectedTambores.map(tamborId =>
        axios.post(`${API_URL}/contiene-pool/`, {
          pool: poolId,
          tambor: tamborId,
          fecha_asociacion: form.fecha_analisis
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
      // Recargar pools para actualizar la lista de tambores disponibles
      axios.get(`${API_URL}/muestras/`)
        .then(res => setPools(res.data))
        .catch(err => console.error('Error al recargar pools:', err));
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
                    Todos los tambores han sido asignados a otros grupos de análisis. 
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
                  const fechaExtraccion = tambor.fecha_de_extraccion ? new Date(tambor.fecha_de_extraccion).toLocaleDateString() : '-';
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
             
              {/* Sección de tambores ya asignados */}
              {tamboresEnOtrosPools.length > 0 && (
                <Box mt={6} p={4} bg="orange.50" rounded="md" borderWidth={1} borderColor="orange.200">
                  <Text fontWeight="bold" color="orange.700" mb={2}>
                    ⚠️ Tambores ya asignados a otros grupos ({tamboresEnOtrosPools.length})
                  </Text>
                  <Text fontSize="sm" color="orange.600" mb={3}>
                    Estos tambores no están disponibles para seleccionar ya que pertenecen a otros grupos de análisis.
                  </Text>
                  <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3}>
                    {tamboresEnOtrosPools.map(tambor => {
                      const primerApiario = tambor.apiarios && tambor.apiarios.length > 0 ? tambor.apiarios[0] : null;
                      const apicultor = primerApiario && primerApiario.apicultor
                        ? `${primerApiario.apicultor.nombre} ${primerApiario.apicultor.apellido}`
                        : '-';
                      const nombresApiarios = tambor.apiarios && tambor.apiarios.length > 0
                        ? tambor.apiarios.map(a => a.nombre_apiario).join(', ')
                        : '-';
                      const fechaExtraccion = tambor.fecha_de_extraccion ? new Date(tambor.fecha_de_extraccion).toLocaleDateString() : '-';
                      const tipo = tambor.fecha_de_extraccion ? 'Interno' : 'Externo';
                      return (
                        <Box
                          key={tambor.id}
                          borderWidth={1}
                          borderColor="orange.300"
                          bg="white"
                          borderRadius="md"
                          p={2}
                          opacity={0.8}
                          cursor="not-allowed"
                        >
                          <HStack w="100%" justify="space-between">
                            <Text fontWeight="bold" fontSize="md" color="orange.600">#{tambor.num_registro}</Text>
                            <Badge colorScheme="orange" variant="outline">{tipo}</Badge>
                          </HStack>
                          <Text fontSize="xs" color="gray.600"><b>Apiario:</b> {nombresApiarios}</Text>
                          <Text fontSize="xs" color="gray.600"><b>Productor:</b> {apicultor}</Text>
                          <Text fontSize="xs" color="gray.600"><b>Fecha extracción:</b> {fechaExtraccion}</Text>
                        </Box>
                      );
                    })}
                  </SimpleGrid>
                </Box>
              )}
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
                  const fechaExtraccion = tambor.fecha_de_extraccion ? new Date(tambor.fecha_de_extraccion).toLocaleDateString() : '-';
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
                <Button mt={2} colorScheme="gray" variant="outline" w="100%" onClick={() => window.location.href = '/muestras'}>
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