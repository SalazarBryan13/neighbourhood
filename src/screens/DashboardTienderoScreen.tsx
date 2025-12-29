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

const DashboardTienderoScreen: React.FC = () => {
  const navigation = useNavigation();
  const { perfil } = usePerfilUsuario();
  const { tiendas, fetchTiendas, loading: loadingTiendas } = useTiendasAPI();
  const { inventario, fetchInventario } = useInventarioAPI();
  const [pedidosPendientes, setPedidosPendientes] = useState(0);
  const [stockBajo, setStockBajo] = useState(0);
  const [ventasSemana, setVentasSemana] = useState(0);
  const [cambioSemana, setCambioSemana] = useState(0);
  const [actividadReciente, setActividadReciente] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [datosCargados, setDatosCargados] = useState(false);

  // Cargar tiendas cuando el perfil esté disponible
  useEffect(() => {
    if (perfil && !datosCargados) {
      console.log('✅ Perfil disponible, iniciando carga de tiendas...');
      setDatosCargados(true);
      setLoading(true);
      fetchTiendas().catch(err => {
        console.error('❌ Error cargando tiendas:', err);
        setLoading(false);
      });
    }
  }, [perfil, datosCargados]);

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
      
      if (tiendas.length > 1) {
        console.warn(`⚠️ El usuario tiene ${tiendas.length} tiendas. Usando la primera (id: ${tiendaId})`);
      }

      // Cargar inventario
      await fetchInventario(tiendaId);
      
      // Nota: Las métricas de pedidos y ventas requieren endpoints adicionales en la API
      // Por ahora, las dejamos en 0 o valores simulados
      setPedidosPendientes(0);
      setVentasSemana(0);
      setCambioSemana(0);
      setActividadReciente([]);
      
      console.log('✅ cargarMetricas COMPLETADO');
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
  }, [tiendas, fetchInventario]);

  useEffect(() => {
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

  // Calcular stock bajo cuando el inventario se actualice
  useEffect(() => {
    if (tiendas.length > 0 && inventario.length > 0) {
      const tiendaId = tiendas[0].id_tienda;
      const stockBajoCount = inventario.filter(item => item.id_tienda === tiendaId && item.stock < 10).length;
      setStockBajo(stockBajoCount);
    }
  }, [inventario, tiendas]);

  const renderActividad = (item: any, index: number) => {
    let icon = 'shopping-cart';
    let color = '#4CAF50';
    let texto = '';
    let tiempo = '';

    if (item.estado === 'pendiente' || item.estado === 'confirmado') {
      icon = 'shopping-cart';
      color = '#4CAF50';
      const nombreUsuario = item.usuario
        ? `${item.usuario.nombre} ${item.usuario.apellido}`
        : 'Cliente';
      texto = `Nuevo pedido de ${nombreUsuario}`;
    } else if (item.estado === 'entregado') {
      icon = 'check-circle';
      color = '#2196F3';
      texto = `Pedido #${item.id_pedido} entregado`;
    }

    const fecha = new Date(item.fecha_pedido);
    const ahora = new Date();
    const diffMs = ahora.getTime() - fecha.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      tiempo = `Hace ${diffMins} minutos`;
    } else if (diffHours < 24) {
      tiempo = `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    } else if (diffDays === 1) {
      tiempo = 'Ayer';
    } else {
      tiempo = `Hace ${diffDays} días`;
    }

    return (
      <TouchableOpacity key={index} style={styles.actividadItem}>
        <View style={[styles.actividadIcon, { backgroundColor: color }]}>
          <MaterialIcons name={icon as any} size={20} color="#FFFFFF" />
        </View>
        <View style={styles.actividadContent}>
          <Text style={styles.actividadTexto}>{texto}</Text>
          <Text style={styles.actividadTiempo}>{tiempo}</Text>
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
          <TouchableOpacity style={styles.notificationButton}>
            <MaterialIcons name="notifications" size={24} color="#000000" />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationText}>2</Text>
            </View>
          </TouchableOpacity>
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
          <Text style={styles.salesChange}>Esta Semana +{cambioSemana.toFixed(1)}%</Text>
          {/* Placeholder para gráfico */}
          <View style={styles.chartPlaceholder}>
            <Text style={styles.chartText}>Gráfico de ventas</Text>
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
    color: '#000000',
    marginBottom: 4,
  },
  actividadTiempo: {
    fontSize: 12,
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

