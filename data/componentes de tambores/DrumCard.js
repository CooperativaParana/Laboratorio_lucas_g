import { CalendarIcon, InfoIcon } from '@chakra-ui/icons';
import { Box, Flex, Text, Badge, Checkbox, useColorModeValue } from '@chakra-ui/react';

export default function DrumCard({ drum, isSelected = false, onSelectionChange, showSelection = false }) {
  const handleSelectionChange = (e) => {
    if (onSelectionChange) {
      onSelectionChange(drum.id, e.target.checked);
    }
  };

  const borderColor = isSelected ? 'blue.500' : useColorModeValue('gray.200', 'gray.600');
  const bg = isSelected ? useColorModeValue('blue.50', 'blue.900') : useColorModeValue('white', 'gray.800');

  return (
    <Box
      w="full"
      borderWidth={isSelected ? 2 : 1}
      borderColor={borderColor}
      bg={bg}
      borderRadius="md"
      p={4}
      transition="all 0.2s"
      _hover={{ boxShadow: 'md' }}
    >
      <Flex align="center" justify="space-between" mb={2}>
        <Flex align="center" gap={2}>
          <Box
            w={6}
            h={6}
            borderRadius="full"
            bg={drum.type === 'main' ? 'blue.500' : 'green.500'}
            color="white"
            display="flex"
            alignItems="center"
            justifyContent="center"
            fontWeight="bold"
            fontSize="sm"
          >
            {drum.id}
          </Box>
          <Text fontSize="lg" fontWeight="bold">Tambor #{drum.id}</Text>
        </Flex>
        <Flex align="center" gap={2}>
          {showSelection && (
            <Checkbox
              isChecked={isSelected}
              onChange={handleSelectionChange}
              size="lg"
              colorScheme="blue"
            />
          )}
          <Badge colorScheme={drum.type === 'main' ? 'blue' : 'green'}>
            {drum.type === 'main' ? 'Sala Principal' : 'Sala Externa'}
          </Badge>
          {drum.poolId && (
            <Badge variant="outline" colorScheme="gray" fontSize="xs">
              Pool #{drum.poolId}
            </Badge>
          )}
        </Flex>
      </Flex>
      <Box>
        <Flex align="center" gap={2} color="gray.700" mb={1}>
          <InfoIcon boxSize={4} color="gray.500" />
          <Text fontWeight="medium">Apicultor:</Text>
          <Text>{drum.apicultor}</Text>
        </Flex>
        {drum.type === 'main' && (
          <>
            <Flex align="center" gap={2} color="gray.700" mb={1}>
              <InfoIcon boxSize={4} color="gray.500" />
              <Text fontWeight="medium">Apiario:</Text>
              <Text>{drum.apiario}</Text>
            </Flex>
            <Flex align="center" gap={2} color="gray.700" mb={1}>
              <CalendarIcon boxSize={4} color="gray.500" />
              <Text fontWeight="medium">Fecha de Extracción:</Text>
              <Text>{new Date(drum.fechaExtraccion).toLocaleDateString()}</Text>
            </Flex>
          </>
        )}
        {drum.type === 'external' && (
          <Flex align="center" gap={2} color="gray.700">
            <InfoIcon boxSize={4} color="gray.500" />
            <Text fontWeight="medium">Fecha de Ingreso por Depósito:</Text>
            <Text>{new Date(drum.fechaIngresoDeposito).toLocaleDateString()}</Text>
          </Flex>
        )}
      </Box>
    </Box>
  );
} 