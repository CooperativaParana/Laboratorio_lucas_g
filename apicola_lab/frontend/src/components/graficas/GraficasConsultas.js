import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Button, Flex, Text, VStack, HStack, Spinner, Alert, AlertIcon, Grid, GridItem } from '@chakra-ui/react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, BarElement, RadialLinearScale } from 'chart.js';
import { Pie, Bar, Scatter, Radar } from 'react-chartjs-2';
import ListaPools from '../analisis/ListaPools';

// Registrar componentes de Chart.js
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, BarElement, RadialLinearScale);

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
      const response = await fetch(`${API_URL}/api/pool/${poolId}/stats/`);
      
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

      const poolsRes = await fetch(`${API_URL}/api/pools/`);
      if (!poolsRes.ok) throw new Error(`Error ${poolsRes.status}: ${poolsRes.statusText}`);
      const poolsJson = await poolsRes.json();
      setPools(poolsJson);

      const stats = await Promise.all(
        poolsJson.map(async (p) => {
          try {
            const res = await fetch(`${API_URL}/api/pool/${p.id}/stats/`);
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

  const { pool_info, pie_chart } = data;

  // Filtrar especies que aportan al porcentaje (sin marca especial)
  const maskSinMarca = (pie_chart?.labels || []).map((label) => {
    const d = Array.isArray(pie_chart?.detailed_data)
      ? pie_chart.detailed_data.find((it) => it.especie === label)
      : null;
    const marca = d?.marca_especial;
    return !(marca && String(marca).trim() !== '');
  });
  const filteredLabels = (pie_chart?.labels || []).filter((_, idx) => maskSinMarca[idx]);
  const filteredPercents = (pie_chart?.datasets?.[0]?.data || []).filter((_, idx) => maskSinMarca[idx]);
  const filteredPieBg = (pie_chart?.datasets?.[0]?.backgroundColor || []).filter((_, idx) => maskSinMarca[idx]);

  // Configuración para el gráfico de torta
  const pieChartData = {
    labels: filteredLabels,
    datasets: [{
      data: filteredPercents,
      backgroundColor: filteredPieBg.length ? filteredPieBg : pie_chart.datasets[0].backgroundColor,
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
            const detailedData = Array.isArray(pie_chart.detailed_data) ? pie_chart.detailed_data.find(item => item.especie === label) : null;
            return `${label}: ${value}% (${detailedData?.cantidad || 0} granos)`;
          }
        }
      }
    }
  };

  // Configuración para el gráfico de barras (porcentajes)
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
    labels: filteredLabels,
    datasets: [{
      label: 'Porcentaje por especie',
      data: filteredPercents,
      backgroundColor: filteredLabels.map((_, idx) => barColorPalette[idx % barColorPalette.length]),
      borderColor: filteredLabels.map((_, idx) => barColorPalette[idx % barColorPalette.length].replace('0.6', '1')),
      borderWidth: 1
    }]
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
            return `Porcentaje: ${context.parsed.y}%`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Porcentaje (%)'
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

  // Scatter de porcentaje (X) vs especies (Y)
  const scaleRadiusPct = (p) => {
    const minR = 4;
    const maxR = 12;
    const clamped = Math.max(0, Math.min(100, Number(p) || 0));
    return minR + (clamped / 100) * (maxR - minR);
  };

  const scatterPorcentajeData = {
    datasets: [{
      label: 'Porcentaje por especie',
      data: filteredLabels.map((label, idx) => ({ x: filteredPercents[idx] || 0, y: label })),
      backgroundColor: 'rgba(54, 162, 235, 0.6)',
      borderColor: 'rgba(54, 162, 235, 1)',
      pointRadius: filteredPercents.map(v => scaleRadiusPct(v)),
      pointHoverRadius: filteredPercents.map(v => scaleRadiusPct(v) + 2)
    }]
  };

  const scatterPorcentajeOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: function(context) {
            const p = context.raw;
            return [`Especie: ${p?.y ?? ''}`, `Porcentaje: ${p?.x ?? 0}%`];
          }
        }
      }
    },
    scales: {
      x: {
        title: { display: true, text: 'Porcentaje (%)' },
        beginAtZero: true,
        max: 100
      },
      y: {
        type: 'category',
        title: { display: true, text: 'Especies' },
        labels: filteredLabels || []
      }
    }
  };

  // Radar chart de porcentajes por especie
  const radarData = {
    labels: filteredLabels,
    datasets: [{
      label: 'Porcentaje (%)',
      data: filteredPercents,
      backgroundColor: 'rgba(153, 102, 255, 0.2)',
      borderColor: 'rgba(153, 102, 255, 1)',
      pointBackgroundColor: 'rgba(153, 102, 255, 1)'
    }]
  };

  const radarOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' }
    },
    scales: {
      r: {
        beginAtZero: true,
        suggestedMax: 100,
        ticks: { showLabelBackdrop: false }
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
              <Text><strong>Fecha:</strong> {pool_info.fecha_analisis ? new Date(pool_info.fecha_analisis).toLocaleDateString('es-ES', { timeZone: 'UTC' }) : 'No especificada'}</Text>
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

          {/* Gráfico de Barras (Porcentajes) */}
          <GridItem>
            <Box bg="white" p={6} rounded="lg" boxShadow="lg" className="honeycomb-glow">
              <Text fontSize="xl" fontWeight="bold" mb={4} textAlign="center">
                Porcentaje por Especie (%)
              </Text>
              <Box h="400px">
                <Bar data={barChartData} options={barChartOptions} />
              </Box>
            </Box>
          </GridItem>

          {/* Scatter: Porcentaje (X) vs Especies (Y) */}
          <GridItem>
            <Box bg="white" p={6} rounded="lg" boxShadow="lg" className="honeycomb-glow">
              <Text fontSize="xl" fontWeight="bold" mb={4} textAlign="center">
                Porcentaje por Especie (Scatter)
              </Text>
              <Box h="400px">
                <Scatter data={scatterPorcentajeData} options={scatterPorcentajeOptions} />
              </Box>
            </Box>
          </GridItem>

          {/* Radar: Porcentaje por Especie */}
          <GridItem>
            <Box bg="white" p={6} rounded="lg" boxShadow="lg" className="honeycomb-glow">
              <Text fontSize="xl" fontWeight="bold" mb={4} textAlign="center">
                Distribución de Porcentajes (Radar)
              </Text>
              <Box h="400px">
                <Radar data={radarData} options={radarOptions} />
              </Box>
            </Box>
          </GridItem>
        </Grid>
      </Box>
    </Flex>
  );
};

export default GraficasConsultas; 