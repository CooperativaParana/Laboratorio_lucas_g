import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Button, Flex, Text, VStack, HStack } from '@chakra-ui/react';

const EditarMuestra = () => {
  const { id } = useParams();
  const [especies, setEspecies] = useState([]);
  const [conteos, setConteos] = useState({}); // { especieId: { id: analisisId, cantidad: n } }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/especies/')
      .then(res => res.json())
      .then(data => setEspecies(data));
    fetch(`/api/analisis-palinologicos/?pool=${id}`)
      .then(res => res.json())
      .then(data => {
        const mapeo = {};
        data.forEach(a => {
          mapeo[a.especie] = { id: a.id, cantidad: a.cantidad_granos };
        });
        setConteos(mapeo);
      });
  }, [id]);

  const handleContador = (especieId, delta) => {
    setConteos(prev => ({
      ...prev,
      [especieId]: {
        ...prev[especieId],
        cantidad: Math.max(0, (prev[especieId]?.cantidad || 0) + delta)
      }
    }));
  };

  const handleGuardar = async () => {
    setLoading(true);
    setError('');
    try {
      for (let especie of especies) {
        const conteo = conteos[especie.id];
        if (conteo) {
          await fetch(`/api/analisis-palinologicos/${conteo.id}/`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cantidad_granos: conteo.cantidad })
          });
        }
      }
      navigate('/muestras');
    } catch (err) {
      setError('Error al guardar los cambios');
    }
    setLoading(false);
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg="transparent">
      <Box bg="white" p={8} rounded="lg" boxShadow="lg" w={{ base: '90%', md: '600px' }}>
        <VStack spacing={6} align="center">
          <Text as="h1" fontSize="3xl" fontWeight="bold" mb={6}>
            Editar Conteos de Polen
          </Text>
          {especies.map(especie => (
            <HStack key={especie.id} w="100%" justify="space-between">
              <Text>{especie.nombre_cientifico}</Text>
              <Button onClick={() => handleContador(especie.id, -1)}>-</Button>
              <Text>{conteos[especie.id]?.cantidad || 0}</Text>
              <Button onClick={() => handleContador(especie.id, 1)}>+</Button>
            </HStack>
          ))}
          {error && <Text color="red.500">{error}</Text>}
          <Button colorScheme="yellow" onClick={handleGuardar} isLoading={loading} w="100%">
            Guardar cambios
          </Button>
        </VStack>
      </Box>
    </Flex>
  );
};

export default EditarMuestra; 