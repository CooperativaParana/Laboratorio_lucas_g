import { useState } from 'react';
import { Input, Select, Button, Box, Flex, Stack, Text, Grid, GridItem } from '@chakra-ui/react';
import DrumCard from './DrumCard';
import BulkActions from './BulkActions';

export default function DrumList({ drums, pools, onAssignToPool }) {
  const [selectedDrums, setSelectedDrums] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('id');

  const handleDrumSelection = (drumId, selected) => {
    if (selected) {
      setSelectedDrums(prev => [...prev, drumId]);
    } else {
      setSelectedDrums(prev => prev.filter(id => id !== drumId));
    }
  };

  const handleSelectAll = () => {
    const filteredDrumIds = getFilteredDrums().map(drum => drum.id);
    setSelectedDrums(filteredDrumIds);
  };

  const handleDeselectAll = () => setSelectedDrums([]);
  const handleClearSelection = () => setSelectedDrums([]);

  const getFilteredDrums = () => {
    return drums.filter(drum => {
      const searchMatch = drum.apicultor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        drum.id.toString().includes(searchTerm) ||
        (drum.type === 'main' && drum.apiario && drum.apiario.toLowerCase().includes(searchTerm.toLowerCase()));
      const typeMatch = filterType === 'all' ||
        filterType === drum.type ||
        (filterType === 'assigned' && drum.poolId) ||
        (filterType === 'unassigned' && !drum.poolId);
      return searchMatch && typeMatch;
    }).sort((a, b) => {
      switch (sortBy) {
        case 'id':
          return a.id - b.id;
        case 'apicultor':
          return a.apicultor.localeCompare(b.apicultor);
        case 'fecha':
          const dateA = a.type === 'main' ? new Date(a.fechaExtraccion) : new Date(a.fechaIngresoDeposito);
          const dateB = b.type === 'main' ? new Date(b.fechaExtraccion) : new Date(b.fechaIngresoDeposito);
          return dateB.getTime() - dateA.getTime();
        default:
          return 0;
      }
    });
  };

  const filteredDrums = getFilteredDrums();

  return (
    <Stack spacing={6}>
      {/* Controles */}
      <Flex direction={{ base: 'column', sm: 'row' }} gap={4}>
        <Box flex={1} position="relative">
          <Input
            placeholder="Buscar por apicultor, apiario o ID..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            pl={10}
          />
        </Box>
        <Select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          w="48"
        >
          <option value="all">Todos</option>
          <option value="main">Sala Principal</option>
          <option value="external">Salas Externas</option>
          <option value="assigned">Con Pool Asignado</option>
          <option value="unassigned">Sin Asignar</option>
        </Select>
        <Select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          w="48"
        >
          <option value="id">ID</option>
          <option value="apicultor">Apicultor</option>
          <option value="fecha">Fecha</option>
        </Select>
      </Flex>

      {/* Acciones en lote */}
      <BulkActions
        selectedDrums={selectedDrums}
        drums={drums}
        pools={pools}
        onAssignToPool={onAssignToPool}
        onClearSelection={handleClearSelection}
        onSelectAll={handleSelectAll}
        onDeselectAll={handleDeselectAll}
      />

      {/* Info de resultados */}
      <Text fontSize="sm" color="gray.600">
        Mostrando {filteredDrums.length} de {drums.length} tambores
        {selectedDrums.length > 0 && (
          <Box as="span" ml={2} fontWeight="medium">
            • {selectedDrums.length} seleccionados
          </Box>
        )}
      </Text>

      {/* Grid de tambores */}
      <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4}>
        {filteredDrums.map((drum) => (
          <GridItem key={drum.id}>
            <DrumCard
              drum={drum}
              isSelected={selectedDrums.includes(drum.id)}
              onSelectionChange={handleDrumSelection}
              showSelection={true}
            />
          </GridItem>
        ))}
      </Grid>

      {filteredDrums.length === 0 && (
        <Box textAlign="center" py={12}>
          <Text color="gray.500">No se encontraron tambores que coincidan con los criterios de búsqueda.</Text>
          <Button
            onClick={() => {
              setSearchTerm('');
              setFilterType('all');
            }}
            variant="outline"
            mt={4}
          >
            Limpiar Filtros
          </Button>
        </Box>
      )}
    </Stack>
  );
} 