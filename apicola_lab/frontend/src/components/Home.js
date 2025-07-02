import React from 'react';
import { Box, Text, Flex, Stack } from '@chakra-ui/react';
import Login from './auth/Login';

const Home = () => {
  return (
    <Flex minH="100vh" align="center" justify="center" bg="transparent">
      <Box
        bg="white"
        p={8}
        rounded="lg"
        boxShadow="lg"
        w={{ base: '90%', md: '400px' }}
        className="honeycomb-glow"
      >
        <Stack spacing={6} align="center">
          <Text as="h1" fontSize="2xl" fontWeight="bold" mb={4}>
            Cooperativa Apícola Limitada del Parana
          </Text>
          <Login />
        </Stack>
      </Box>
    </Flex>
  );
};

export default Home; 