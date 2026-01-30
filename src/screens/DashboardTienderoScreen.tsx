import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTiendasAPI } from '../hooks/useTiendasAPI';
import { usePerfilUsuario } from '../hooks/usePerfilUsuario';
import { useInventarioAPI } from '../hooks/useInventarioAPI';
import { usePedidosAPI } from '../hooks/usePedidosAPI';

const DashboardTienderoScreen: React.FC = () => {
  const navigation = useNavigation();
  const { perfil } = usePerfilUsuario();
  const { tiendas, fetchTiendas, loading: loadingTiendas } = useTiendasAPI();
  const { inventario, fetchInventario } = useInventarioAPI();
  const { pedidos, fetchPedidos, loading: loadingPedidos } = usePedidosAPI();
  const [pedidosPendientes, setPedidosPendientes] = useState(0);
  const [stockBajo, setStockBajo] = useState(0);
  const [ventasSemana, setVentasSemana] = useState(0);
  const [cambioSemana, setCambioSemana] = useState(0);
  const [actividadReciente, setActividadReciente] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [datosCargados, setDatosCargados] = useState(false);
  const [pedidosCargados, setPedidosCargados] = useState<any[]>([]);
  const [ventasPorDia, setVentasPorDia] = useState<Array<{dia: string, ventas: number}>>([]);

  // Cargar tiendas cuando el perfil esté disponible
  useEffect(() => {
    console.log('🔍 Dashboard montado, verificando perfil...', { 
      tienePerfil: !!perfil, 
      datosCargados,
      perfilEmail: perfil?.email 
    });
    
    if (perfil && !datosCargados) {
      console.log('✅ Perfil disponible, iniciando carga de tiendas...');
      setDatosCargados(true);
      setLoading(true);
      fetchTiendas().catch(err => {
        console.error('❌ Error cargando tiendas:', err);
        setLoading(false);
      });
    }
  }, [perfil, datosCargados, fetchTiendas]);

  // Cargar métricas cuando las tiendas estén disponibles
  const cargarMetricas = useCallback(async () => {
    console.log('📈 cargarMetricas INICIADO');
    try {
      if (!tiendas || tiendas.length === 0) {
        console.warn('⚠️ No hay tiendas disponibles para cargar métricas');
        // Establecer valores por defecto
        setPedidosPendientes(0);
        setStockBajo(0);
        setVentasSemana(0);
        setCambioSemana(0);
        setActividadReciente([]);
        return;
      }

      const tiendaId = tiendas[0].id_tienda;
      console.log('✅ Usando tienda:', tiendaId);
      console.log('📋 Tiendas disponibles:', tiendas.map(t => ({ id: t.id_tienda, nombre: t.nombre_tienda })));
      
      if (tiendas.length > 1) {
        console.warn(`⚠️ El usuario tiene ${tiendas.length} tiendas. Usando la primera (id: ${tiendaId})`);
      }

      // Cargar inventario y pedidos en paralelo
      const [inventarioResult, pedidosResult] = await Promise.all([
        fetchInventario(tiendaId),
        fetchPedidos()
      ]);
      
      // Guardar los pedidos cargados en un estado local para asegurar que estén disponibles
      if (pedidosResult && pedidosResult.length > 0) {
        console.log('💾 Guardando', pedidosResult.length, 'pedidos en estado local');
        // Mostrar distribución de pedidos por tienda
        const pedidosPorTienda = pedidosResult.reduce((acc, p) => {
          acc[p.id_tienda] = (acc[p.id_tienda] || 0) + 1;
          return acc;
        }, {} as Record<number, number>);
        console.log('📊 Distribución de pedidos por tienda:', pedidosPorTienda);
        console.log('🔍 Primeros 3 pedidos:', pedidosResult.slice(0, 3).map(p => ({
          id: p.id_pedido,
          id_tienda: p.id_tienda,
          estado: p.estado,
          total: p.total,
          fecha: p.fecha_pedido
        })));
        setPedidosCargados(pedidosResult);
      } else {
        setPedidosCargados([]);
      }
      
      console.log('✅ cargarMetricas COMPLETADO', {
        inventarioItems: inventario.length,
        pedidosItems: pedidos.length,
        pedidosResult: pedidosResult?.length || 0,
        pedidosCargados: pedidosCargados.length,
        pedidosData: pedidosResult?.slice(0, 3).map(p => ({
          id: p.id_pedido,
          tienda: p.id_tienda,
          estado: p.estado,
          total: p.total
        })) || []
      });
    } catch (error) {
      console.error('❌ Error cargando métricas:', error);
      console.error('❌ Stack trace:', error instanceof Error ? error.stack : 'N/A');
      // Establecer valores por defecto en caso de error
      setPedidosPendientes(0);
      setStockBajo(0);
      setVentasSemana(0);
      setCambioSemana(0);
      setActividadReciente([]);
    }
  }, [tiendas, fetchInventario, fetchPedidos]);

  useEffect(() => {
    console.log('🔍 Verificando condiciones para cargar métricas...', {
      loadingTiendas,
      tiendasLength: tiendas.length,
      datosCargados,
      tieneTiendas: tiendas.length > 0
    });
    
    if (!loadingTiendas && tiendas.length > 0 && datosCargados) {
      console.log('✅ Tiendas cargadas, cargando métricas...');
      cargarMetricas().finally(() => {
        setLoading(false);
      });
    } else if (!loadingTiendas && datosCargados) {
      // Si no hay tiendas pero ya se intentó cargar, dejar de mostrar loading
      console.log('⚠️ No hay tiendas disponibles');
      setLoading(false);
    }
  }, [tiendas, loadingTiendas, datosCargados, cargarMetricas]);

  // Calcular métricas cuando se actualicen los datos
  useEffect(() => {
    // Usar pedidos del hook o los pedidos cargados localmente
    const pedidosParaCalcular = pedidos.length > 0 ? pedidos : pedidosCargados;
    
    console.log('📊 Calculando métricas...', {
      tiendasLength: tiendas.length,
      inventarioLength: inventario.length,
      pedidosLength: pedidos.length,
      pedidosCargadosLength: pedidosCargados.length,
      pedidosParaCalcularLength: pedidosParaCalcular.length,
      pedidosData: pedidosParaCalcular.length > 0 ? pedidosParaCalcular.slice(0, 2).map(p => ({
        id: p.id_pedido,
        tienda: p.id_tienda,
        estado: p.estado,
        total: p.total,
        fecha: p.fecha_pedido
      })) : 'sin pedidos'
    });

    if (tiendas.length === 0) {
      console.log('⚠️ No hay tiendas, reseteando métricas');
      setPedidosPendientes(0);
      setStockBajo(0);
      setVentasSemana(0);
      setCambioSemana(0);
      setActividadReciente([]);
      return;
    }

    // Obtener IDs de todas las tiendas del usuario
    const tiendasIds = tiendas.map(t => t.id_tienda);
    const tiendaId = tiendas[0].id_tienda; // Para stock bajo, usar la primera
    console.log('🏪 Calculando métricas para tiendas:', tiendasIds);
    console.log('📋 Tiendas disponibles:', tiendas.map(t => ({ id: t.id_tienda, nombre: t.nombre_tienda })));

    // Calcular stock bajo (solo para la primera tienda por ahora)
    let stockBajoCount = 0;
    if (inventario.length > 0) {
      stockBajoCount = inventario.filter(item => item.id_tienda === tiendaId && item.stock < 10).length;
      console.log('📦 Stock bajo para tienda', tiendaId, ':', stockBajoCount);
      setStockBajo(stockBajoCount);
    } else {
      setStockBajo(0);
    }

    // Calcular pedidos pendientes (estado pendiente o confirmado) - PARA TODAS LAS TIENDAS
    let pedidosPendientesCount = 0;
    let ventasEstaSemana = 0;
    let ventasSemanaAnterior = 0;
    let pedidosRecientes: any[] = [];
    if (pedidosParaCalcular.length > 0) {
      console.log('📋 Total de pedidos recibidos:', pedidosParaCalcular.length);
      console.log('🔍 Analizando pedidos:', pedidosParaCalcular.slice(0, 3).map(p => ({
        id: p.id_pedido,
        id_tienda: p.id_tienda,
        esTiendaDelUsuario: tiendasIds.includes(p.id_tienda),
        estado: p.estado,
        estadoLower: (p.estado || '').toLowerCase()
      })));
      
      const pedidosFiltrados = pedidosParaCalcular.filter(p => {
        const matchTienda = tiendasIds.includes(p.id_tienda); // Verificar si el pedido es de alguna tienda del usuario
        const estado = (p.estado || '').toLowerCase();
        const matchEstado = estado === 'pendiente' || estado === 'confirmado';
        const resultado = matchTienda && matchEstado;
        if (matchTienda) {
          console.log(`  ✓ Pedido #${p.id_pedido}: tienda=${p.id_tienda} (match=${matchTienda}), estado=${estado}, matchEstado=${matchEstado}, resultado=${resultado}`);
        }
        return resultado;
      });
      pedidosPendientesCount = pedidosFiltrados.length;
      console.log('⏳ Pedidos pendientes:', pedidosPendientesCount, 'de', pedidosParaCalcular.length, 'total');
      setPedidosPendientes(pedidosPendientesCount);
      console.log('✅ Estado actualizado: pedidosPendientes =', pedidosPendientesCount);
    } else {
      console.log('⚠️ No hay pedidos disponibles');
      setPedidosPendientes(0);
    }

    // Calcular ventas de los últimos 7 días
    if (pedidosParaCalcular.length > 0) {
      const ahora = new Date();
      const hace7Dias = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000);
      const hace14Dias = new Date(ahora.getTime() - 14 * 24 * 60 * 60 * 1000);

      console.log('📅 Fechas:', {
        ahora: ahora.toISOString(),
        hace7Dias: hace7Dias.toISOString(),
        hace14Dias: hace14Dias.toISOString()
      });

      // Ventas de esta semana (últimos 7 días) - PARA TODAS LAS TIENDAS
      const pedidosEstaSemana = pedidosParaCalcular.filter(p => {
        if (!tiendasIds.includes(p.id_tienda)) return false; // Verificar si el pedido es de alguna tienda del usuario
        try {
          const fechaPedido = new Date(p.fecha_pedido);
          const estado = (p.estado || '').toLowerCase();
          const esValido = fechaPedido >= hace7Dias && 
                         (estado === 'entregado' || estado === 'confirmado');
          if (tiendasIds.includes(p.id_tienda)) {
            console.log(`  📅 Pedido #${p.id_pedido}: tienda=${p.id_tienda}, fecha=${fechaPedido.toISOString()}, estado=${estado}, esValido=${esValido}`);
          }
          return esValido;
        } catch (e) {
          console.warn('⚠️ Error parseando fecha del pedido:', p.id_pedido, e);
          return false;
        }
      });
      ventasEstaSemana = pedidosEstaSemana.reduce((sum, p) => sum + (Number(p.total) || 0), 0);
      console.log('💰 Ventas esta semana:', ventasEstaSemana, 'de', pedidosEstaSemana.length, 'pedidos');
      setVentasSemana(ventasEstaSemana);
      console.log('✅ Estado actualizado: ventasSemana =', ventasEstaSemana);

      // Calcular ventas por día de los últimos 7 días
      const ventasPorDiaArray: Array<{dia: string, ventas: number}> = [];
      const nombresDias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      
      for (let i = 6; i >= 0; i--) {
        const fecha = new Date(ahora.getTime() - i * 24 * 60 * 60 * 1000);
        const inicioDia = new Date(fecha);
        inicioDia.setHours(0, 0, 0, 0);
        const finDia = new Date(fecha);
        finDia.setHours(23, 59, 59, 999);
        
        const ventasDelDia = pedidosEstaSemana
          .filter(p => {
            try {
              const fechaPedido = new Date(p.fecha_pedido);
              return fechaPedido >= inicioDia && fechaPedido <= finDia;
            } catch {
              return false;
            }
          })
          .reduce((sum, p) => sum + (Number(p.total) || 0), 0);
        
        ventasPorDiaArray.push({
          dia: nombresDias[fecha.getDay()],
          ventas: ventasDelDia
        });
      }
      
      setVentasPorDia(ventasPorDiaArray);
      console.log('📊 Ventas por día:', ventasPorDiaArray);

      // Ventas de la semana anterior (días 8-14) - PARA TODAS LAS TIENDAS
      const pedidosSemanaAnterior = pedidosParaCalcular.filter(p => {
        if (!tiendasIds.includes(p.id_tienda)) return false; // Verificar si el pedido es de alguna tienda del usuario
        try {
          const fechaPedido = new Date(p.fecha_pedido);
          const estado = (p.estado || '').toLowerCase();
          const esValido = fechaPedido >= hace14Dias && fechaPedido < hace7Dias &&
                          (estado === 'entregado' || estado === 'confirmado');
          return esValido;
        } catch (e) {
          return false;
        }
      });
      ventasSemanaAnterior = pedidosSemanaAnterior.reduce((sum, p) => sum + (Number(p.total) || 0), 0);
      console.log('💰 Ventas semana anterior:', ventasSemanaAnterior, 'de', pedidosSemanaAnterior.length, 'pedidos');

      // Calcular cambio porcentual
      if (ventasSemanaAnterior > 0) {
        const cambio = ((ventasEstaSemana - ventasSemanaAnterior) / ventasSemanaAnterior) * 100;
        console.log('📈 Cambio porcentual:', cambio);
        setCambioSemana(cambio);
      } else if (ventasEstaSemana > 0) {
        console.log('📈 Primera semana con ventas (100% aumento)');
        setCambioSemana(100);
      } else {
        setCambioSemana(0);
      }

      // Actividad reciente: últimos 5 pedidos ordenados por fecha - PARA TODAS LAS TIENDAS
      const pedidosDeTiendas = pedidosParaCalcular.filter(p => tiendasIds.includes(p.id_tienda));
      console.log('🔍 Pedidos de las tiendas del usuario:', pedidosDeTiendas.length, 'de', pedidosParaCalcular.length, 'total');
      console.log('📋 IDs de tiendas en pedidos:', [...new Set(pedidosParaCalcular.map(p => p.id_tienda))]);
      console.log('📋 IDs de tiendas del usuario:', tiendasIds);
      
      pedidosRecientes = pedidosDeTiendas
        .sort((a, b) => {
          try {
            const fechaA = new Date(a.fecha_pedido).getTime();
            const fechaB = new Date(b.fecha_pedido).getTime();
            return fechaB - fechaA; // Más recientes primero
          } catch (e) {
            return 0;
          }
        })
        .slice(0, 5);
      
      console.log('📋 Actividad reciente:', pedidosRecientes.length, 'pedidos');
      console.log('📋 Detalles actividad:', pedidosRecientes.map(p => ({
        id: p.id_pedido,
        tienda: p.id_tienda,
        estado: p.estado,
        total: p.total,
        fecha: p.fecha_pedido
      })));
      setActividadReciente(pedidosRecientes);
      console.log('✅ Estado actualizado: actividadReciente =', pedidosRecientes.length, 'items');
      
      // Log final con resumen de todas las métricas
      console.log('📊 RESUMEN FINAL DE MÉTRICAS:', {
        pedidosPendientes: pedidosPendientesCount,
        stockBajo: inventario.length > 0 ? inventario.filter(item => item.id_tienda === tiendaId && item.stock < 10).length : 0,
        ventasSemana: ventasEstaSemana,
        cambioSemana: ventasSemanaAnterior > 0 
          ? ((ventasEstaSemana - ventasSemanaAnterior) / ventasSemanaAnterior) * 100 
          : (ventasEstaSemana > 0 ? 100 : 0),
        actividadReciente: pedidosRecientes.length
      });
    } else {
      setVentasSemana(0);
      setCambioSemana(0);
      setActividadReciente([]);
    }
  }, [inventario, tiendas, pedidos, pedidosCargados]);

  const renderActividad = (item: any, index: number) => {
    let icon = 'shopping-cart';
    let color = '#4CAF50';
    let texto = '';
    let tiempo = '';

    const estado = item.estado?.toLowerCase() || '';
    
    if (estado === 'pendiente') {
      icon = 'shopping-cart';
      color = '#FF9800';
      texto = `Pedido #${item.id_pedido} - Pendiente`;
    } else if (estado === 'confirmado') {
      icon = 'check-circle';
      color = '#4CAF50';
      texto = `Pedido #${item.id_pedido} - Confirmado`;
    } else if (estado === 'entregado') {
      icon = 'local-shipping';
      color = '#2196F3';
      texto = `Pedido #${item.id_pedido} - Entregado`;
    } else if (estado === 'cancelado') {
      icon = 'cancel';
      color = '#F44336';
      texto = `Pedido #${item.id_pedido} - Cancelado`;
    } else {
      icon = 'shopping-cart';
      color = '#9E9E9E';
      texto = `Pedido #${item.id_pedido} - ${estado}`;
    }

    const fecha = new Date(item.fecha_pedido);
    const ahora = new Date();
    const diffMs = ahora.getTime() - fecha.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) {
      tiempo = 'Hace unos momentos';
    } else if (diffMins < 60) {
      tiempo = `Hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
    } else if (diffHours < 24) {
      tiempo = `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    } else if (diffDays === 1) {
      tiempo = 'Ayer';
    } else {
      tiempo = `Hace ${diffDays} días`;
    }

    return (
      <TouchableOpacity 
        key={index} 
        style={styles.actividadItem}
        onPress={() => {
          // Navegar al detalle del pedido si existe esa pantalla
          (navigation as any).navigate('Pedidos');
        }}
      >
        <View style={[styles.actividadIcon, { backgroundColor: color }]}>
          <MaterialIcons name={icon as any} size={20} color="#FFFFFF" />
        </View>
        <View style={styles.actividadContent}>
          <Text style={styles.actividadTexto}>{texto}</Text>
          <View style={styles.actividadInfo}>
          <Text style={styles.actividadTiempo}>{tiempo}</Text>
            <Text style={styles.actividadMonto}>${(item.total || 0).toFixed(2)}</Text>
          </View>
        </View>
        <MaterialIcons name="chevron-right" size={24} color="#9E9E9E" />
      </TouchableOpacity>
    );
  };

  // Mostrar loading solo si está cargando inicialmente
  // Permitir mostrar el dashboard incluso si no hay tiendas (el usuario puede crear una)
  if (loading && !datosCargados) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Cargando dashboard...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.logoContainer}>
              <MaterialIcons name="store" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.headerTitle}>Mi Tienda</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={async () => {
                console.log('🔄 Recargando datos manualmente...');
                setLoading(true);
                if (tiendas.length > 0) {
                  await cargarMetricas();
                }
                setLoading(false);
              }}
            >
              <MaterialIcons name="refresh" size={24} color="#000000" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.notificationButton}
              onPress={() => (navigation as any).navigate('Pedidos')}
            >
            <MaterialIcons name="notifications" size={24} color="#000000" />
              {pedidosPendientes > 0 && (
            <View style={styles.notificationBadge}>
                  <Text style={styles.notificationText}>
                    {pedidosPendientes > 99 ? '99+' : pedidosPendientes}
                  </Text>
            </View>
              )}
          </TouchableOpacity>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => (navigation as any).navigate('GestionProductos')}
          >
            <MaterialIcons name="add" size={24} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>+ Añadir Producto</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonSecondary]}
            onPress={() => {
              // Navegar al tab de Pedidos
              (navigation as any).navigate('Pedidos');
            }}
          >
            <MaterialIcons name="local-shipping" size={24} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Ver Pedidos</Text>
          </TouchableOpacity>
        </View>

        {/* Metrics Cards */}
        <View style={styles.metricsContainer}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Pedidos Pendientes</Text>
            <Text style={styles.metricValue}>{pedidosPendientes}</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Stock Bajo</Text>
            <Text style={styles.metricValue}>{stockBajo}</Text>
          </View>
        </View>

        {/* Sales Summary */}
        <View style={styles.salesCard}>
          <Text style={styles.salesTitle}>Resumen de Ventas (Últimos 7 días)</Text>
          <Text style={styles.salesTotal}>${ventasSemana.toFixed(2)}</Text>
          <Text style={[
            styles.salesChange,
            cambioSemana < 0 && styles.salesChangeNegative
          ]}>
            Esta Semana {cambioSemana >= 0 ? '+' : ''}{cambioSemana.toFixed(1)}%
          </Text>
          {/* Gráfico de ventas */}
          <View style={styles.chartContainer}>
            {ventasPorDia.length > 0 ? (
              <View style={styles.chartBars}>
                {ventasPorDia.map((item, index) => {
                  const maxVenta = Math.max(...ventasPorDia.map(v => v.ventas), 1);
                  const alturaPorcentaje = maxVenta > 0 ? (item.ventas / maxVenta) : 0;
                  const alturaPixeles = Math.max(alturaPorcentaje * 100, item.ventas > 0 ? 4 : 0);
                  
                  return (
                    <View key={index} style={styles.chartBarContainer}>
                      <View style={styles.chartBarWrapper}>
                        <View 
                          style={[
                            styles.chartBar, 
                            { height: alturaPixeles }
                          ]} 
                        />
                      </View>
                      <Text style={styles.chartBarLabel}>{item.dia}</Text>
                      <Text style={styles.chartBarValue}>
                        ${item.ventas.toFixed(0)}
                      </Text>
                    </View>
                  );
                })}
              </View>
            ) : (
              <View style={styles.chartPlaceholder}>
                <Text style={styles.chartText}>No hay datos de ventas</Text>
              </View>
            )}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.activitySection}>
          <Text style={styles.sectionTitle}>Actividad Reciente</Text>
          {actividadReciente.length > 0 ? (
            actividadReciente.map((item, index) => renderActividad(item, index))
          ) : (
            <Text style={styles.emptyText}>No hay actividad reciente</Text>
          )}
        </View>

        {/* Gestión Rápida */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Gestión Rápida</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => (navigation as any).navigate('GestionInventario')}
            >
              <MaterialIcons name="inventory" size={32} color="#4CAF50" />
              <Text style={styles.quickActionText}>Inventario</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => (navigation as any).navigate('GestionTienda')}
            >
              <MaterialIcons name="store" size={32} color="#4CAF50" />
              <Text style={styles.quickActionText}>Mi Tienda</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => (navigation as any).navigate('GestionCategorias')}
            >
              <MaterialIcons name="category" size={32} color="#4CAF50" />
              <Text style={styles.quickActionText}>Categorías</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  refreshButton: {
    padding: 4,
  },
  logoContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  notificationButton: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionButtonSecondary: {
    backgroundColor: '#66BB6A',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  metricsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
  },
  salesCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  salesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  salesTotal: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  salesChange: {
    fontSize: 14,
    color: '#4CAF50',
    marginBottom: 16,
  },
  salesChangeNegative: {
    color: '#F44336',
  },
  chartContainer: {
    height: 180,
    marginTop: 8,
  },
  chartPlaceholder: {
    height: 150,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartText: {
    color: '#999999',
    fontSize: 14,
  },
  chartBars: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 120,
    paddingHorizontal: 8,
  },
  chartBarContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginHorizontal: 4,
  },
  chartBarWrapper: {
    width: '100%',
    height: 100,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 4,
  },
  chartBar: {
    width: '70%',
    minHeight: 2,
    backgroundColor: '#4CAF50',
    borderRadius: 4,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  chartBarLabel: {
    fontSize: 11,
    color: '#666666',
    marginTop: 4,
    fontWeight: '500',
  },
  chartBarValue: {
    fontSize: 10,
    color: '#4CAF50',
    marginTop: 2,
    fontWeight: '600',
  },
  activitySection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  actividadItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actividadIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actividadContent: {
    flex: 1,
  },
  actividadTexto: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  actividadInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actividadTiempo: {
    fontSize: 12,
    color: '#666666',
  },
  actividadMonto: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4CAF50',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999999',
    marginTop: 20,
    fontSize: 14,
  },
  quickActionsSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginTop: 8,
  },
});

export default DashboardTienderoScreen;

