import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Flex, Text, VStack, Input, Textarea, FormControl, FormLabel, Select as ChakraSelect } from '@chakra-ui/react';
import axios from 'axios';
import Select from 'react-select';

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
  const navigate = useNavigate();

  useEffect(() => {
    // Obtener la lista de analistas
    axios.get(`${API_URL}/analistas/`)
      .then(res => setAnalistas(res.data))
      .catch(err => setError('Error al cargar analistas: ' + (err.response?.data ? JSON.stringify(err.response.data) : err.message)));
    // Obtener la lista de tambores
    axios.get(`${API_URL}/tambores/`)
      .then(res => setTambores(res.data))
      .catch(err => setError('Error al cargar tambores: ' + (err.response?.data ? JSON.stringify(err.response.data) : err.message)));
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleTamboresChange = (e) => {
    const selected = Array.from(e.target.selectedOptions, option => option.value);
    setSelectedTambores(selected);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API_URL}/muestras/`, form);
      const poolId = res.data.id;
      // Asociar cada tambor seleccionado al pool
      await Promise.all(selectedTambores.map(tamborId =>
        axios.post(`${API_URL}/contiene-pool/`, {
          pool: poolId,
          tambor: tamborId,
          fecha_asociacion: form.fecha_analisis
        })
      ));
      navigate(`/contador-polen/${poolId}`);
    } catch (err) {
      setError('Error al crear la muestra o asociar tambores: ' + (err.response?.data ? JSON.stringify(err.response.data) : err.message));
    }
    setLoading(false);
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg="transparent">
      <Box
        bg="white"
        p={8}
        rounded="lg"
        boxShadow="lg"
        w={{ base: '90%', md: '600px' }}
        className="honeycomb-glow"
      >
        <VStack spacing={6} align="center">
          <Text as="h1" fontSize="3xl" fontWeight="bold" mb={6}>
            Crear Muestra - Análisis Palinológico
          </Text>
          <form style={{ width: '100%' }} onSubmit={handleSubmit}>
            <FormControl mb={4} isRequired>
              <FormLabel>Analista que crea la muestra</FormLabel>
              <ChakraSelect name="analista" value={form.analista} onChange={handleChange} placeholder="Seleccione un analista">
                {analistas.map(analista => (
                  <option key={analista.id} value={analista.id}>
                    {analista.nombres} {analista.apellidos}
                  </option>
                ))}
              </ChakraSelect>
            </FormControl>
            <FormControl mb={4} isRequired>
              <FormLabel>Tambores que componen el pool</FormLabel>
              <Box>
                <Box
                  maxH="350px" // Altura máxima del cuadro de tarjetas
                  overflowY="auto"
                  border="1px solid #E2E8F0"
                  borderRadius="md"
                  p={2}
                  bg="gray.50"
                >
                  <Flex wrap="wrap" gap={4}>
                    {tambores.length === 0 && (
                      <Text color="gray.500">No hay tambores disponibles.</Text>
                    )}
                    {tambores.map(tambor => {
                      const isSelected = selectedTambores.includes(String(tambor.id));
                      // Lógica para mostrar apicultor y apiarios
                      const primerApiario = tambor.apiarios && tambor.apiarios.length > 0 ? tambor.apiarios[0] : null;
                      const apicultor = primerApiario && primerApiario.apicultor
                        ? `${primerApiario.apicultor.nombre} ${primerApiario.apicultor.apellido}`
                        : '-';
                      const nombresApiarios = tambor.apiarios && tambor.apiarios.length > 0
                        ? tambor.apiarios.map(a => a.nombre_apiario).join(', ')
                        : '-';
                      return (
                        <Box
                          key={tambor.id}
                          borderWidth={isSelected ? 2 : 1}
                          borderColor={isSelected ? 'yellow.400' : 'gray.200'}
                          bg={isSelected ? 'yellow.50' : 'white'}
                          borderRadius="md"
                          p={4}
                          minW="220px"
                          maxW="250px"
                          boxShadow={isSelected ? 'md' : 'sm'}
                          transition="all 0.2s"
                          position="relative"
                        >
                          <Flex align="center" justify="space-between" mb={2}>
                            <Text fontWeight="bold" fontSize="lg">#{tambor.num_registro}</Text>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={e => {
                                if (e.target.checked) {
                                  setSelectedTambores(prev => [...prev, String(tambor.id)]);
                                } else {
                                  setSelectedTambores(prev => prev.filter(id => id !== String(tambor.id)));
                                }
                              }}
                              style={{ width: 20, height: 20 }}
                            />
                          </Flex>
                          <Box fontSize="sm" color="gray.700">
                            <div><strong>Apicultor:</strong> {apicultor}</div>
                            <div><strong>Apiario(s):</strong> {nombresApiarios}</div>
                            {/* Puedes agregar más campos si lo deseas */}
                          </Box>
                        </Box>
                      );
                    })}
                  </Flex>
                </Box>
                {selectedTambores.length > 0 && (
                  <Box mt={2} color="gray.600" fontSize="sm">
                    <strong>{selectedTambores.length}</strong> tambor(es) seleccionado(s)
                  </Box>
                )}
              </Box>
            </FormControl>
            <FormControl mb={4} isRequired>
              <FormLabel>Fecha de Extracción</FormLabel>
              <Input type="date" name="fecha_extraccion" value={form.fecha_extraccion} onChange={handleChange} />
            </FormControl>
            <FormControl mb={4} isRequired>
              <FormLabel>Fecha de Análisis</FormLabel>
              <Input type="date" name="fecha_analisis" value={form.fecha_analisis} onChange={handleChange} />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Observaciones</FormLabel>
              <Textarea name="observaciones" value={form.observaciones} onChange={handleChange} />
            </FormControl>
            {/* El campo analista se envía automáticamente con el id del usuario logueado, reemplazar el valor de analistaId por el ID real del usuario autenticado. */}
            {error && <Text color="red.500">{error}</Text>}
            <Button colorScheme="yellow" type="submit" isLoading={loading} w="100%">
              Crear muestra
            </Button>
          </form>
        </VStack>
      </Box>
    </Flex>
  );
};

export default AgregarMuestra; 