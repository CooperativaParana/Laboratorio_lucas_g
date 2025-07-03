import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Flex, Text, VStack, Input, Textarea, FormControl, FormLabel } from '@chakra-ui/react';

const AgregarMuestra = () => {
  // Simulación: el analista es el usuario logueado, por ahora id=1
  const analistaId = 1;
  const [form, setForm] = useState({
    analista: analistaId,
    fecha_extraccion: '',
    fecha_analisis: '',
    num_registro: '',
    observaciones: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/muestras/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        const data = await res.json();
        navigate(`/contador-polen/${data.id}`);
      } else {
        const err = await res.json();
        setError('Error al crear la muestra: ' + JSON.stringify(err));
      }
    } catch (err) {
      setError('Error de red');
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