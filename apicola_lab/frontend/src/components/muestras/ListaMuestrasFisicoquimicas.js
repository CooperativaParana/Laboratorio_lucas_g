import React, { useEffect, useState } from 'react';
import { Box, Button, Flex, Text, VStack, HStack, Spinner } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const ListaMuestrasFisicoquimicas = () => {
  const [muestras, setMuestras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    setError('');
    axios.get(`${API_URL}/api/analisis-fisicoquimicos/`)
      .then(res => setMuestras(res.data))
      .catch(err => setError('Error al cargar las muestras: ' + (err.response?.data ? JSON.stringify(err.response.data) : err.message)))
      .finally(() => setLoading(false));
  }, []);

  const handleEditar = (id) => {
    navigate(`/editar-muestra1/${id}`);
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg="gray.50">
      <Box bg="white" p={8} rounded="lg" boxShadow="lg" w={{ base: '98%', md: '800px' }}>
        <VStack spacing={6} align="center">
          <Text as="h1" fontSize="2xl" fontWeight="bold">Muestras Fisicoquímicas</Text>
          {loading ? <Spinner size="xl" /> : error ? <Text color="red.500">{error}</Text> : (
            <Box w="100%">
              {muestras.length === 0 ? (
                <Text>No hay muestras registradas.</Text>
              ) : (
                muestras.map(m => (
                  <Box key={m.id} borderWidth={1} borderRadius="md" p={4} mb={3} w="100%" bg="gray.100">
                    <HStack justify="space-between" align="center">
                      <VStack align="start" spacing={1}>
                        <Text><b>ID:</b> {m.id}</Text>
                        <Text><b>Color:</b> {m.color}</Text>
                        <Text><b>Humedad:</b> {m.humedad}</Text>
                        <Text><b>Fecha análisis:</b> {m.fecha_analisis}</Text>
                        <Text><b>Número de registro:</b> {m.num_registro}</Text>
                      </VStack>
                      <Button colorScheme="yellow" onClick={() => handleEditar(m.id)}>
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

export default ListaMuestrasFisicoquimicas; 