import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Button, Flex, Text, VStack, HStack, Heading, SimpleGrid, IconButton, Alert, AlertIcon, Center, Select } from '@chakra-ui/react';
import { AddIcon, MinusIcon, ArrowBackIcon, EditIcon, CheckIcon } from '@chakra-ui/icons';
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
  const [fechaAnalisis, setFechaAnalisis] = useState('');
  const [editandoFecha, setEditandoFecha] = useState(false);

  useEffect(() => {
    // Cargar especies y análisis actuales
    axios.get(`${API_URL}/api/especies/`)
      .then(res => setEspecies(res.data))
      .catch(err => setError('Error al cargar especies: ' + (err.response?.data ? JSON.stringify(err.response.data) : err.message)));
    axios.get(`${API_URL}/api/muestras/${id}/`)
      .then(res => {
        setFechaAnalisis(res.data.fecha_analisis || '');
      })
      .catch(() => setFechaAnalisis(''));
    axios.get(`${API_URL}/api/analisis-palinologicos/?pool=${id}`)
      .then(res => {
        setAnalisis(res.data);
        // Extraer solo los IDs de las especies, no los objetos completos
        setEspeciesSeleccionadas(res.data.map(a => a.especie.id || a.especie));
        const conteosMap = {};
        const marcasMap = {};
        res.data.forEach(a => {
          const especieId = a.especie.id || a.especie;
          conteosMap[especieId] = a.cantidad_granos;
          marcasMap[especieId] = a.marca_especial || '';
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
      for (let especieId of especiesSeleccionadas) {
        const cantidad = conteos[especieId] || 0;
        const marcaEspecial = marcasEspeciales[especieId] || '';
        
        // Buscar análisis existente comparando IDs de especies
        const analisisExistente = analisis.find(a => {
          const aEspecieId = a.especie.id || a.especie;
          return aEspecieId === especieId;
        });
        
        if (analisisExistente) {
          // PUT para actualizar - solo enviar los campos que se están actualizando
          const datosActualizacion = {
            cantidad_granos: parseInt(cantidad)
          };
          
          // Solo agregar marca_especial si tiene valor
          if (marcaEspecial && marcaEspecial.trim() !== '') {
            datosActualizacion.marca_especial = marcaEspecial;
          }
          
          console.log('Actualizando análisis:', analisisExistente.id, "datos actualizacion", datosActualizacion);
          
          await axios.put(`${API_URL}/api/analisis-palinologicos/${analisisExistente.id}/`, datosActualizacion);
        } else {
          // POST para crear - asegurar que especie sea solo el ID
          const datosCreacion = {
            pool: parseInt(id),
            especie: parseInt(especieId),
            cantidad_granos: parseInt(cantidad)
          };
          
          // Solo agregar marca_especial si tiene valor
          if (marcaEspecial && marcaEspecial.trim() !== '') {
            datosCreacion.marca_especial = marcaEspecial;
          }
          
          console.log('Creando nuevo análisis:', datosCreacion);
          
          await axios.post(`${API_URL}/api/analisis-palinologicos/`, datosCreacion);
        }
      }
      
      // 2. Eliminar análisis de especies que fueron deseleccionadas
      for (let a of analisis) {
        const aEspecieId = a.especie.id || a.especie;
        if (!especiesSeleccionadas.some(e => e === aEspecieId)) {
          console.log('Eliminando análisis:', a.id);
          await axios.delete(`${API_URL}/api/analisis-palinologicos/${a.id}/`);
        }
      }
      
      setSuccess(true);
      setTimeout(() => navigate('/muestras'), 1200);
    } catch (err) {
      console.error('Error completo:', err);
      console.error('Error response:', err.response);
      setError('Error al guardar los conteos: ' + (err.response?.data ? JSON.stringify(err.response.data) : err.message));
    }
    setLoading(false);
  };

  const handleFechaAnalisisSave = async () => {
    try {
      await axios.patch(`${API_URL}/api/muestras/${id}/`, { fecha_analisis: fechaAnalisis });
      setEditandoFecha(false);
    } catch (err) {
      setError('Error al actualizar la fecha de análisis: ' + (err.response?.data ? JSON.stringify(err.response.data) : err.message));
    }
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
      <Heading size="md" mb={2}>Conteo de granos de polen</Heading>
      <Box w="100%" mb={2}>
        <Text fontWeight="bold" fontSize="md" color="blue.700" mb={1}>Fecha de análisis:</Text>
        {editandoFecha ? (
          <HStack justify="center">
            <input
              type="date"
              value={fechaAnalisis || ''}
              onChange={e => setFechaAnalisis(e.target.value)}
              style={{ padding: 6, borderRadius: 4, border: '1px solid #CBD5E0' }}
            />
            <IconButton
              icon={<CheckIcon />}
              colorScheme="green"
              size="sm"
              aria-label="Guardar fecha"
              onClick={handleFechaAnalisisSave}
            />
            <IconButton
              icon={<ArrowBackIcon />}
              colorScheme="gray"
              size="sm"
              aria-label="Cancelar"
              onClick={() => setEditandoFecha(false)}
            />
          </HStack>
        ) : (
          <Button
            leftIcon={<EditIcon />}
            colorScheme="blue"
            variant="outline"
            size="sm"
            onClick={() => setEditandoFecha(true)}
          >
            {fechaAnalisis ? new Date(fechaAnalisis + 'T00:00:00').toLocaleDateString('es-ES', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              timeZone: 'UTC'
            }) : 'Sin fecha'}
          </Button>
        )}
      </Box>
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
                w={{ base: "100%", sm: "250px" }}
                mb={4}
              >
                Continuar al conteo
              </Button>
            ) : (
              <>
                <Button
                  colorScheme="yellow"
                  onClick={handleGuardar}
                  isLoading={loading}
                  isDisabled={especiesSeleccionadas.length === 0}
                  w={{ base: "100%", sm: "250px" }}
                  mb={4}
                >
                  Guardar cambios
                </Button>
                <Button
                  colorScheme="gray"
                  variant="outline"
                  onClick={volverASeleccion}
                  w={{ base: "100%", sm: "250px" }}
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
              w={{ base: "100%", sm: "250px" }}
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