import React, { useEffect, useState } from 'react';
import { Box, VStack, HStack, Text, IconButton, SimpleGrid, useBreakpointValue, Button, Alert, AlertIcon, Center, Checkbox, Heading, Select } from '@chakra-ui/react';
import { AddIcon, MinusIcon, ArrowBackIcon } from '@chakra-ui/icons';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL;

const ContadorPolen = () => {
  const [especies, setEspecies] = useState([]);
  const [especiesSeleccionadas, setEspeciesSeleccionadas] = useState([]);
  const [conteos, setConteos] = useState({});
  const [marcasEspeciales, setMarcasEspeciales] = useState({});
  const [modoSeleccion, setModoSeleccion] = useState(true); // true = selección, false = conteo
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { id } = useParams(); // id del pool
  const navigate = useNavigate();
  const audioSumar = new Audio(process.env.PUBLIC_URL + '/sumar1.mp3');

  // Debug: verificar que el ID se obtiene correctamente
  console.log('ID del pool obtenido:', id, 'Tipo:', typeof id);

  // Responsive: columnas en desktop, una sola columna en móvil
  const columns = useBreakpointValue({ base: 1, md: 1 });

  useEffect(() => {
    axios.get(`${API_URL}/api/especies/`)
      .then(res => {
        // Ordenar alfabéticamente por nombre_cientifico
        const especiesOrdenadas = res.data.sort((a, b) => a.nombre_cientifico.localeCompare(b.nombre_cientifico));
        setEspecies(especiesOrdenadas);
      })
      .catch(err => setError('Error al cargar especies: ' + (err.response?.data ? JSON.stringify(err.response.data) : err.message)));
  }, []);

  const toggleEspecieSeleccionada = (especie) => {
    setEspeciesSeleccionadas(prev => {
      const existe = prev.find(e => e.id === especie.id);
      if (existe) {
        return prev.filter(e => e.id !== especie.id);
      } else {
        return [...prev, especie];
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
    
    // Validar que tenemos el ID del pool
    if (!id) {
      setError('Error: No se pudo obtener el ID del pool');
      setLoading(false);
      return;
    }
    
    try {
      for (let especie of especiesSeleccionadas) {
        const cantidad = conteos[especie.id] || 0;
        const marcaEspecial = marcasEspeciales[especie.id] || '';
        
        // Validar que los datos sean válidos
        if (!especie.id || isNaN(especie.id)) {
          setError(`Error: ID de especie inválido para ${especie.nombre_cientifico}`);
          setLoading(false);
          return;
        }
        
        // Preparar los datos para guardar
        const datosAGuardar = {
          pool: parseInt(id), // Convertir a entero
          especie: parseInt(especie.id), // Convertir a entero
          cantidad_granos: parseInt(cantidad) // Convertir a entero
        };
        
        // Si hay marca especial, agregarla
        if (marcaEspecial) {
          datosAGuardar.marca_especial = marcaEspecial;
        }
        
        console.log('Enviando datos:', datosAGuardar); // Debug
        
        await axios.post(`${API_URL}/api/analisis-palinologicos/`, datosAGuardar);
      }
      setSuccess(true);
      setTimeout(() => navigate('/muestras'), 1200);
    } catch (err) {
      console.error('Error completo:', err); // Debug
      setError('Error al guardar los conteos: ' + (err.response?.data ? JSON.stringify(err.response.data) : err.message));
    }
    setLoading(false);
  };

  // Componente para el modo selección
  const ModoSeleccion = () => (
    <VStack spacing={4} align="center" w={{ base: '100%', md: '600px' }}>
      <Heading size="md" mb={4}>Selecciona las especies presentes en la muestra</Heading>
      <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={3} w="100%">
        {especies.map((especie) => {
          const seleccionada = especiesSeleccionadas.some(e => e.id === especie.id);
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

  // Componente para el modo conteo
  const ModoConteo = () => (
    <VStack spacing={4} align="center" w={{ base: '100%', md: '600px' }}>
      <Heading size="md" mb={4}>Conteo de granos de polen</Heading>
      {especiesSeleccionadas.map((especie) => (
        <VStack key={especie.id} spacing={2} w="100%" bg="white" p={3} rounded="md" boxShadow="sm">
          <HStack spacing={4} w="100%" justify="center">
            <IconButton
              icon={<MinusIcon />}
              colorScheme="red"
              aria-label="Restar"
              onClick={() => decrementarConteo(especie.id)}
              size="lg"
              w="40px"
              h="40px"
            />
            <VStack spacing={0} flex={1}>
              <Text fontSize="2xl" fontWeight="bold" textAlign="center">{conteos[especie.id] || 0}</Text>
              <HStack spacing={2} justify="center">
                <Text fontSize="sm" color="gray.600">{especie.nombre_cientifico}</Text>
                <Text fontSize="xs" color={marcasEspeciales[especie.id] ? 'green.600' : 'gray.400'} ml={2}>
                  {marcasEspeciales[especie.id] ? `Marca: ${marcasEspeciales[especie.id]}` : 'Sin marca'}
                </Text>
              </HStack>
            </VStack>
            <IconButton
              icon={<AddIcon />}
              colorScheme="green"
              aria-label="Sumar"
              onClick={() => incrementarConteo(especie.id)}
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
              value={marcasEspeciales[especie.id] || ''}
              onChange={(e) => cambiarMarcaEspecial(especie.id, e.target.value)}
              placeholder="Sin marca"
            >
              <option value="x">x</option>
            </Select>
          </HStack>
        </VStack>
      ))}
    </VStack>
  );

  return (
    <Box minH="100vh" bg="gray.50" py={8} px={2}>
      <Text as="h1" fontSize="3xl" fontWeight="bold" textAlign="center" mb={8}>
        Contador de Polen
      </Text>
      {error && <Alert status="error" mb={4}><AlertIcon />{error}</Alert>}
      {success && <Alert status="success" mb={4}><AlertIcon />Conteos guardados correctamente</Alert>}
      
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
              Guardar conteos
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
    </Box>
  );
};

export default ContadorPolen; 