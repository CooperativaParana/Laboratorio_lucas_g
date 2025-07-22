import { useState } from 'react';
import { Box, Flex, Text, Button, Select, Badge, Stack, useColorModeValue } from '@chakra-ui/react';
import { Users, Package } from 'lucide-react';

export default function BulkActions({
  selectedDrums,
  drums,
  pools,
  onAssignToPool,
  onClearSelection,
  onSelectAll,
  onDeselectAll
}) {
  const [selectedPoolId, setSelectedPoolId] = useState('');

  const handleBulkAssign = () => {
    if (!selectedPoolId || selectedDrums.length === 0) return;
    const poolId = selectedPoolId === 'unassigned' ? null : parseInt(selectedPoolId);
    onAssignToPool(selectedDrums, poolId);
    setSelectedPoolId('');
    onClearSelection();
  };

  const selectedDrumsData = drums.filter(drum => selectedDrums.includes(drum.id));
  const allDrumsSelected = selectedDrums.length === drums.length;

  if (selectedDrums.length === 0) {
    return (
      <Box w="full" bg={useColorModeValue('gray.50', 'gray.700')} borderRadius="md" p={6} mb={2}>
        <Flex direction="column" align="center" color="gray.500">
          <Users size={32} style={{ marginBottom: 8, color: '#A0AEC0' }} />
          <Text>Selecciona tambores para realizar acciones en lote</Text>
          <Button onClick={onSelectAll} variant="outline" mt={2} leftIcon={<Users size={16} />}>Seleccionar Todos</Button>
        </Flex>
      </Box>
    );
  }

  return (
    <Box w="full" bg={useColorModeValue('blue.50', 'blue.900')} borderRadius="md" borderWidth={1} borderColor={useColorModeValue('blue.200', 'blue.700')} p={4} mb={2}>
      <Flex align="center" justify="space-between" mb={2}>
        <Flex align="center" gap={2}>
          <Box w={6} h={6} bg="blue.500" borderRadius="full" color="white" display="flex" alignItems="center" justifyContent="center" fontWeight="bold" fontSize="sm">
            {selectedDrums.length}
          </Box>
          <Text fontSize="lg" fontWeight="bold">Tambores Seleccionados</Text>
        </Flex>
        <Flex align="center" gap={2}>
          <Button
            onClick={allDrumsSelected ? onDeselectAll : onSelectAll}
            variant="outline"
            size="sm"
          >
            {allDrumsSelected ? 'Deseleccionar Todos' : 'Seleccionar Todos'}
          </Button>
          <Button
            onClick={onClearSelection}
            variant="outline"
            size="sm"
          >
            Limpiar
          </Button>
        </Flex>
      </Flex>
      <Stack direction="row" flexWrap="wrap" gap={2} mb={4}>
        {selectedDrumsData.map((drum) => (
          <Badge
            key={drum.id}
            colorScheme={drum.type === 'main' ? 'blue' : 'green'}
            variant="solid"
            fontSize="sm"
            px={2}
            py={1}
          >
            Tambor #{drum.id}
            {drum.poolId && (
              <Box as="span" fontSize="xs" opacity={0.75} ml={1}>
                (Pool #{drum.poolId})
              </Box>
            )}
          </Badge>
        ))}
      </Stack>
      <Flex align="center" gap={4} mb={4}>
        <Box flex={1}>
          <Select
            placeholder="Seleccionar pool destino..."
            value={selectedPoolId}
            onChange={e => setSelectedPoolId(e.target.value)}
          >
            <option value="unassigned">Sin asignar</option>
            {pools.map((pool) => (
              <option key={pool.id} value={pool.id.toString()}>
                {pool.name}
              </option>
            ))}
          </Select>
        </Box>
        <Button
          onClick={handleBulkAssign}
          isDisabled={!selectedPoolId}
          leftIcon={<Package size={16} />}
          colorScheme={selectedPoolId === 'unassigned' ? 'orange' : 'blue'}
        >
          {selectedPoolId === 'unassigned' ? 'Desasignar' : 'Asignar'} ({selectedDrums.length})
        </Button>
      </Flex>
      <Box fontSize="sm" color="gray.600" bg={useColorModeValue('white', 'gray.800')} p={3} borderRadius="md">
        <strong>Resumen:</strong> {selectedDrums.length} tambores seleccionados
        <Box mt={1}>
          <div>• Sala Principal: {selectedDrumsData.filter(d => d.type === 'main').length}</div>
          <div>• Salas Externas: {selectedDrumsData.filter(d => d.type === 'external').length}</div>
          <div>• Con pool asignado: {selectedDrumsData.filter(d => d.poolId).length}</div>
          <div>• Sin asignar: {selectedDrumsData.filter(d => !d.poolId).length}</div>
        </Box>
      </Box>
    </Box>
  );
} 