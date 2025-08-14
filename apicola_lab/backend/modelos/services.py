from django.db.models import Sum, Count
from django.http import JsonResponse
from .models.Pool_model import Pool
from .models.AnalisisPalinologico_model import AnalisisPalinologico


class PoolStatsService:
    """
    Servicio para calcular estadísticas de pools
    """
    
    @staticmethod
    def get_pool_stats(pool_id):
        """
        Obtiene estadísticas completas de un pool específico
        
        Args:
            pool_id (int): ID del pool
            
        Returns:
            dict: Datos estructurados para gráficos
        """
        try:
            # Obtener el pool con su analista
            pool = Pool.objects.select_related('analista').get(id=pool_id)
            
            # Obtener análisis palinológicos con especies relacionadas
            analisis = AnalisisPalinologico.objects.filter(
                pool=pool
            ).select_related('especie').order_by('especie__nombre_cientifico')
            
            print(f"Pool {pool_id} encontrado: {pool}")
            print(f"Análisis encontrados: {analisis.count()}")
            
            if not analisis.exists():
                return {
                    'error': 'No hay análisis palinológicos para este pool',
                    'status': 404
                }
            
            # Calcular total de granos
            total_granos = analisis.aggregate(total=Sum('cantidad_granos'))['total'] or 0
            
            # Preparar datos para gráficos
            pie_chart_data = PoolStatsService._prepare_pie_chart_data(analisis, total_granos)
            bar_chart_data = PoolStatsService._prepare_bar_chart_data(pie_chart_data)
            scatter_plot_data = PoolStatsService._prepare_scatter_plot_data(analisis, pool)
            
            # Información del pool
            pool_info = PoolStatsService._prepare_pool_info(pool, total_granos, len(pie_chart_data))
            
            return {
                'pool_info': pool_info,
                'pie_chart': pie_chart_data,
                'bar_chart': bar_chart_data,
                'scatter_plot': scatter_plot_data,
                'status': 200
            }
            
        except Pool.DoesNotExist:
            return {
                'error': 'Pool no encontrado',
                'status': 404
            }
        except Exception as e:
            import traceback
            error_details = traceback.format_exc()
            print(f"Error en PoolStatsService: {str(e)}")
            print(f"Traceback: {error_details}")
            return {
                'error': f'Error al procesar la solicitud: {str(e)}',
                'status': 500
            }
    
    @staticmethod
    def _prepare_pie_chart_data(analisis, total_granos):
        """Prepara datos para gráfico de torta"""
        pie_chart_data = []
        
        for analisis_item in analisis:
            porcentaje = (analisis_item.cantidad_granos / total_granos * 100) if total_granos > 0 else 0
            pie_chart_data.append({
                'especie': analisis_item.especie.nombre_cientifico,
                'nombre_comun': analisis_item.especie.nombre_comun or '',
                'porcentaje': round(porcentaje, 2),
                'cantidad': analisis_item.cantidad_granos
            })
        
        return {
            'labels': [item['especie'] for item in pie_chart_data],
            'datasets': [{
                'data': [item['porcentaje'] for item in pie_chart_data],
                'backgroundColor': [
                    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
                    '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
                ],
                'labels': [item['especie'] for item in pie_chart_data]
            }],
            'detailed_data': pie_chart_data
        }
    
    @staticmethod
    def _prepare_bar_chart_data(pie_chart_data):
        """Prepara datos para gráfico de barras"""
        # pie_chart_data es la estructura completa, necesitamos detailed_data
        detailed_data = pie_chart_data.get('detailed_data', [])
        
        return {
            'labels': [item['especie'] for item in detailed_data],
            'datasets': [{
                'label': 'Cantidad de Granos',
                'data': [item['cantidad'] for item in detailed_data],
                'backgroundColor': 'rgba(54, 162, 235, 0.8)',
                'borderColor': 'rgba(54, 162, 235, 1)',
                'borderWidth': 1
            }]
        }
    
    @staticmethod
    def _prepare_scatter_plot_data(analisis, pool):
        """Prepara datos para scatter plot"""
        # Agrupar por especie y sumar cantidades
        especies_por_mes = {}
        
        for analisis_item in analisis:
            especie = analisis_item.especie.nombre_cientifico
            cantidad = analisis_item.cantidad_granos
            
            if especie not in especies_por_mes:
                especies_por_mes[especie] = cantidad
            else:
                especies_por_mes[especie] += cantidad
        
        # Crear puntos para el scatter plot
        scatter_data = []
        for especie, cantidad_total in especies_por_mes.items():
            if pool.fecha_analisis:
                mes = pool.fecha_analisis.month
                nombre_mes = pool.fecha_analisis.strftime('%B')
            else:
                mes = 1
                nombre_mes = 'Enero'
            
            scatter_data.append({
                'x': especie,
                'y': mes,
                'nombre_mes': nombre_mes,
                'cantidad': cantidad_total,
                'radio': min(cantidad_total / 10, 20)  # Radio proporcional, máximo 20
            })
        
        return {
            'data': scatter_data,
            'x_axis': 'Especies',
            'y_axis': 'Mes del Año',
            'size_legend': 'Tamaño proporcional a cantidad de granos'
        }
    
    @staticmethod
    def _prepare_pool_info(pool, total_granos, total_especies):
        """Prepara información del pool"""
        return {
            'id': pool.id,
            'num_registro': pool.num_registro,
            'analista': pool.analista.nombre if hasattr(pool.analista, 'nombre') else str(pool.analista),
            'fecha_analisis': pool.fecha_analisis.isoformat() if pool.fecha_analisis else None,
            'total_granos': total_granos,
            'total_especies': total_especies
        }


def get_pool_stats_response(pool_id):
    """
    Función de conveniencia para obtener respuesta JSON de estadísticas del pool
    
    Args:
        pool_id (int): ID del pool
        
    Returns:
        JsonResponse: Respuesta HTTP con datos o error
    """
    result = PoolStatsService.get_pool_stats(pool_id)
    
    if result.get('status') == 200:
        # Remover el campo status antes de enviar la respuesta
        result.pop('status')
        return JsonResponse(result)
    else:
        status_code = result.get('status', 500)
        error_message = result.get('error', 'Error desconocido')
        return JsonResponse({'error': error_message}, status=status_code)
