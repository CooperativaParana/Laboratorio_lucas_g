import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Button, Flex, Text, VStack, HStack, Heading, SimpleGrid, IconButton, Alert, AlertIcon, Center, Select } from '@chakra-ui/react';
import { AddIcon, MinusIcon, ArrowBackIcon } from '@chakra-ui/icons';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

// Agregar el audio para sumar
const audioSumar = new Audio(process.env.PUBLIC_URL + '/sumar1.mp3');

const EditarMuestra = () => {
  const { id } = useParams();
  const [especies, setEspecies] = useState([]);
  const [analisis, setAnalisis] = useState([]); // [{id, especie, cantidad_granos, marca_especial}]
  const [especiesSeleccionadas, setEspeciesSeleccionadas] = useState([]); // [{id, nombre_cientifico}]
  const [conteos, setConteos] = useState({}); // { especieId: cantidad }
  const [marcasEspeciales, setMarcasEspeciales] = useState({}); // { especieId: marca }
  const [modoSeleccion, setModoSeleccion] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Cargar especies y análisis actuales
    axios.get(`${API_URL}/especies/`)
      .then(res => setEspecies(res.data))
      .catch(err => setError('Error al cargar especies: ' + (err.response?.data ? JSON.stringify(err.response.data) : err.message)));
    axios.get(`${API_URL}/analisis-palinologicos/?pool=${id}`)
      .then(res => {
        setAnalisis(res.data);
        // Marcar seleccionadas (array de IDs)
        setEspeciesSeleccionadas(res.data.map(a => a.especie));
        const conteosMap = {};
        const marcasMap = {};
        res.data.forEach(a => {
          conteosMap[a.especie] = a.cantidad_granos;
          marcasMap[a.especie] = a.marca_especial || '';
        });
        setConteos(conteosMap);
        setMarcasEspeciales(marcasMap);
      })
      .catch(err => setError('Error al cargar análisis: ' + (err.response?.data ? JSON.stringify(err.response.data) : err.message)));
  }, [id]);

  const toggleEspecieSeleccionada = (especie) => {
    setEspeciesSeleccionadas(prev => {
      const existe = prev.includes(especie.id);
      if (existe) {
        return prev.filter(id => id !== especie.id);
      } else {
        return [...prev, especie.id];
      }
    });
  };

  const incrementarConteo = (especieId) => {
    setConteos(prev => ({ ...prev, [especieId]: (prev[especieId] || 0) + 1 }));
    audioSumar.currentTime = 0;
    audioSumar.play();
  };

  const decrementarConteo = (especieId) => {
    setConteos(prev => ({ ...prev, [especieId]: Math.max(0, (prev[especieId] || 0) - 1) }));
  };

  const cambiarMarcaEspecial = (especieId, marca) => {
    setMarcasEspeciales(prev => ({ ...prev, [especieId]: marca }));
  };

  const continuarAConteo = () => {
    if (especiesSeleccionadas.length === 0) {
      setError('Debes seleccionar al menos una especie para continuar');
      return;
    }
    setModoSeleccion(false);
    setError('');
  };

  const volverASeleccion = () => {
    setModoSeleccion(true);
    setError('');
  };

  const handleGuardar = async () => {
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      // 1. Actualizar o crear análisis para especies seleccionadas
      for (let especie of especiesSeleccionadas) {
        const cantidad = conteos[especie] || 0;
        const marcaEspecial = marcasEspeciales[especie] || '';
        const analisisExistente = analisis.find(a => a.especie === especie);
        if (analisisExistente) {
          // PUT para actualizar
          await axios.put(`${API_URL}/analisis-palinologicos/${analisisExistente.id}/`, {
            cantidad_granos: cantidad,
            marca_especial: marcaEspecial
          });
        } else {
          // POST para crear
          await axios.post(`${API_URL}/analisis-palinologicos/`, {
            pool: id,
            especie: especie,
            cantidad_granos: cantidad,
            marca_especial: marcaEspecial
          });
        }
      }
      // 2. Eliminar análisis de especies que fueron deseleccionadas
      for (let a of analisis) {
        if (!especiesSeleccionadas.some(e => e === a.especie)) {
          await axios.delete(`${API_URL}/analisis-palinologicos/${a.id}/`);
        }
      }
      setSuccess(true);
      setTimeout(() => navigate('/muestras'), 1200);
    } catch (err) {
      setError('Error al guardar los conteos: ' + (err.response?.data ? JSON.stringify(err.response.data) : err.message));
    }
    setLoading(false);
  };

  // Modo selección visual
  const ModoSeleccion = () => (
    <VStack spacing={4} align="center" w={{ base: '100%', md: '600px' }}>
      <Heading size="md" mb={4}>Selecciona las especies presentes en la muestra</Heading>
      <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={3} w="100%">
        {especies.map((especie) => {
          const seleccionada = especiesSeleccionadas.includes(especie.id);
          return (
            <Button
              key={especie.id}
              colorScheme={seleccionada ? 'green' : 'gray'}
              variant={seleccionada ? 'solid' : 'outline'}
              onClick={() => toggleEspecieSeleccionada(especie)}
              w="100%"
              h="48px"
              fontWeight="medium"
              fontSize="md"
              whiteSpace="normal"
              textAlign="center"
            >
              {especie.nombre_cientifico}
            </Button>
          );
        })}
      </SimpleGrid>
    </VStack>
  );

  // Modo conteo visual
  const ModoConteo = () => (
    <VStack spacing={4} align="center" w={{ base: '100%', md: '600px' }}>
      <Heading size="md" mb={4}>Conteo de granos de polen</Heading>
      {especiesSeleccionadas.map((especieId) => {
        const especie = especies.find(e => e.id === especieId);
        return (
          <VStack key={especieId} spacing={2} w="100%" bg="white" p={3} rounded="md" boxShadow="sm">
            <HStack spacing={4} w="100%" justify="center">
              <IconButton
                icon={<MinusIcon />}
                colorScheme="red"
                aria-label="Restar"
                onClick={() => decrementarConteo(especieId)}
                size="md"
                w="40px"
                h="40px"
              />
              <VStack spacing={0} flex={1}>
                <Text fontSize="2xl" fontWeight="bold" textAlign="center">{conteos[especieId] || 0}</Text>
                <HStack spacing={2} justify="center">
                  <Text fontSize="sm" color="gray.600">{especie?.nombre_cientifico || ''}</Text>
                  <Text fontSize="xs" color={marcasEspeciales[especieId] ? 'green.600' : 'gray.400'} ml={2}>
                    {marcasEspeciales[especieId] ? `Marca: ${marcasEspeciales[especieId]}` : 'Sin marca'}
                  </Text>
                </HStack>
              </VStack>
              <IconButton
                icon={<AddIcon />}
                colorScheme="green"
                aria-label="Sumar"
                onClick={() => incrementarConteo(especieId)}
                size="lg"
                w="56px"
                h="56px"
              />
            </HStack>
            <HStack spacing={2} w="100%" justify="center">
              <Text fontSize="sm" color="gray.600">Marca especial:</Text>
              <Select
                size="sm"
                w="100px"
                value={marcasEspeciales[especieId] || ''}
                onChange={(e) => cambiarMarcaEspecial(especieId, e.target.value)}
                placeholder="Sin marca"
              >
                <option value="x">x</option>
                <option value="#">#</option>
                <option value="##">##</option>
              </Select>
            </HStack>
          </VStack>
        );
      })}
    </VStack>
  );

  return (
    <Flex minH="100vh" align="center" justify="center" bg="transparent">
      <Box bg="white" p={8} rounded="lg" boxShadow="lg" w={{ base: '90%', md: '600px' }}>
        <VStack spacing={6} align="center">
          <Button colorScheme="blue" alignSelf="flex-start" onClick={() => navigate(-1)}>
            ← Volver
          </Button>
          <Text as="h1" fontSize="3xl" fontWeight="bold" mb={6}>
            Editar Conteos de Polen
          </Text>
          {error && <Alert status="error" mb={4}><AlertIcon />{error}</Alert>}
          {success && <Alert status="success" mb={4}><AlertIcon />Cambios guardados correctamente</Alert>}
          <Center>
            {modoSeleccion ? <ModoSeleccion /> : <ModoConteo />}
          </Center>
          <Center mt={8} flexDir="column">
            {modoSeleccion ? (
              <Button
                colorScheme="blue"
                onClick={continuarAConteo}
                isDisabled={especiesSeleccionadas.length === 0}
                w="250px"
                mb={4}
              >
                Continuar al conteo ({especiesSeleccionadas.length} especies seleccionadas)
              </Button>
            ) : (
              <>
                <Button
                  colorScheme="yellow"
                  onClick={handleGuardar}
                  isLoading={loading}
                  isDisabled={especiesSeleccionadas.length === 0}
                  w="250px"
                  mb={4}
                >
                  Guardar cambios
                </Button>
                <Button
                  colorScheme="gray"
                  variant="outline"
                  onClick={volverASeleccion}
                  w="250px"
                  mb={4}
                >
                  Volver a selección
                </Button>
              </>
            )}
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
        </VStack>
      </Box>
    </Flex>
  );
};

export default EditarMuestra; 