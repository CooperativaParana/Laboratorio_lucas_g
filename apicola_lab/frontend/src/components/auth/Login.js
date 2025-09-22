import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Input,
  Button,
  Alert,
  IconButton,
  InputGroup,
  InputRightElement,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Stack
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import axios from 'axios';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [errors, setErrors] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const validateForm = () => {
    let tempErrors = {
      username: '',
      password: ''
    };
    let isValid = true;

    if (!formData.username.trim()) {
      tempErrors.username = 'El usuario es requerido';
      isValid = false;
    } else if (formData.username.length < 3) {
      tempErrors.username = 'El usuario debe tener al menos 3 caracteres';
      isValid = false;
    }

    if (!formData.password) {
      tempErrors.password = 'La contraseña es requerida';
      isValid = false;
    } else if (formData.password.length < 6) {
      tempErrors.password = 'La contraseña debe tener al menos 6 caracteres';
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }
    
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/token/`,
        { username: formData.username, password: formData.password },
        { headers: { 'Content-Type': 'application/json' } }
      );
      
      if (response.data.access) {
        localStorage.setItem('token', response.data.access);
        navigate('/menu');
      }
    } catch (err) {
      if (err.response) {
        setError(err.response.data.message || 'Error al iniciar sesión');
      } else {
        setError('Error de conexión con el servidor');
      }
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box as="form" onSubmit={handleSubmit} w="100%">
      <Stack spacing={4}>
        {error && (
          <Alert status="error" w="100%">
            {error}
          </Alert>
        )}
        <FormControl isInvalid={!!errors.username}>
          <FormLabel htmlFor="username">Usuario</FormLabel>
          <Input
            id="username"
            name="username"
            type="text"
            value={formData.username}
            onChange={handleChange}
            autoComplete="username"
            autoFocus
            required
          />
          <FormErrorMessage>{errors.username}</FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={!!errors.password}>
          <FormLabel htmlFor="password">Contraseña</FormLabel>
          <InputGroup>
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />
            <InputRightElement h={'full'}>
              <IconButton
                variant="ghost"
                aria-label="Mostrar/ocultar contraseña"
                onClick={handleClickShowPassword}
                icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
              />
            </InputRightElement>
          </InputGroup>
          <FormErrorMessage>{errors.password}</FormErrorMessage>
        </FormControl>
        <Button
          type="submit"
          colorScheme="teal"
          w="100%"
        >
          Ingresar
        </Button>
      </Stack>
    </Box>
  );
};

export default Login; 