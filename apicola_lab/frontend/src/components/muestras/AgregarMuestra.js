import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Flex, Text, VStack, Input, Textarea, FormControl, FormLabel, Select } from '@chakra-ui/react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const AgregarMuestra = () => {
  // hay que obtener el id del usuario logueado
  const [analistas, setAnalistas] = useState([]);
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
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API_URL}/muestras/`, form);
      navigate(`/contador-polen/${res.data.id}`);
    } catch (err) {
      setError('Error al crear la muestra: ' + (err.response?.data ? JSON.stringify(err.response.data) : err.message));
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
              <FormLabel>Fecha de Extracción</FormLabel>
              <Input type="date" name="fecha_extraccion" value={form.fecha_extraccion} onChange={handleChange} />
            </FormControl>
            <FormControl mb={4} isRequired>
              <FormLabel>Fecha de Análisis</FormLabel>
              <Input type="date" name="fecha_analisis" value={form.fecha_analisis} onChange={handleChange} />
            </FormControl>
            <FormControl mb={4} isRequired>
              <FormLabel>Número de Registro</FormLabel>
              <Input type="text" name="num_registro" value={form.num_registro} onChange={handleChange} />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Observaciones</FormLabel>
              <Textarea name="observaciones" value={form.observaciones} onChange={handleChange} />
            </FormControl>
            <FormControl mb={4} isRequired>
              <FormLabel>Analista que crea la muestra</FormLabel>
              <Select name="analista" value={form.analista} onChange={handleChange} placeholder="Seleccione un analista">
                {analistas.map(analista => (
                  <option key={analista.id} value={analista.id}>
                    {analista.nombres} {analista.apellidos}
                  </option>
                ))}
              </Select>
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