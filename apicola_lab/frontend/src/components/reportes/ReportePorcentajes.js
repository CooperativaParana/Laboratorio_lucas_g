import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Button, 
  Flex, 
  Text, 
  VStack, 
  Table, 
  Thead, 
  Tbody, 
  Tr, 
  Th, 
  Td, 
  TableContainer,
  Spinner,
  Alert,
  AlertIcon,
  Badge,
  Select,
  Input,
  Textarea,
  FormControl,
  FormLabel,
  FormHelperText,
  Container,
  Heading,
  HStack,
  Tooltip,
  Divider,
  Grid,
  GridItem,
  Card,
  CardBody,
  CardHeader,
  IconButton,
  useToast
} from '@chakra-ui/react';
import { 
  ArrowBackIcon, 
  DownloadIcon, 
  RepeatIcon, 
  ViewIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@chakra-ui/icons';
import { useColorModeValue } from '@chakra-ui/react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const ReportePorcentajes = () => {
  const [analisis, setAnalisis] = useState([]);
  const [pools, setPools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentView, setCurrentView] = useState('lista'); // 'lista' o 'reporte'
  const [selectedPool, setSelectedPool] = useState(null);
  const [poolAnalisis, setPoolAnalisis] = useState([]);
  const [tipoSeleccionado, setTipoSeleccionado] = useState('');
  const [observacion, setObservacion] = useState('');
  const [solicitante, setSolicitante] = useState('');
  const [fechaCosecha, setFechaCosecha] = useState('');
  const [sugeridaFechaCosecha, setSugeridaFechaCosecha] = useState('');
  const navigate = useNavigate();
  const toast = useToast();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const headerBg = useColorModeValue('blue.500', 'blue.600');
  const headerTextColor = useColorModeValue('white', 'white');
  const cardBg = useColorModeValue('gray.50', 'gray.700');

  useEffect(() => {
    cargarDatos();
  }, []);

  // Recargar datos cuando el componente recibe el foco
  useEffect(() => {
    const handleFocus = () => {
      if (currentView === 'lista') {
        cargarDatos();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [currentView]);

  const cargarDatos = async () => {
    setLoading(true);
    setError('');
    try {
      // Obtener análisis palinológicos con información de pool y especie
      const timestamp = new Date().getTime();
      const response = await axios.get(`${API_URL}/api/analisis-palinologicos/?_t=${timestamp}`);
      setAnalisis(response.data);
      
      // Extraer pools únicos de los análisis
      const poolsUnicos = extraerPoolsUnicos(response.data);
      setPools(poolsUnicos);
    } catch (err) {
      setError('Error al cargar los datos: ' + (err.response?.data ? JSON.stringify(err.response.data) : err.message));
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los datos',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const extraerPoolsUnicos = (analisisData) => {
    const poolsMap = new Map();
    
    analisisData.forEach(item => {
      if (item.pool && !poolsMap.has(item.pool.id)) {
        poolsMap.set(item.pool.id, {
          id: item.pool.id,
          num_registro: item.pool.num_registro || `Pool ${item.pool.id}`,
          fecha_analisis: item.pool.fecha_analisis,
          analista: item.pool.analista,
          observaciones: item.pool.observaciones,
          created_at: item.pool.created_at
        });
      }
    });

    return Array.from(poolsMap.values()).sort((a, b) => {
      if (a.fecha_analisis && b.fecha_analisis) {
        return new Date(b.fecha_analisis) - new Date(a.fecha_analisis);
      }
      return new Date(b.created_at) - new Date(a.created_at);
    });
  };

  const cargarAnalisisPool = async (poolId) => {
    try {
      const timestamp = new Date().getTime();
      const response = await axios.get(`${API_URL}/api/analisis-palinologicos/?pool=${poolId}&_t=${timestamp}`);
      setPoolAnalisis(response.data);
    } catch (err) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los análisis del pool',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleVerReporte = async (pool) => {
    setSelectedPool(pool);
    setSolicitante(pool?.solicitante || '');
    await cargarAnalisisPool(pool.id);
    setCurrentView('reporte');
  };

  const handleVolver = () => {
    setCurrentView('lista');
    setSelectedPool(null);
    setPoolAnalisis([]);
    setTipoSeleccionado('');
    setObservacion('');
    setSolicitante('');
    setFechaCosecha('');
    setSugeridaFechaCosecha('');
  };

  const handleVolverMenu = () => {
    navigate('/analisis-palinologico');
  };

  const handleDescargarPDF = () => {
    const exportar = async () => {
      try {
        const [{ jsPDF }, autoTableModule] = await Promise.all([
          import('jspdf'),
          import('jspdf-autotable')
        ]);

        const doc = new jsPDF({ unit: 'pt' });
        const pageWidth = doc.internal.pageSize.getWidth();

        // Título
        doc.setFontSize(16);
        doc.text('Reporte Melisopalinológico', pageWidth / 2, 40, { align: 'center' });

        // Información del Estudio
        doc.setFontSize(11);
        const infoLines = [
          `Estudio ID: ${selectedPool?.id ?? 'N/A'}`,
          `Protocolo/ID: ${selectedPool?.num_registro || `Pool ${selectedPool?.id}`}`,
          `Fecha de Análisis: ${selectedPool?.fecha_analisis ? new Date(selectedPool.fecha_analisis).toLocaleDateString('es-ES', { timeZone: 'UTC' }) : 'Sin fecha'}`,
          `Analista: ${selectedPool?.analista ? `${selectedPool.analista.nombres || ''} ${selectedPool.analista.apellidos || ''}`.trim() || 'N/A' : 'N/A'}`,
          `Solicitante: ${solicitante || '—'}`,
          `Fecha de Cosecha: ${fechaCosecha ? new Date(fechaCosecha).toLocaleDateString('es-ES', { timeZone: 'UTC' }) : (sugeridaFechaCosecha ? new Date(sugeridaFechaCosecha).toLocaleDateString('es-ES', { timeZone: 'UTC' }) : '—')}`,
          `Tipo (selección): ${tipoSeleccionado || determinarTipoFloral.tipo}`,
          `Observación: ${observacion || '—'}`
        ];
        let y = 70;
        infoLines.forEach((linea) => {
          doc.text(linea, 40, y);
          y += 16;
        });

        // Sección de Tambores del Estudio
        const tambores = Array.isArray(selectedPool?.tambores) ? selectedPool.tambores : [];
        if (tambores.length > 0) {
          y += 10;
          doc.setFontSize(12);
          doc.text('Tambores que componen la muestra', 40, y);
          y += 6;

          const headersTambores = [[
            'ID Tambor',
            'Código',
            'Apiario(s)',
            'Apicultor',
            'Fecha de Extracción',
            'Observaciones'
          ]];

          const rowsTambores = tambores.map(t => {
            const nombresApiarios = Array.isArray(t?.apiarios) && t.apiarios.length > 0
              ? t.apiarios.map(a => a?.nombre_apiario || a?.nombre || '').filter(Boolean).join(', ')
              : (t?.apiario?.nombre || t?.apiario_nombre || t?.apiario || '—');
            const primerApiario = Array.isArray(t?.apiarios) && t.apiarios.length > 0 ? t.apiarios[0] : null;
            const apicultorNombre = primerApiario?.apicultor
              ? `${primerApiario.apicultor.nombre || ''} ${primerApiario.apicultor.apellido || ''}`.trim() || '—'
              : (t?.apicultor_nombre || t?.productor || '—');
            const fechaRaw = t?.fecha_de_extraccion || t?.fecha_extraccion;
            const fechaExt = fechaRaw ? new Date(fechaRaw).toLocaleDateString('es-ES', { timeZone: 'UTC' }) : '—';
            return [
              String(t?.id ?? '—'),
              String(t?.codigo || t?.numero || t?.identificador || '—'),
              String(nombresApiarios || '—'),
              String(apicultorNombre),
              String(fechaExt),
              String(t?.observaciones || '—')
            ];
          });

          autoTableModule.default(doc, {
            head: headersTambores,
            body: rowsTambores,
            startY: y + 10,
            styles: { fontSize: 9 },
            headStyles: { fillColor: [49, 130, 206] },
            bodyStyles: { valign: 'middle' },
            columnStyles: {
              0: { cellWidth: 70 },
              1: { cellWidth: 80 },
              2: { cellWidth: 120 },
              3: { cellWidth: 140 },
              4: { cellWidth: 90 },
              5: { cellWidth: 'auto' }
            }
          });

          y = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 10 : y + 20;
        }

        // Tabla de especies
        const headers = [['Nombre Científico', 'Nombre Vulgar', 'Familia', 'Cantidad', 'Porcentaje']];
        const rows = calcularPorcentajesPool.map(e => [
          e.nombre_cientifico,
          e.nombre_comun,
          e.familia,
          String(e.cantidad_granos),
          `${e.porcentaje.toFixed(1)}%`
        ]);

        autoTableModule.default(doc, {
          head: headers,
          body: rows,
          startY: y + 10,
          styles: { fontSize: 9 },
          headStyles: { fillColor: [49, 130, 206] },
        });

        // Tabla de especies con marca especial (si existe)
        if (calcularMarcasEspecialesPool.length > 0) {
          const startYMarcas = (doc.lastAutoTable?.finalY || y) + 20;
          doc.setFontSize(12);
          doc.text('Especies con marca especial (no incluidas en % de miel)', 40, startYMarcas);

          const headersMarcas = [['Nombre Científico', 'Nombre Vulgar', 'Familia', 'Cantidad', 'Marca Especial']];
          const rowsMarcas = calcularMarcasEspecialesPool.map(e => [
            e.nombre_cientifico,
            e.nombre_comun,
            e.familia,
            String(e.cantidad_granos),
            e.marca_especial || '—'
          ]);

          autoTableModule.default(doc, {
            head: headersMarcas,
            body: rowsMarcas,
            startY: startYMarcas + 10,
            styles: { fontSize: 9 },
            headStyles: { fillColor: [156, 81, 182] },
          });
        }

        doc.save(`reporte_palinologico_${selectedPool?.id || 'estudio'}.pdf`);
      } catch (err) {
        toast({
          title: 'Dependencias faltantes para PDF',
          description: 'Instala: npm i jspdf jspdf-autotable',
          status: 'warning',
          duration: 5000,
          isClosable: true,
        });
      }
    };

    if (!selectedPool) {
      toast({
        title: 'Selecciona un estudio',
        description: 'Abre un reporte antes de exportar a PDF',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    exportar();
  };

  const handleDescargarExcel = () => {
    const exportar = async () => {
      try {
        const XLSX = await import('xlsx');

        // Armar datos
        const encabezado = [{
          Estudio_ID: selectedPool?.id ?? 'N/A',
          Protocolo_o_ID: selectedPool?.num_registro || `Pool ${selectedPool?.id}`,
          Fecha_Analisis: selectedPool?.fecha_analisis ? new Date(selectedPool.fecha_analisis).toLocaleDateString('es-ES', { timeZone: 'UTC' }) : 'Sin fecha',
          Analista: selectedPool?.analista ? `${selectedPool.analista.nombres || ''} ${selectedPool.analista.apellidos || ''}`.trim() || 'N/A' : 'N/A',
          Solicitante: solicitante || '',
          Fecha_Cosecha: fechaCosecha || (sugeridaFechaCosecha ? new Date(sugeridaFechaCosecha).toLocaleDateString('es-ES', { timeZone: 'UTC' }) : ''),
          Tipo_Seleccion: tipoSeleccionado || determinarTipoFloral.tipo,
          Observacion: observacion || ''
        }];

        const especies = calcularPorcentajesPool.map(e => ({
          Nombre_Cientifico: e.nombre_cientifico,
          Nombre_Vulgar: e.nombre_comun,
          Familia: e.familia,
          Cantidad_Granos: e.cantidad_granos,
          Porcentaje: Number(e.porcentaje.toFixed(1))
        }));

        const wb = XLSX.utils.book_new();
        const wsInfo = XLSX.utils.json_to_sheet(encabezado);
        XLSX.utils.book_append_sheet(wb, wsInfo, 'Estudio');

        const wsEspecies = XLSX.utils.json_to_sheet(especies);
        XLSX.utils.book_append_sheet(wb, wsEspecies, 'Especies');

        // Hoja adicional: Tambores
        const tambores = Array.isArray(selectedPool?.tambores) ? selectedPool.tambores : [];
        if (tambores.length > 0) {
          const tamboresRows = tambores.map(t => {
            const nombresApiarios = Array.isArray(t?.apiarios) && t.apiarios.length > 0
              ? t.apiarios.map(a => a?.nombre_apiario || a?.nombre || '').filter(Boolean).join(', ')
              : (t?.apiario?.nombre || t?.apiario_nombre || t?.apiario || '');
            const primerApiario = Array.isArray(t?.apiarios) && t.apiarios.length > 0 ? t.apiarios[0] : null;
            const apicultorNombre = primerApiario?.apicultor
              ? `${primerApiario.apicultor.nombre || ''} ${primerApiario.apicultor.apellido || ''}`.trim()
              : (t?.apicultor_nombre || t?.productor || '');
            const fechaRaw = t?.fecha_de_extraccion || t?.fecha_extraccion;
            const fechaExt = fechaRaw ? new Date(fechaRaw).toLocaleDateString('es-ES', { timeZone: 'UTC' }) : '';
            return {
              Tambor_ID: t?.id ?? '',
              Codigo_o_Numero: t?.codigo || t?.numero || t?.identificador || '',
              Apiarios: nombresApiarios,
              Apicultor_o_Productor: apicultorNombre,
              Fecha_de_Extraccion: fechaExt,
              Observaciones: t?.observaciones || ''
            };
          });
          const wsTambores = XLSX.utils.json_to_sheet(tamboresRows);
          XLSX.utils.book_append_sheet(wb, wsTambores, 'Tambores');
        }

        // Hoja adicional: Marcas Especiales
        if (calcularMarcasEspecialesPool.length > 0) {
          const marcasRows = calcularMarcasEspecialesPool.map(e => ({
            Nombre_Cientifico: e.nombre_cientifico,
            Nombre_Vulgar: e.nombre_comun,
            Familia: e.familia,
            Cantidad_Granos: e.cantidad_granos,
            Marca_Especial: e.marca_especial || ''
          }));
          const wsMarcas = XLSX.utils.json_to_sheet(marcasRows);
          XLSX.utils.book_append_sheet(wb, wsMarcas, 'MarcasEspeciales');
        }

        XLSX.writeFile(wb, `reporte_palinologico_${selectedPool?.id || 'estudio'}.xlsx`);
      } catch (err) {
        toast({
          title: 'Dependencias faltantes para Excel',
          description: 'Instala: npm i xlsx',
          status: 'warning',
          duration: 5000,
          isClosable: true,
        });
      }
    };

    if (!selectedPool) {
      toast({
        title: 'Selecciona un estudio',
        description: 'Abre un reporte antes de exportar a Excel',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    exportar();
  };

  // Calcular porcentajes por especie para el pool seleccionado (excluyendo especies con marca especial)
  const calcularPorcentajesPool = useMemo(() => {
    if (!poolAnalisis.length) return [];

    const especiesMap = new Map();
    let totalGranos = 0;

    // Filtrar solo especies sin marca especial (estas son las que aportan a la miel)
    const especiesValidas = poolAnalisis.filter(item => 
      item.especie && 
      item.cantidad_granos && 
      (!item.marca_especial || item.marca_especial === '')
    );

    especiesValidas.forEach(item => {
      const especieId = item.especie.id;
      const cantidad = item.cantidad_granos;
      
      if (!especiesMap.has(especieId)) {
        especiesMap.set(especieId, {
          id: especieId,
          nombre_cientifico: item.especie.nombre_cientifico || 'N/A',
          nombre_comun: item.especie.nombre_comun || 'N/A',
          familia: item.especie.familia || 'N/A',
          cantidad_granos: 0,
          porcentaje: 0
        });
      }
      
      especiesMap.get(especieId).cantidad_granos += cantidad;
      totalGranos += cantidad;
    });

    // Calcular porcentajes solo de especies válidas
    especiesMap.forEach(especie => {
      especie.porcentaje = totalGranos > 0 ? (especie.cantidad_granos / totalGranos) * 100 : 0;
    });

    return Array.from(especiesMap.values())
      .sort((a, b) => b.porcentaje - a.porcentaje);
  }, [poolAnalisis]);

  // Especies con marca especial (listado informativo; no participan en % de miel)
  const calcularMarcasEspecialesPool = useMemo(() => {
    if (!poolAnalisis.length) return [];

    const marcasMap = new Map();
    const especiesMarcadas = poolAnalisis.filter(item =>
      item.especie && item.cantidad_granos && item.marca_especial && item.marca_especial !== ''
    );

    especiesMarcadas.forEach(item => {
      const especieId = item.especie.id;
      const cantidad = item.cantidad_granos;
      if (!marcasMap.has(especieId)) {
        marcasMap.set(especieId, {
          id: especieId,
          nombre_cientifico: item.especie.nombre_cientifico || 'N/A',
          nombre_comun: item.especie.nombre_comun || 'N/A',
          familia: item.especie.familia || 'N/A',
          cantidad_granos: 0,
          marca_especial: new Set(),
        });
      }
      const ref = marcasMap.get(especieId);
      ref.cantidad_granos += cantidad;
      if (item.marca_especial) ref.marca_especial.add(String(item.marca_especial));
    });

    return Array.from(marcasMap.values()).map(e => ({
      ...e,
      marca_especial: Array.from(e.marca_especial).join(', ')
    }));
  }, [poolAnalisis]);

  // Determinar si es monofloral o multifloral
  const determinarTipoFloral = useMemo(() => {
    if (!calcularPorcentajesPool.length) return { tipo: 'N/A', descripcion: 'Sin datos suficientes' };
    
    const especieDominante = calcularPorcentajesPool[0];
    const porcentajeDominante = especieDominante.porcentaje;
    
    if (porcentajeDominante > 45) {
      return {
        tipo: 'MONOFLORAL',
        descripcion: `Miel monofloral de ${especieDominante.nombre_cientifico} (${porcentajeDominante.toFixed(1)}%)`,
        especieDominante: especieDominante.nombre_cientifico,
        porcentaje: porcentajeDominante
      };
    } else {
      return {
        tipo: 'MULTIFLORAL',
        descripcion: `Miel multifloral - Especie dominante: ${especieDominante.nombre_cientifico} (${porcentajeDominante.toFixed(1)}%)`,
        especieDominante: especieDominante.nombre_cientifico,
        porcentaje: porcentajeDominante
      };
    }
  }, [calcularPorcentajesPool]);

  // Calcular sugerencia de Fecha de Cosecha a partir de fechas de extracción de tambores
  useEffect(() => {
    let cancelled = false;

    const parseFechaToMs = (value) => {
      if (!value || typeof value !== 'string') return NaN;
      // Intento 1: ISO (YYYY-MM-DD o con tiempo)
      const isoMs = Date.parse(value);
      if (!Number.isNaN(isoMs)) return isoMs;
      // Intento 2: DD/MM/YYYY
      const slash = value.match(/^\s*(\d{1,2})\/(\d{1,2})\/(\d{4})\s*$/);
      if (slash) {
        const d = Number(slash[1]);
        const m = Number(slash[2]) - 1;
        const y = Number(slash[3]);
        const ms = Date.UTC(y, m, d);
        return Number.isNaN(ms) ? NaN : ms;
      }
      // Intento 3: YYYY/MM/DD o YYYY-MM-DD forzando UTC
      const dash = value.match(/^\s*(\d{4})[-\/.](\d{1,2})[-\/.](\d{1,2})\s*$/);
      if (dash) {
        const y = Number(dash[1]);
        const m = Number(dash[2]) - 1;
        const d = Number(dash[3]);
        const ms = Date.UTC(y, m, d);
        return Number.isNaN(ms) ? NaN : ms;
      }
      return NaN;
    };

    try {
      const extraerFechasExtraccion = () => {
        const fechas = [];
        // 1) Si el pool trae tambores asociados
        if (selectedPool && Array.isArray(selectedPool.tambores)) {
          selectedPool.tambores.forEach(t => {
            if (t && t.fecha_extraccion) {
              const ms = parseFechaToMs(t.fecha_extraccion);
              if (!Number.isNaN(ms)) fechas.push(ms);
            }
          });
        }
        // 2) Intentar desde poolAnalisis si incluyen referencia a tambor/muestra
        if (fechas.length === 0 && Array.isArray(poolAnalisis)) {
          poolAnalisis.forEach(item => {
            // posibles rutas comunes
            const posibles = [
              item?.tambor?.fecha_extraccion,
              item?.muestra?.tambor?.fecha_extraccion,
              item?.muestra?.fecha_extraccion,
            ];
            posibles.forEach(f => {
              const ms = parseFechaToMs(f);
              if (!Number.isNaN(ms)) fechas.push(ms);
            });
          });
        }
        return fechas;
      };

      const fechasMs = extraerFechasExtraccion();
      if (!cancelled) {
        if (fechasMs.length > 0) {
          const promedio = Math.round(fechasMs.reduce((a, b) => a + b, 0) / fechasMs.length);
          const fechaIso = new Date(promedio).toISOString().slice(0, 10);
          setSugeridaFechaCosecha(fechaIso);
          if (!fechaCosecha) setFechaCosecha(fechaIso);
        } else {
          setSugeridaFechaCosecha('');
        }
      }
    } catch (e) {
      // Silenciar para no romper la UI si algún formato no esperado aparece
      if (!cancelled) {
        setSugeridaFechaCosecha('');
      }
    }

    return () => {
      cancelled = true;
    };
  }, [selectedPool, poolAnalisis]);

  if (loading) {
    return (
      <Flex minH="100vh" align="center" justify="center">
        <Spinner size="xl" />
      </Flex>
    );
  }

  // VISTA 1: Lista de Estudios
  if (currentView === 'lista') {
    return (
      <Flex minH="100vh" align="center" justify="center" bg="transparent" p={4}>
        <Container maxW="95%" bg="white" p={6} rounded="lg" boxShadow="lg" maxH="95vh" overflow="hidden" className="honeycomb-glow">
          <VStack spacing={6} align="stretch" h="100%">
            {/* Header */}
            <Box bg={headerBg} p={4} rounded="lg" color={headerTextColor} flexShrink={0}>
              <Flex justify="space-between" align="center">
                <Button 
                  leftIcon={<ArrowBackIcon />} 
                  onClick={handleVolverMenu} 
                  colorScheme="whiteAlpha" 
                  variant="outline"
                  size="sm"
                >
                  Volver
                </Button>
                <VStack spacing={1}>
                  <Heading size="lg" textAlign="center">
                    Estudios Melisopalinológicos
                  </Heading>
                  <Text fontSize="sm" opacity={0.9}>
                    {new Date().toLocaleDateString('es-ES', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </Text>
                </VStack>
                <HStack spacing={2}>
                  <Button
                    leftIcon={<RepeatIcon />}
                    colorScheme="blue"
                    size="sm"
                    onClick={cargarDatos}
                    isLoading={loading}
                  >
                    Recargar
                  </Button>
                </HStack>
              </Flex>
            </Box>

            {error && (
              <Alert status="error" flexShrink={0}>
                <AlertIcon />
                {error}
              </Alert>
            )}

            {/* Estadísticas */}
            <Box p={4} bg="blue.50" rounded="md" flexShrink={0}>
              <HStack justify="space-between" align="center">
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm" fontWeight="bold" color="blue.700">
                    Resumen de Estudios
                  </Text>
                  <Text fontSize="xs" color="blue.600">
                    Total de estudios: {pools.length} | Total de análisis: {analisis.length}
                  </Text>
                </VStack>
                <Badge colorScheme={pools.length > 0 ? "green" : "red"} variant="solid">
                  {pools.length > 0 ? `${pools.length} estudios disponibles` : 'Sin estudios disponibles'}
                </Badge>
              </HStack>
            </Box>

            {pools.length === 0 ? (
              <Text textAlign="center" color="gray.500" fontSize="lg" flexShrink={0}>
                No hay estudios melisopalinológicos disponibles.
              </Text>
            ) : (
              <Box 
                overflowX="auto" 
                overflowY="auto" 
                flex={1}
                minH="0"
                maxH="calc(95vh - 300px)"
              >
                <TableContainer>
                  <Table variant="striped" size="sm" borderWidth={1} borderColor={borderColor} minW="800px">
                    <Thead position="sticky" top={0} bg={headerBg} zIndex={1}>
                      <Tr>
                        <Th borderWidth={1} borderColor={borderColor} minW="100px" color={headerTextColor}>
                          ID Estudio
                        </Th>
                        <Th borderWidth={1} borderColor={borderColor} minW="120px" color={headerTextColor}>
                          N° Registro
                        </Th>
                        <Th borderWidth={1} borderColor={borderColor} minW="120px" color={headerTextColor}>
                          Fecha Análisis
                        </Th>
                        <Th borderWidth={1} borderColor={borderColor} minW="150px" color={headerTextColor}>
                          Analista
                        </Th>
                        <Th borderWidth={1} borderColor={borderColor} minW="100px" color={headerTextColor}>
                          Acciones
                        </Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {pools.map((pool) => (
                        <Tr key={pool.id} _hover={{ bg: 'gray.50' }}>
                          <Td 
                            borderWidth={1} 
                            borderColor={borderColor}
                            fontWeight="bold" 
                            color="blue.600"
                          >
                            {pool.id}
                          </Td>
                          <Td borderWidth={1} borderColor={borderColor}>
                            {pool.num_registro}
                          </Td>
                          <Td borderWidth={1} borderColor={borderColor}>
                            {pool.fecha_analisis ? 
                              new Date(pool.fecha_analisis).toLocaleDateString('es-ES', { timeZone: 'UTC' }) : 
                              'Sin fecha'
                            }
                          </Td>
                          <Td borderWidth={1} borderColor={borderColor}>
                            {pool.analista ? 
                              `${pool.analista.nombres || ''} ${pool.analista.apellidos || ''}`.trim() || 'N/A' : 
                              'N/A'
                            }
                          </Td>
                          <Td borderWidth={1} borderColor={borderColor} textAlign="center">
                            <Button
                              leftIcon={<ViewIcon />}
                              colorScheme="blue"
                              size="sm"
                              onClick={() => handleVerReporte(pool)}
                            >
                              Ver Reporte
                            </Button>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            <Flex justify="center" align="center" mt={4} flexShrink={0}>
              <Text fontSize="sm" color="gray.600">
                Total de estudios: {pools.length}
              </Text>
            </Flex>
          </VStack>
        </Container>
      </Flex>
    );
  }

  // VISTA 2: Reporte Individual
  return (
    <Flex minH="100vh" align="flex-start" justify="center" bg="transparent" p={{ base: 2, md: 4 }}>
      <Container maxW="95%" bg="white" p={{ base: 4, md: 6 }} rounded="lg" boxShadow="lg" className="honeycomb-glow" my={4}>
        <VStack spacing={6} align="stretch">
          {/* Header del Reporte */}
          <Box bg={headerBg} p={4} rounded="lg" color={headerTextColor} flexShrink={0} position="sticky" top={0} zIndex={10}>
            <Flex 
              justify="center" 
              align="center"
              direction="row"
              spacing={{ base: 3, md: 0 }}
              gap={3}
              position="relative"
            >
              <Box position="absolute" left={0}>
                <Button 
                  leftIcon={<ChevronLeftIcon />} 
                  onClick={handleVolver} 
                  colorScheme="whiteAlpha" 
                  variant="outline"
                  size="sm"
                  order={{ base: 1, md: 1 }}
                >
                  Volver a Lista
                </Button>
              </Box>
              <VStack spacing={1} order={{ base: 2, md: 2 }}>
                <Heading size={{ base: "md", md: "lg" }} textAlign="center">
                  Reporte Melisopalinológico
                </Heading>
                <Text fontSize={{ base: "xs", md: "sm" }} opacity={0.9} textAlign="center">
                  Estudio ID: {selectedPool?.id} - {new Date().toLocaleDateString('es-ES', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </Text>
              </VStack>
            </Flex>
          </Box>

          {/* Información del Estudio */}
          <Card bg={cardBg} borderWidth={1} borderColor={borderColor}>
            <CardHeader>
              <Heading size="md" color="blue.700">
                Información del Estudio
              </Heading>
            </CardHeader>
            <CardBody>
              <Grid templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={{ base: 3, md: 4 }}>
                <GridItem>
                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm" fontWeight="bold" color="gray.600">
                      Protocolo/ID:
                    </Text>
                    <Text fontSize="md" fontWeight="semibold">
                      {selectedPool?.num_registro || `Pool ${selectedPool?.id}`}
                    </Text>
                  </VStack>
                </GridItem>
                <GridItem>
                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm" fontWeight="bold" color="gray.600">
                      Analista:
                    </Text>
                    <Text fontSize="md">
                      {selectedPool?.analista ? 
                        `${selectedPool.analista.nombres || ''} ${selectedPool.analista.apellidos || ''}`.trim() || 'N/A' : 
                        'N/A'
                      }
                    </Text>
                  </VStack>
                </GridItem>
                <GridItem>
                  <FormControl>
                    <FormLabel fontSize="sm" color="gray.600">Solicitante:</FormLabel>
                    <Input 
                      placeholder="Nombre del solicitante (no se guarda en el sistema)"
                      value={solicitante}
                      onChange={(e) => setSolicitante(e.target.value)}
                      size="sm"
                    />
                    <FormHelperText>
                      Campo opcional para imprimir/exportar.
                    </FormHelperText>
                  </FormControl>
                </GridItem>
                <GridItem>
                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm" fontWeight="bold" color="gray.600">
                      Fecha de Análisis:
                    </Text>
                    <Text fontSize="md">
                      {selectedPool?.fecha_analisis ? 
                        new Date(selectedPool.fecha_analisis).toLocaleDateString('es-ES', { timeZone: 'UTC' }) : 
                        'Sin fecha'
                      }
                    </Text>
                  </VStack>
                </GridItem>
                <GridItem>
                  <FormControl>
                    <FormLabel fontSize="sm" color="gray.600">Fecha de Cosecha:</FormLabel>
                    <Input 
                      type="date"
                      value={fechaCosecha}
                      onChange={(e) => setFechaCosecha(e.target.value)}
                      size="sm"
                      maxW={{ base: 'full', md: '220px' }}
                    />
                    <FormHelperText>
                      Sugerida: {sugeridaFechaCosecha ? new Date(sugeridaFechaCosecha).toLocaleDateString('es-ES', { timeZone: 'UTC' }) : '—'}
                    </FormHelperText>
                  </FormControl>
                </GridItem>
                <GridItem>
                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm" fontWeight="bold" color="gray.600">
                      Fecha de Creación:
                    </Text>
                    <Text fontSize="md">
                      {selectedPool?.created_at ? 
                        new Date(selectedPool.created_at).toLocaleDateString('es-ES', { timeZone: 'UTC' }) : 
                        'N/A'
                      }
                    </Text>
                  </VStack>
                </GridItem>
                <GridItem colSpan={{ base: 1, md: 2, lg: 2 }}>
                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm" fontWeight="bold" color="gray.600">
                      Observaciones:
                    </Text>
                    <Text fontSize="md">
                      {selectedPool?.observaciones || 'Sin observaciones'}
                    </Text>
                  </VStack>
                </GridItem>
                <GridItem colSpan={{ base: 1, md: 2, lg: 2 }}>
                  <VStack align="start" spacing={3} w="full">
                    <FormControl>
                      <FormLabel fontSize="sm" color="gray.600">Tipo de Miel (selección del analista):</FormLabel>
                      <Select
                        placeholder="Seleccione tipo"
                        value={tipoSeleccionado}
                        onChange={(e) => setTipoSeleccionado(e.target.value)}
                        maxW={{ base: 'full', md: '300px' }}
                      >
                        <option value="MONOFLORAL">Monofloral</option>
                        <option value="MULTIFLORAL">Multifloral</option>
                      </Select>
                      <FormHelperText>
                        Sugerencia automática: {determinarTipoFloral.tipo} — {determinarTipoFloral.descripcion}
                      </FormHelperText>
                    </FormControl>

                    <FormControl>
                      <FormLabel fontSize="sm" color="gray.600">Observación</FormLabel>
                      <Textarea
                        value={observacion}
                        onChange={(e) => setObservacion(e.target.value)}
                        placeholder="Describa el criterio utilizado (p. ej., especie X considerada monofloral a ≥70%, literatura, experiencia, etc.)"
                        rows={3}
                      />
                    </FormControl>

                    <HStack>
                      <Text fontSize="sm" fontWeight="bold" color="gray.600">Selección actual:</Text>
                      <Badge 
                        colorScheme={(tipoSeleccionado || determinarTipoFloral.tipo) === 'MONOFLORAL' ? 'green' : 'orange'}
                        fontSize="md"
                        px={3}
                        py={1}
                      >
                        {tipoSeleccionado || determinarTipoFloral.tipo}
                      </Badge>
                    </HStack>
                  </VStack>
                </GridItem>
              </Grid>
            </CardBody>
          </Card>

          {/* Tabla de Especies */}
                      <Card bg={cardBg} borderWidth={1} borderColor={borderColor} flex={1}>
              <CardHeader>
                <VStack align="center" spacing={2}>
                  <Heading size="md" color="blue.700" textAlign="center">
                    Análisis de Especies Botánicas
                  </Heading>
                  <VStack align="center" spacing={1}>
                    <Text fontSize="sm" color="gray.600" textAlign="center">
                      <Badge colorScheme="blue" variant="subtle" mr={2}>
                        ⚠️ Filtrado
                      </Badge>
                      Solo se muestran especies sin marca especial (aportan a la miel)
                    </Text>
                    <Text fontSize="xs" color="gray.500" textAlign="center">
                      <Badge colorScheme="purple" variant="subtle" mr={2}>
                        📊 Criterio
                      </Badge>
                      Monofloral: {'>'}45% de una especie | Multifloral: ≤45% de todas las especies
                    </Text>
                  </VStack>
                </VStack>
              </CardHeader>
            <CardBody>
              {calcularPorcentajesPool.length === 0 ? (
                <Text textAlign="center" color="gray.500" fontSize="lg">
                  No hay análisis de especies disponibles para este estudio.
                </Text>
              ) : (
                <Box 
                  overflowX="auto" 
                  maxH={{ base: "300px", md: "400px" }} 
                  overflowY="auto"
                  borderWidth={1}
                  borderColor={borderColor}
                  rounded="md"
                >
                  <Table variant="striped" size="sm" borderWidth={1} borderColor={borderColor} minW={{ base: "500px", md: "600px" }}>
                    <Thead bg={headerBg} position="sticky" top={0} zIndex={1}>
                      <Tr>
                        <Th borderWidth={1} borderColor={borderColor} color={headerTextColor} minW={{ base: "120px", md: "150px" }}>
                          Nombre Científico
                        </Th>
                        <Th borderWidth={1} borderColor={borderColor} color={headerTextColor} minW={{ base: "100px", md: "120px" }}>
                          Nombre Vulgar
                        </Th>
                        <Th borderWidth={1} borderColor={borderColor} color={headerTextColor} minW={{ base: "80px", md: "100px" }}>
                          Familia
                        </Th>
                        <Th borderWidth={1} borderColor={borderColor} color={headerTextColor} minW={{ base: "80px", md: "100px" }}>
                          Cantidad Granos
                        </Th>
                        <Th borderWidth={1} borderColor={borderColor} color={headerTextColor} minW={{ base: "80px", md: "100px" }}>
                          Porcentaje
                        </Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {calcularPorcentajesPool.map((especie) => (
                        <Tr key={especie.id} _hover={{ bg: 'gray.50' }}>
                          <Td borderWidth={1} borderColor={borderColor} fontWeight="semibold">
                            {especie.nombre_cientifico}
                          </Td>
                          <Td borderWidth={1} borderColor={borderColor}>
                            {especie.nombre_comun}
                          </Td>
                          <Td borderWidth={1} borderColor={borderColor}>
                            {especie.familia}
                          </Td>
                          <Td borderWidth={1} borderColor={borderColor} textAlign="center">
                            <Badge colorScheme="blue" fontSize="sm">
                              {especie.cantidad_granos}
                            </Badge>
                          </Td>
                          <Td borderWidth={1} borderColor={borderColor} textAlign="center">
                            <Badge colorScheme="teal" fontSize="sm" px={2} py={1}>
                              {especie.porcentaje.toFixed(1)}%
                            </Badge>
                          </Td>
                        </Tr>
                      ))}

                      {calcularMarcasEspecialesPool.length > 0 && (
                        <>
                          <Tr>
                            <Td borderWidth={1} borderColor={borderColor} colSpan={5} bg="purple.50">
                              <Text fontWeight="bold" color="purple.700">
                                Especies con marca especial (no aportan al porcentaje)
                              </Text>
                            </Td>
                          </Tr>
                          {calcularMarcasEspecialesPool.map((esp) => (
                            <Tr key={`marca-${esp.id}`} _hover={{ bg: 'gray.50' }}>
                              <Td borderWidth={1} borderColor={borderColor} fontWeight="semibold" color="purple.700">
                                {esp.nombre_cientifico}
                              </Td>
                              <Td borderWidth={1} borderColor={borderColor}>
                                {esp.nombre_comun}
                              </Td>
                              <Td borderWidth={1} borderColor={borderColor}>
                                {esp.familia}
                              </Td>
                              <Td borderWidth={1} borderColor={borderColor} textAlign="center">
                                <Badge colorScheme="purple" fontSize="sm">
                                  {esp.cantidad_granos}
                                </Badge>
                              </Td>
                              <Td borderWidth={1} borderColor={borderColor} textAlign="center">
                                <Badge colorScheme="gray" fontSize="sm" px={2} py={1}>
                                  —
                                </Badge>
                              </Td>
                            </Tr>
                          ))}
                        </>
                      )}
                    </Tbody>
                  </Table>
                </Box>
              )}
            </CardBody>
          </Card>

          {/* Resumen y Totales */}
          <Card bg={cardBg} borderWidth={1} borderColor={borderColor}>
            <CardBody>
              <Grid templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }} gap={{ base: 3, md: 4 }}>
                <GridItem>
                  <VStack align="center" spacing={1}>
                    <Text fontSize="sm" fontWeight="bold" color="gray.600">
                      Especies Válidas
                    </Text>
                    <Badge colorScheme="green" fontSize="lg" px={3} py={1}>
                      {calcularPorcentajesPool.length}
                    </Badge>
                    <Text fontSize="xs" color="gray.500" textAlign="center">
                      Sin marca especial
                    </Text>
                  </VStack>
                </GridItem>
                <GridItem>
                  <VStack align="center" spacing={1}>
                    <Text fontSize="sm" fontWeight="bold" color="gray.600">
                      Total de Granos
                    </Text>
                    <Badge colorScheme="blue" fontSize="lg" px={3} py={1}>
                      {calcularPorcentajesPool.reduce((sum, especie) => sum + especie.cantidad_granos, 0)}
                    </Badge>
                  </VStack>
                </GridItem>
                <GridItem>
                  <VStack align="center" spacing={1}>
                    <Text fontSize="sm" fontWeight="bold" color="gray.600">
                      Porcentaje Total
                    </Text>
                    <Badge 
                      colorScheme="teal" 
                      fontSize="lg" 
                      px={3} 
                      py={1}
                    >
                      {calcularPorcentajesPool.reduce((sum, especie) => sum + especie.porcentaje, 0).toFixed(1)}%
                    </Badge>
                  </VStack>
                </GridItem>
                <GridItem>
                  <VStack align="center" spacing={1}>
                    <Text fontSize="sm" fontWeight="bold" color="gray.600">
                      Tipo de Miel
                    </Text>
                    <Badge 
                      colorScheme={(tipoSeleccionado || determinarTipoFloral.tipo) === 'MONOFLORAL' ? 'green' : 'orange'} 
                      fontSize="md" 
                      px={2} 
                      py={1}
                    >
                      {tipoSeleccionado || determinarTipoFloral.tipo}
                    </Badge>
                  </VStack>
                </GridItem>
              </Grid>
            </CardBody>
          </Card>

          {/* Botones de Acción */}
          <Flex 
            justify={{ base: "center", md: "space-between" }} 
            align="center" 
            flexShrink={0}
            direction={{ base: "column", md: "row" }}
            spacing={{ base: 3, md: 0 }}
            gap={3}
          >
            <Button
              leftIcon={<ChevronLeftIcon />}
              colorScheme="blue"
              variant="outline"
              onClick={handleVolver}
              size={{ base: "md", md: "md" }}
              width={{ base: "full", md: "auto" }}
            >
              Volver a Lista
            </Button>
            <Button
              leftIcon={<DownloadIcon />}
              colorScheme="teal"
              onClick={handleDescargarPDF}
              size={{ base: "md", md: "md" }}
              width={{ base: "full", md: "auto" }}
            >
              Generar PDF
            </Button>
            <Button
              leftIcon={<DownloadIcon />}
              colorScheme="green"
              onClick={handleDescargarExcel}
              size={{ base: "md", md: "md" }}
              width={{ base: "full", md: "auto" }}
            >
              Generar Excel
            </Button>
          </Flex>
        </VStack>
      </Container>
    </Flex>
  );
};

export default ReportePorcentajes; 