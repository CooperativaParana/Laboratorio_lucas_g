# Funcionalidad de Estadísticas y Gráficos - Laboratorio Apícola

## Descripción

Esta funcionalidad permite visualizar estadísticas detalladas de los pools de análisis palinológico mediante gráficos interactivos y análisis estadísticos.

## Características

### 📊 Gráficos Disponibles

1. **Gráfico de Torta (Pie Chart)**
   - Muestra el porcentaje que representa cada especie dentro del pool
   - Cálculo: `(cantidad_granos_especie / total_granos_pool) * 100`
   - Incluye tooltips con información detallada

2. **Gráfico de Barras (Bar Chart)**
   - Visualiza cantidades absolutas de granos por especie
   - Permite comparar fácilmente entre especies
   - Escala automática según los datos

3. **Scatter Plot (Gráfico de Dispersión)**
   - Eje X: Especies
   - Eje Y: Mes del año (extraído de fecha_analisis)
   - Tamaño del punto: Proporcional a la cantidad de granos
   - Útil para identificar tendencias estacionales

### 🔧 Componentes Técnicos

#### Backend (Django)
- **Endpoint**: `/api/pool/{pool_id}/stats/`
- **Método**: GET
- **Respuesta**: JSON con datos estructurados para los tres gráficos
- **Optimización**: Uso de `select_related` para minimizar queries

#### Frontend (React + Chart.js)
- **Componente principal**: `GraficasConsultas.js`
- **Lista de pools**: `ListaPools.js`
- **Librería de gráficos**: Chart.js con react-chartjs-2
- **UI Framework**: Chakra UI

## Instalación y Configuración

### 1. Dependencias del Frontend

```bash
cd apicola_lab/frontend
npm install chart.js react-chartjs-2
```

### 2. Verificar URLs del Backend

Asegúrate de que la URL esté incluida en `apicola_lab/backend/modelos/urls.py`:

```python
path('pool/<int:pool_id>/stats/', pool_stats, name='pool_stats'),
```

### 3. Verificar Servicios

El archivo `apicola_lab/backend/modelos/services.py` debe estar presente y contener la clase `PoolStatsService`.

## Uso

### 1. Acceder a la Lista de Pools

Navega a la página de análisis palinológico y busca el enlace "Ver Pools" o similar.

### 2. Ver Gráficos de un Pool

1. En la lista de pools, haz clic en el botón "Ver gráficos" (ícono de ojo)
2. Se abrirá la página de gráficos con las tres visualizaciones
3. Los gráficos se cargan automáticamente con los datos del pool

### 3. Navegación

- **Volver**: Botón para regresar a la lista de pools
- **Responsive**: Los gráficos se adaptan a diferentes tamaños de pantalla

## Estructura de Datos

### Respuesta del API

```json
{
  "pool_info": {
    "id": 1,
    "num_registro": "00001",
    "analista": "Nombre del Analista",
    "fecha_analisis": "2024-01-15",
    "total_granos": 1500,
    "total_especies": 8
  },
  "pie_chart": {
    "labels": ["Especie1", "Especie2"],
    "datasets": [{
      "data": [45.5, 54.5],
      "backgroundColor": ["#FF6384", "#36A2EB"]
    }],
    "detailed_data": [...]
  },
  "bar_chart": {
    "labels": ["Especie1", "Especie2"],
    "datasets": [{
      "label": "Cantidad de Granos",
      "data": [682, 818]
    }]
  },
  "scatter_plot": {
    "data": [...],
    "x_axis": "Especies",
    "y_axis": "Mes del Año"
  }
}
```

## Optimizaciones Implementadas

### Backend
- **Queries optimizadas**: Uso de `select_related` para evitar N+1 queries
- **Cálculos eficientes**: Agregaciones en base de datos cuando es posible
- **Manejo de errores**: Respuestas HTTP apropiadas para diferentes escenarios
- **Código reutilizable**: Lógica separada en servicios

### Frontend
- **Lazy loading**: Los gráficos se cargan solo cuando se accede a la página
- **Manejo de estados**: Loading, error y success states bien definidos
- **Responsive design**: Adaptación a diferentes dispositivos
- **Tooltips informativos**: Información detallada en hover

## Personalización

### Colores de Gráficos

Los colores se pueden personalizar en `services.py`:

```python
'backgroundColor': [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
    '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
]
```

### Configuración de Chart.js

Las opciones de los gráficos se pueden modificar en `GraficasConsultas.js`:

```javascript
const pieChartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'bottom',
      // ... más opciones
    }
  }
};
```

## Troubleshooting

### Problemas Comunes

1. **Gráficos no se cargan**
   - Verificar que Chart.js esté instalado
   - Revisar la consola del navegador para errores
   - Verificar que el endpoint del API esté funcionando

2. **Datos no se muestran**
   - Verificar que el pool tenga análisis palinológicos
   - Revisar la respuesta del API en las herramientas de desarrollador

3. **Errores de CORS**
   - Verificar configuración de Django para permitir requests del frontend

### Logs y Debugging

- **Backend**: Revisar logs de Django para errores del servidor
- **Frontend**: Usar las herramientas de desarrollador del navegador
- **API**: Probar endpoints directamente con Postman o similar

## Contribución

Para agregar nuevos tipos de gráficos o modificar los existentes:

1. **Backend**: Agregar métodos en `PoolStatsService`
2. **Frontend**: Crear nuevos componentes de gráficos
3. **Testing**: Verificar con diferentes conjuntos de datos
4. **Documentación**: Actualizar este README

## Licencia

Este código es parte del proyecto Laboratorio Apícola COADELPA.
