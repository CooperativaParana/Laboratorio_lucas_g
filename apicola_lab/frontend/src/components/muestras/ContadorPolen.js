import React, { useEffect, useState } from 'react';
import { Box, VStack, HStack, Text, IconButton, SimpleGrid, useBreakpointValue, Button, Alert, AlertIcon, Center } from '@chakra-ui/react';
import { AddIcon, MinusIcon, ArrowBackIcon } from '@chakra-ui/icons';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL;

const ContadorPolen = () => {
  const [especies, setEspecies] = useState([]);
  const [conteos, setConteos] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { id } = useParams(); // id del pool
  const navigate = useNavigate();

  // Responsive: columnas en desktop, una sola columna en móvil
  const columns = useBreakpointValue({ base: 1, md: 1 });

  useEffect(() => {
    axios.get(`${API_URL}/especies/`)
      .then(res => {
        // Ordenar alfabéticamente por nombre_cientifico
        const especiesOrdenadas = res.data.sort((a, b) => a.nombre_cientifico.localeCompare(b.nombre_cientifico));
        setEspecies(especiesOrdenadas);
      })
      .catch(err => setError('Error al cargar especies: ' + (err.response?.data ? JSON.stringify(err.response.data) : err.message)));
  }, []);

  const incrementarConteo = (especieId) => {
    setConteos(prev => ({ ...prev, [especieId]: (prev[especieId] || 0) + 1 }));
  };

  const decrementarConteo = (especieId) => {
    setConteos(prev => ({ ...prev, [especieId]: Math.max(0, (prev[especieId] || 0) - 1) }));
  };

  const handleGuardar = async () => {
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      for (let especie of especies) {
        const cantidad = conteos[especie.id] || 0;
        if (cantidad > 0) {
          await axios.post(`${API_URL}/analisis-palinologicos/`, {
            pool: id,
            especie: especie.id,
            cantidad_granos: cantidad
          });
        }
      }
      setSuccess(true);
      setTimeout(() => navigate('/muestras'), 1200);
    } catch (err) {
      setError('Error al guardar los conteos: ' + (err.response?.data ? JSON.stringify(err.response.data) : err.message));
    }
    setLoading(false);
  };

  return (
    <Box minH="100vh" bg="gray.50" py={8} px={2}>
      <Text as="h1" fontSize="3xl" fontWeight="bold" textAlign="center" mb={8}>
        Contador de Polen
      </Text>
      {error && <Alert status="error" mb={4}><AlertIcon />{error}</Alert>}
      {success && <Alert status="success" mb={4}><AlertIcon />Conteos guardados correctamente</Alert>}
      <Center>
        <VStack spacing={4} align="center" w={{ base: '100%', md: '600px' }}>
          {especies.map((especie) => (
            <HStack key={especie.id} spacing={4} w="100%" justify="center" bg="white" p={3} rounded="md" boxShadow="sm">
              <IconButton
                icon={<MinusIcon />}
                colorScheme="red"
                aria-label="Restar"
                onClick={() => decrementarConteo(especie.id)}
                size="sm"
              />
              <Text flex={1} textAlign="center" fontWeight="medium">{especie.nombre_cientifico}</Text>
              <Text fontSize="lg" w="30px" textAlign="center">{conteos[especie.id] || 0}</Text>
              <IconButton
                icon={<AddIcon />}
                colorScheme="green"
                aria-label="Sumar"
                onClick={() => incrementarConteo(especie.id)}
                size="sm"
              />
            </HStack>
          ))}
        </VStack>
      </Center>
      <Center mt={8} flexDir="column">
        <Button
          colorScheme="yellow"
          onClick={handleGuardar}
          isLoading={loading}
          isDisabled={especies.length === 0 || Object.values(conteos).every(v => v === 0)}
          w="250px"
          mb={4}
        >
          Guardar conteos
        </Button>
        <Button
          leftIcon={<ArrowBackIcon />}
          colorScheme="gray"
          variant="outline"
          onClick={() => navigate('/muestras')}
          w="250px"
        >
          Volver
        </Button>
      </Center>
    </Box>
  );
};

export default ContadorPolen; 