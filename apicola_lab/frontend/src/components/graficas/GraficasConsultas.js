import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Button, Flex, Text, VStack, HStack, Spinner, Alert, AlertIcon, Grid, GridItem } from '@chakra-ui/react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, BarElement } from 'chart.js';
import { Pie, Bar, Scatter } from 'react-chartjs-2';
import ListaPools from '../analisis/ListaPools';

// Registrar componentes de Chart.js
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, BarElement);

const GraficasConsultas = () => {
  const { poolId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [globalScatter, setGlobalScatter] = useState(null);
  const [pools, setPools] = useState([]);
  
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    if (!poolId) {
      fetchGlobalScatter();
    } else {
      fetchPoolStats();
    }
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

  const fetchGlobalScatter = async () => {
    try {
      setLoading(true);
      setError(null);

      const poolsRes = await fetch(`${API_URL}/pools/`);
      if (!poolsRes.ok) throw new Error(`Error ${poolsRes.status}: ${poolsRes.statusText}`);
      const poolsJson = await poolsRes.json();
      setPools(poolsJson);

      const stats = await Promise.all(
        poolsJson.map(async (p) => {
          try {
            const res = await fetch(`${API_URL}/pool/${p.id}/stats/`);
            if (!res.ok) return null;
            return res.json();
          } catch (_e) {
            return null;
          }
        })
      );

      const agregados = new Map();
      stats.forEach((st) => {
        if (!st || !st.scatter_plot || !st.scatter_plot.data) return;
        st.scatter_plot.data.forEach((pt) => {
          const especie = pt.x;
          const mesIndex = pt.y;
          const key = `${especie}|${mesIndex}`;
          const prev = agregados.get(key) || { especie, mesIndex, nombreMes: pt.nombre_mes, cantidad: 0 };
          prev.cantidad += pt.cantidad || 0;
          agregados.set(key, prev);
        });
      });

      if (agregados.size === 0) {
        setGlobalScatter({ especiesOrdenadas: [], datasetPoints: [] });
      } else {
        const especiesOrdenadas = Array.from(new Set(Array.from(agregados.values()).map(v => v.especie))).sort();
        const cantidades = Array.from(agregados.values()).map(v => v.cantidad);
        const minC = Math.min(...cantidades, 1);
        const maxC = Math.max(...cantidades, 1);
        const scaleRadius = (c) => {
          if (maxC === minC) return 6;
          const t = (c - minC) / (maxC - minC);
          return 4 + t * 10;
        };

        const datasetPoints = Array.from(agregados.values()).map((v) => ({
          x: v.mesIndex,
          y: v.especie,
          r: scaleRadius(v.cantidad),
          nombre_mes: v.nombreMes,
          cantidad: v.cantidad
        }));

        setGlobalScatter({ especiesOrdenadas, datasetPoints });
      }
    } catch (e) {
      setError(e.message);
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
          <Text>Cargando gráficas...</Text>
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

  // Modo global (sin poolId): scatter global + lista de GPO
  if (!poolId) {
    const chartGlobalData = globalScatter && {
      datasets: [{
        label: 'Frecuencia temporal por especie (global)',
        data: globalScatter.datasetPoints || [],
        parsing: { xAxisKey: 'x', yAxisKey: 'y' },
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        pointRadius: (globalScatter.datasetPoints || []).map(p => p.r),
        pointHoverRadius: (globalScatter.datasetPoints || []).map(p => (p.r || 0) + 2)
      }]
    };

    const chartGlobalOptions = {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function(context) {
              const p = (globalScatter.datasetPoints || [])[context.dataIndex];
              const meses = ['', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
              return [`Especie: ${p?.y ?? ''}`, `Mes: ${p?.nombre_mes || meses[p?.x || 0]}`, `Cantidad: ${p?.cantidad ?? 0} granos`];
            }
          }
        }
      },
      scales: {
        x: {
          title: { display: true, text: 'Meses' },
          min: 0,
          max: 13,
          ticks: {
            stepSize: 1,
            callback: function(value) {
              const meses = ['', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
              return meses[value] || value;
            }
          }
        },
        y: {
          type: 'category',
          title: { display: true, text: 'Especies' },
          labels: globalScatter?.especiesOrdenadas || []
        }
      }
    };

    return (
      <Flex minH="100vh" bg="transparent" p={4}>
        <Box w="100%" maxW="1400px" mx="auto">
          <Box bg="white" p={6} rounded="lg" boxShadow="lg" mb={6} className="honeycomb-glow">
            <VStack spacing={4} align="center">
              <Text as="h1" fontSize="3xl" fontWeight="bold">Gráficas Globales</Text>
              <Text fontSize="md" color="gray.600">Frecuencia temporal de especies (todas las muestras)</Text>
            </VStack>
          </Box>

          <Box bg="white" p={6} rounded="lg" boxShadow="lg" className="honeycomb-glow" mb={6}>
            <Text fontSize="xl" fontWeight="bold" mb={4} textAlign="center">Frecuencia Temporal por Especie (Global)</Text>
            <Text fontSize="sm" color="gray.600" mb={4} textAlign="center">El tamaño del punto representa la cantidad total de granos</Text>
            <Box h="520px">
              {chartGlobalData && <Scatter data={chartGlobalData} options={chartGlobalOptions} />}
            </Box>
          </Box>

          <Box>
            <ListaPools />
          </Box>
        </Box>
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
  // Genera colores distintos por barra
  const barColorPalette = [
    'rgba(255, 99, 132, 0.6)',
    'rgba(54, 162, 235, 0.6)',
    'rgba(255, 206, 86, 0.6)',
    'rgba(75, 192, 192, 0.6)',
    'rgba(153, 102, 255, 0.6)',
    'rgba(255, 159, 64, 0.6)',
    'rgba(99, 255, 132, 0.6)',
    'rgba(235, 54, 162, 0.6)',
    'rgba(86, 255, 206, 0.6)',
    'rgba(192, 75, 192, 0.6)'
  ];

  const barChartData = {
    labels: bar_chart.labels,
    datasets: bar_chart.datasets.map(dataset => {
      const colors = bar_chart.labels.map((_, idx) => barColorPalette[idx % barColorPalette.length]);
      const borderColors = colors.map(c => c.replace('0.6', '1'));
      return {
        ...dataset,
        backgroundColor: colors,
        borderColor: borderColors,
        borderWidth: 1
      };
    })
  };

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

  // Configuración para el gráfico temporal (Y: especies, X: meses)
  const yCategories = Array.from(new Set(scatter_plot.data.map(item => item.x)));

  const scatterChartData = {
    datasets: [{
      label: 'Frecuencia temporal por especie',
      data: scatter_plot.data.map(item => ({
        // X: mes (numérico), Y: especie (categoría)
        x: item.y,
        y: item.x
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
          text: 'Meses'
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
      },
      y: {
        type: 'category',
        title: {
          display: true,
          text: 'Especies'
        },
        labels: yCategories
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
          {/* Gráfico Temporal (arriba) */}
          <GridItem colSpan={{ base: 1, lg: 2 }}>
            <Box bg="white" p={6} rounded="lg" boxShadow="lg" className="honeycomb-glow">
              <Text fontSize="xl" fontWeight="bold" mb={4} textAlign="center">
                Frecuencia Temporal por Especie
              </Text>
              <Text fontSize="sm" color="gray.600" mb={4} textAlign="center">
                {scatter_plot.size_legend}
              </Text>
              <Box h="500px">
                <Scatter data={scatterChartData} options={scatterChartOptions} />
              </Box>
            </Box>
          </GridItem>
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
                <Bar data={barChartData} options={barChartOptions} />
              </Box>
            </Box>
          </GridItem>

          {/* (Se movió el gráfico temporal arriba) */}
        </Grid>
      </Box>
    </Flex>
  );
};

export default GraficasConsultas; 