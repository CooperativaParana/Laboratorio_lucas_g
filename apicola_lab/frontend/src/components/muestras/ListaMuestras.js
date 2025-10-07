import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Flex, Text, VStack, HStack } from '@chakra-ui/react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const ListaMuestras = () => {
  const [muestras, setMuestras] = useState([]);
  const [analistas, setAnalistas] = useState([]);
  const [analisisPorPool, setAnalisisPorPool] = useState({}); // { poolId: true/false }
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API_URL}/api/muestras/`)
      .then(res => {
        setMuestras(res.data);
        // Por cada muestra, consultar si tiene análisis palinológico
        res.data.forEach(muestra => {
          axios.get(`${API_URL}/api/analisis-palinologicos/?pool=${muestra.id}`)
            .then(resp => {
              setAnalisisPorPool(prev => ({ ...prev, [muestra.id]: resp.data.length > 0 }));
            })
            .catch(() => {
              setAnalisisPorPool(prev => ({ ...prev, [muestra.id]: false }));
            });
        });
      })
      .catch(err => console.error('Error al cargar muestras:', err));
    axios.get(`${API_URL}/api/analistas/`)
      .then(res => setAnalistas(res.data))
      .catch(err => console.error('Error al cargar analistas:', err));
  }, []);

  // Función para obtener el nombre completo del analista por ID
  const getNombreAnalista = (id) => {
    const analista = analistas.find(a => a.id === id);
    return analista ? `${analista.nombres} ${analista.apellidos || ''}` : id;
  };

  // Ordenar por fecha de análisis descendente
  const muestrasOrdenadas = [...muestras].sort((a, b) => (b.fecha_analisis || '').localeCompare(a.fecha_analisis || ''));

  return (
    <Flex minH="100vh" align="center" justify="center" bg="transparent">
      <Box bg="white" p={8} rounded="lg" boxShadow="lg" w={{ base: '90%', md: '700px' }}>
        <VStack spacing={6} align="center">
          <HStack w="100%" justify="space-between" mb={4}>
            <Button colorScheme="blue" onClick={() => navigate('/analisis-palinologico')}>
              ← Volver al menú
            </Button>
            <Text as="h1" fontSize="3xl" fontWeight="bold">
              Muestras Palinológicas
            </Text>
            <Box w="100px"></Box> {/* Espaciador para centrar el título */}
          </HStack>
          {muestrasOrdenadas.map(muestra => (
            <HStack key={muestra.id} w="100%" justify="space-between">
              <Text>
                <b>ID:</b> {muestra.id} | <b>Analista:</b> {getNombreAnalista(muestra.analista)} | <b>Fecha análisis:</b> {muestra.fecha_analisis}
              </Text>
              <Button 
                colorScheme={analisisPorPool[muestra.id] ? 'yellow' : 'green'} 
                onClick={() => navigate(`/editar-muestra/${muestra.id}`)}
              >
                {analisisPorPool[muestra.id] ? 'Editar conteo' : 'Iniciar conteo'}
              </Button>
            </HStack>
          ))}
        </VStack>
      </Box>
    </Flex>
  );
};

export default ListaMuestras; 