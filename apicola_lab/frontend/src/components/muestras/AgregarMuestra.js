import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Flex, Text, VStack, Input, Textarea, FormControl, FormLabel, Select as ChakraSelect } from '@chakra-ui/react';
import axios from 'axios';
import Select from 'react-select';

const API_URL = process.env.REACT_APP_API_URL;

const AgregarMuestra = () => {
  // hay que obtener el id del usuario logueado
  const [analistas, setAnalistas] = useState([]);
  const [tambores, setTambores] = useState([]);
  const [selectedTambores, setSelectedTambores] = useState([]);
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
    // Obtener la lista de tambores
    axios.get(`${API_URL}/tambores/`)
      .then(res => setTambores(res.data))
      .catch(err => setError('Error al cargar tambores: ' + (err.response?.data ? JSON.stringify(err.response.data) : err.message)));
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleTamboresChange = (e) => {
    const selected = Array.from(e.target.selectedOptions, option => option.value);
    setSelectedTambores(selected);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API_URL}/muestras/`, form);
      const poolId = res.data.id;
      // Asociar cada tambor seleccionado al pool
      await Promise.all(selectedTambores.map(tamborId =>
        axios.post(`${API_URL}/contiene-pool/`, {
          pool: poolId,
          tambor: tamborId,
          fecha_asociacion: form.fecha_analisis
        })
      ));
      navigate(`/contador-polen/${poolId}`);
    } catch (err) {
      setError('Error al crear la muestra o asociar tambores: ' + (err.response?.data ? JSON.stringify(err.response.data) : err.message));
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
              <FormLabel>Analista que crea la muestra</FormLabel>
              <ChakraSelect name="analista" value={form.analista} onChange={handleChange} placeholder="Seleccione un analista">
                {analistas.map(analista => (
                  <option key={analista.id} value={analista.id}>
                    {analista.nombres} {analista.apellidos}
                  </option>
                ))}
              </ChakraSelect>
            </FormControl>
            <FormControl mb={4} isRequired>
              <FormLabel>Tambores que componen el pool</FormLabel>
              <Select
                isMulti
                name="tambores"
                options={tambores.map(t => ({
                  value: t.id,
                  label: t.num_registro
                }))}
                value={tambores.filter(t => selectedTambores.includes(String(t.id))).map(t => ({
                  value: t.id,
                  label: t.num_registro
                }))}
                onChange={selected =>
                  setSelectedTambores(selected ? selected.map(option => String(option.value)) : [])
                }
                placeholder="Seleccione uno o más tambores"
                styles={{
                  menu: provided => ({ ...provided, zIndex: 9999 }),
                  control: provided => ({ ...provided, minHeight: '48px' }),
                  multiValue: provided => ({ ...provided, backgroundColor: '#f6e05e', color: '#333' }),
                  multiValueLabel: provided => ({ ...provided, color: '#333' }),
                  multiValueRemove: provided => ({ ...provided, color: '#333', ':hover': { backgroundColor: '#ecc94b', color: '#222' } })
                }}
                isSearchable
              />
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