import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Button, Flex, Text, VStack, HStack, Spinner, Alert, AlertIcon, Grid, GridItem } from '@chakra-ui/react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, BarElement } from 'chart.js';
import { Pie, Bar, Scatter } from 'react-chartjs-2';

// Registrar componentes de Chart.js
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, BarElement);

const GraficasConsultas = () => {
  const { poolId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    fetchPoolStats();
  }, [poolId]);

  const fetchPoolStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/pool/${poolId}/stats/`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVolver = () => {
    navigate('/analisis-palinologico');
  };

  if (loading) {
    return (
      <Flex minH="100vh" align="center" justify="center" bg="transparent">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Cargando estadísticas del GPO...</Text>
        </VStack>
      </Flex>
    );
  }

  if (error) {
    return (
      <Flex minH="100vh" align="center" justify="center" bg="transparent">
        <Alert status="error" maxW="600px">
          <AlertIcon />
          <VStack align="start" spacing={2}>
            <Text fontWeight="bold">Error al cargar los datos</Text>
            <Text>{error}</Text>
            <Button onClick={handleVolver} colorScheme="blue" size="sm">
              Volver
            </Button>
          </VStack>
        </Alert>
      </Flex>
    );
  }

  if (!data) {
    return (
      <Flex minH="100vh" align="center" justify="center" bg="transparent">
        <Text>No se encontraron datos</Text>
      </Flex>
    );
  }

  const { pool_info, pie_chart, bar_chart, scatter_plot } = data;

  // Configuración para el gráfico de torta
  const pieChartData = {
    labels: pie_chart.labels,
    datasets: [{
      data: pie_chart.datasets[0].data,
      backgroundColor: pie_chart.datasets[0].backgroundColor,
      borderWidth: 2,
      borderColor: '#fff'
    }]
  };

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed;
            const detailedData = pie_chart.detailed_data.find(item => item.especie === label);
            return `${label}: ${value}% (${detailedData?.cantidad || 0} granos)`;
          }
        }
      }
    }
  };

  // Configuración para el gráfico de barras
  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `Cantidad: ${context.parsed.y} granos`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Cantidad de Granos'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Especies'
        }
      }
    }
  };

  // Configuración para el scatter plot
  const scatterChartData = {
    datasets: [{
      label: 'Especies por Mes',
      data: scatter_plot.data.map(item => ({
        x: item.x,
        y: item.y
      })),
      backgroundColor: 'rgba(255, 99, 132, 0.6)',
      borderColor: 'rgba(255, 99, 132, 1)',
      pointRadius: scatter_plot.data.map(item => item.radio),
      pointHoverRadius: scatter_plot.data.map(item => item.radio + 2)
    }]
  };

  const scatterChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const point = scatter_plot.data[context.dataIndex];
            return [
              `Especie: ${point.x}`,
              `Mes: ${point.nombre_mes}`,
              `Cantidad: ${point.cantidad} granos`
            ];
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: scatter_plot.x_axis
        }
      },
      y: {
        title: {
          display: true,
          text: scatter_plot.y_axis
        },
        min: 0,
        max: 13,
        ticks: {
          stepSize: 1,
          callback: function(value) {
            const meses = ['', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
            return meses[value] || value;
          }
        }
      }
    }
  };

  return (
    <Flex minH="100vh" bg="transparent" p={4}>
      <Box w="100%" maxW="1400px" mx="auto">
        {/* Header */}
        <Box bg="white" p={6} rounded="lg" boxShadow="lg" mb={6} className="honeycomb-glow">
          <VStack spacing={4} align="center">
            <Text as="h1" fontSize="3xl" fontWeight="bold">
              Gráficos del GPO {pool_info.num_registro}
            </Text>
            <HStack spacing={8} fontSize="md" color="gray.600">
              <Text><strong>Analista:</strong> {pool_info.analista}</Text>
              <Text><strong>Fecha:</strong> {pool_info.fecha_analisis ? new Date(pool_info.fecha_analisis).toLocaleDateString('es-ES') : 'No especificada'}</Text>
              <Text><strong>Total Granos:</strong> {pool_info.total_granos}</Text>
              <Text><strong>Especies:</strong> {pool_info.total_especies}</Text>
            </HStack>
            <Button onClick={handleVolver} colorScheme="gray" size="lg">
              Volver al Análisis Palinológico
            </Button>
          </VStack>
        </Box>

        {/* Gráficos */}
        <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gap={6}>
          {/* Gráfico de Torta */}
          <GridItem>
            <Box bg="white" p={6} rounded="lg" boxShadow="lg" className="honeycomb-glow">
              <Text fontSize="xl" fontWeight="bold" mb={4} textAlign="center">
                Distribución por Especies (%)
              </Text>
              <Box h="400px">
                <Pie data={pieChartData} options={pieChartOptions} />
              </Box>
            </Box>
          </GridItem>

          {/* Gráfico de Barras */}
          <GridItem>
            <Box bg="white" p={6} rounded="lg" boxShadow="lg" className="honeycomb-glow">
              <Text fontSize="xl" fontWeight="bold" mb={4} textAlign="center">
                Cantidad de Granos por Especie
              </Text>
              <Box h="400px">
                <Bar data={bar_chart} options={barChartOptions} />
              </Box>
            </Box>
          </GridItem>

          {/* Scatter Plot */}
          <GridItem colSpan={{ base: 1, lg: 2 }}>
            <Box bg="white" p={6} rounded="lg" boxShadow="lg" className="honeycomb-glow">
              <Text fontSize="xl" fontWeight="bold" mb={4} textAlign="center">
                Análisis Temporal por Especie
              </Text>
              <Text fontSize="sm" color="gray.600" mb={4} textAlign="center">
                {scatter_plot.size_legend}
              </Text>
              <Box h="400px">
                <Scatter data={scatterChartData} options={scatterChartOptions} />
              </Box>
            </Box>
          </GridItem>
        </Grid>
      </Box>
    </Flex>
  );
};

export default GraficasConsultas; 