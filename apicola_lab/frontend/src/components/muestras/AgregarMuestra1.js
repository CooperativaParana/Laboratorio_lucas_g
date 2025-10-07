import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Flex, Text, VStack, Input, Textarea, FormControl, FormLabel, Select as ChakraSelect } from '@chakra-ui/react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const AgregarMuestra1 = () => {
  const [analistas, setAnalistas] = useState([]);
  const [tambores, setTambores] = useState([]);
  const [form, setForm] = useState({
    color: '',
    humedad: '',
    fecha_extraccion: '',
    fecha_analisis: '',
    num_registro: '',
    observaciones: '',
    analista: '',
    tambor: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API_URL}/api/analistas/`)
      .then(res => setAnalistas(res.data))
      .catch(err => setError('Error al cargar analistas: ' + (err.response?.data ? JSON.stringify(err.response.data) : err.message)));
    axios.get(`${API_URL}/api/tambores/`)
      .then(res => setTambores(res.data))
      .catch(err => setError('Error al cargar tambores: ' + (err.response?.data ? JSON.stringify(err.response.data) : err.message)));
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post(`${API_URL}/api/analisis-fisicoquimicos/`, form);
      navigate('/muestras-fisicoquimicas');
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
            Crear Muestra - Análisis Fisicoquímico
          </Text>
          <form style={{ width: '100%' }} onSubmit={handleSubmit}>
            <FormControl mb={4} isRequired>
              <FormLabel>Color</FormLabel>
              <Input type="number" name="color" value={form.color} onChange={handleChange} />
            </FormControl>
            <FormControl mb={4} isRequired>
              <FormLabel>Humedad (%)</FormLabel>
              <Input type="number" step="0.01" name="humedad" value={form.humedad} onChange={handleChange} />
            </FormControl>
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
              <FormLabel>Analista</FormLabel>
              <ChakraSelect name="analista" value={form.analista} onChange={handleChange} placeholder="Seleccione un analista">
                {analistas.map(analista => (
                  <option key={analista.id} value={analista.id}>
                    {analista.nombres} {analista.apellidos}
                  </option>
                ))}
              </ChakraSelect>
            </FormControl>
            <FormControl mb={4} isRequired>
              <FormLabel>Tambor</FormLabel>
              <ChakraSelect name="tambor" value={form.tambor} onChange={handleChange} placeholder="Seleccione un tambor">
                {tambores.map(tambor => (
                  <option key={tambor.id} value={tambor.id}>
                    {tambor.num_registro}
                  </option>
                ))}
              </ChakraSelect>
            </FormControl>
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

export default AgregarMuestra1; 