import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Modal,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { usePedidosAPI } from '../hooks/usePedidosAPI';

const PedidosTienderoScreen: React.FC = () => {
  const navigation = useNavigation();
  const { pedidos, loading, fetchPedidos, fetchPedidosPorEstado, actualizarEstadoPedido } = usePedidosAPI();
  const [estadoFiltro, setEstadoFiltro] = useState<string>('pendiente');

  const cargarPedidos = useCallback(async () => {
    if (estadoFiltro === 'todos') {
      await fetchPedidos();
    } else {
      await fetchPedidosPorEstado(estadoFiltro);
    }
  }, [estadoFiltro, fetchPedidos, fetchPedidosPorEstado]);

  useEffect(() => {
    // Cargar pedidos cuando cambie el filtro o al montar el componente
    cargarPedidos();
  }, [cargarPedidos]);

  const handleActualizarEstado = async (id_pedido: number, nuevoEstado: string) => {
    console.log(`🔄 Actualizando pedido ${id_pedido} a estado: ${nuevoEstado}`);
    const resultado = await actualizarEstadoPedido(id_pedido, nuevoEstado);
    if (resultado) {
      console.log(`✅ Pedido ${id_pedido} actualizado exitosamente`);
      // Recargar pedidos para reflejar el cambio
      await cargarPedidos();
    } else {
      console.error(`❌ Error al actualizar pedido ${id_pedido}`);
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado?.toLowerCase()) {
      case 'pendiente':
        return '#FF9800';
      case 'confirmado':
        return '#2196F3';
      case 'en_camino':
        return '#9C27B0';
      case 'entregado':
        return '#4CAF50';
      case 'cancelado':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const estadosDisponibles = [
    { value: 'pendiente', label: 'Pendiente', color: '#FF9800' },
    { value: 'confirmado', label: 'Confirmado', color: '#2196F3' },
    { value: 'entregado', label: 'Entregado', color: '#4CAF50' },
    { value: 'cancelado', label: 'Cancelado', color: '#F44336' },
  ];

  const [selectorAbierto, setSelectorAbierto] = useState<number | null>(null);
  const [estadoSeleccionado, setEstadoSeleccionado] = useState<string>('');

  const abrirSelector = (pedidoId: number, estadoActual: string) => {
    setEstadoSeleccionado(estadoActual);
    setSelectorAbierto(pedidoId);
  };

  const cerrarSelector = () => {
    setSelectorAbierto(null);
    setEstadoSeleccionado('');
  };

  const aplicarEstado = async (pedidoId: number, nuevoEstado: string) => {
    const pedido = pedidos.find(p => p.id_pedido === pedidoId);
    const estadoActual = pedido?.estado?.toLowerCase() || 'pendiente';
    
    if (nuevoEstado !== estadoActual) {
      await handleActualizarEstado(pedidoId, nuevoEstado);
    }
    cerrarSelector();
  };

  const formatearFecha = (fecha: string | null | undefined) => {
    if (!fecha) return 'N/A';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatearHora = (fecha: string | null | undefined) => {
    if (!fecha) return '';
    const date = new Date(fecha);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderFilaPedido = (item: any, index: number) => {
    const estadoActual = item.estado?.toLowerCase() || 'pendiente';
    const fechaPedido = new Date(item.fecha_pedido);

    return (
      <TouchableOpacity
        key={item.id_pedido}
        style={[styles.filaCard, index % 2 === 0 && styles.filaCardPar]}
        onPress={() => {
          (navigation as any).navigate('DetallePedido', {
            pedidoId: item.id_pedido,
            pedido: item,
          });
        }}
        activeOpacity={0.7}
      >
        {/* Header de la fila con ID y Estado */}
        <View style={styles.filaHeader}>
          <View style={styles.filaHeaderLeft}>
            <MaterialIcons name="receipt" size={20} color="#4CAF50" />
            <Text style={styles.filaId}>Pedido #{item.id_pedido}</Text>
          </View>
          <TouchableOpacity
            style={[
              styles.estadoBadge,
              { backgroundColor: getEstadoColor(item.estado) },
            ]}
            onPress={(e) => {
              e.stopPropagation();
              abrirSelector(item.id_pedido, estadoActual);
            }}
          >
            <Text style={styles.estadoText}>
              {estadosDisponibles.find(e => e.value === estadoActual)?.label || item.estado}
            </Text>
            <MaterialIcons name="arrow-drop-down" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Información detallada en grid */}
        <View style={styles.filaInfoGrid}>
          {/* Fecha y Hora */}
          <View style={styles.filaInfoItem}>
            <View style={styles.filaInfoIcon}>
              <MaterialIcons name="calendar-today" size={16} color="#666666" />
            </View>
            <View style={styles.filaInfoContent}>
              <Text style={styles.filaInfoLabel}>Fecha</Text>
              <Text style={styles.filaInfoValue}>
                {formatearFecha(item.fecha_pedido)}
              </Text>
              <Text style={styles.filaInfoSubValue}>
                {formatearHora(item.fecha_pedido)}
              </Text>
            </View>
          </View>

          {/* Total */}
          <View style={styles.filaInfoItem}>
            <View style={styles.filaInfoIcon}>
              <MaterialIcons name="attach-money" size={16} color="#4CAF50" />
            </View>
            <View style={styles.filaInfoContent}>
              <Text style={styles.filaInfoLabel}>Total</Text>
              <Text style={styles.filaInfoValueBold}>
                ${item.total?.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* Dirección del cliente */}
        {item.direccion && (
          <View style={styles.filaDireccion}>
            <MaterialIcons name="location-on" size={16} color="#66BB6A" />
            <Text style={styles.filaDireccionTexto} numberOfLines={2}>
              {item.direccion.direccion}
              {item.direccion.referencia && ` - ${item.direccion.referencia}`}
            </Text>
          </View>
        )}

        {/* Observaciones si existen */}
        {item.observaciones && (
          <View style={styles.filaObservaciones}>
            <MaterialIcons name="note" size={14} color="#FF9800" />
            <Text style={styles.filaObservacionesTexto} numberOfLines={2}>
              {item.observaciones}
            </Text>
          </View>
        )}

        {/* Acción rápida */}
        <View style={styles.filaAccion}>
          <Text style={styles.filaAccionTexto}>Toca para ver detalles</Text>
          <MaterialIcons name="chevron-right" size={20} color="#4CAF50" />
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pedidos</Text>
        <TouchableOpacity onPress={cargarPedidos}>
          <MaterialIcons name="refresh" size={24} color="#000000" />
        </TouchableOpacity>
      </View>

      {/* Filtros por estado */}
      <View style={styles.filtrosContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtrosContent}>
          <TouchableOpacity
            style={[
              styles.filtroChip,
              estadoFiltro === 'pendiente' && styles.filtroChipActive,
            ]}
            onPress={() => setEstadoFiltro('pendiente')}
          >
            <Text
              style={[
                styles.filtroChipText,
                estadoFiltro === 'pendiente' && styles.filtroChipTextActive,
              ]}
            >
              Pendientes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filtroChip,
              estadoFiltro === 'confirmado' && styles.filtroChipActive,
            ]}
            onPress={() => setEstadoFiltro('confirmado')}
          >
            <Text
              style={[
                styles.filtroChipText,
                estadoFiltro === 'confirmado' && styles.filtroChipTextActive,
              ]}
            >
              Confirmados
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filtroChip,
              estadoFiltro === 'entregado' && styles.filtroChipActive,
            ]}
            onPress={() => setEstadoFiltro('entregado')}
          >
            <Text
              style={[
                styles.filtroChipText,
                estadoFiltro === 'entregado' && styles.filtroChipTextActive,
              ]}
            >
              Entregados
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filtroChip,
              estadoFiltro === 'cancelado' && styles.filtroChipActive,
            ]}
            onPress={() => setEstadoFiltro('cancelado')}
          >
            <Text
              style={[
                styles.filtroChipText,
                estadoFiltro === 'cancelado' && styles.filtroChipTextActive,
              ]}
            >
              Cancelados
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filtroChip,
              estadoFiltro === 'todos' && styles.filtroChipActive,
            ]}
            onPress={() => setEstadoFiltro('todos')}
          >
            <Text
              style={[
                styles.filtroChipText,
                estadoFiltro === 'todos' && styles.filtroChipTextActive,
              ]}
            >
              Todos
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={true}
        contentContainerStyle={styles.scrollContent}
      >
        {pedidos.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="receipt" size={64} color="#CCCCCC" />
            <Text style={styles.emptyText}>
              No hay pedidos {estadoFiltro !== 'todos' ? estadoFiltro : ''}
            </Text>
          </View>
        ) : (
          <View style={styles.pedidosContainer}>
            {pedidos.map((item, index) => renderFilaPedido(item, index))}
          </View>
        )}
      </ScrollView>

      {/* Modal para selector de estado */}
      <Modal
        visible={selectorAbierto !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={cerrarSelector}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={cerrarSelector}
        >
          <View style={styles.modalSelectorContainer}>
            <View style={styles.modalSelectorHeader}>
              <Text style={styles.modalSelectorTitle}>Cambiar Estado</Text>
              <TouchableOpacity onPress={cerrarSelector}>
                <MaterialIcons name="close" size={24} color="#666666" />
              </TouchableOpacity>
            </View>
            {selectorAbierto && pedidos.find(p => p.id_pedido === selectorAbierto) && (
              <>
                {estadosDisponibles.map((estado) => {
                  const pedidoActual = pedidos.find(p => p.id_pedido === selectorAbierto);
                  const estadoActual = pedidoActual?.estado?.toLowerCase() || 'pendiente';
                  const esActivo = estadoActual === estado.value;
                  
                  return (
                    <TouchableOpacity
                      key={estado.value}
                      style={[
                        styles.modalOpcionEstado,
                        esActivo && styles.modalOpcionEstadoActiva,
                        { borderLeftColor: estado.color },
                      ]}
                      onPress={() => aplicarEstado(selectorAbierto, estado.value)}
                    >
                      <View style={[styles.modalIndicadorEstado, { backgroundColor: estado.color }]} />
                      <Text
                        style={[
                          styles.modalOpcionEstadoTexto,
                          esActivo && styles.modalOpcionEstadoTextoActiva,
                        ]}
                      >
                        {estado.label}
                      </Text>
                      {esActivo && (
                        <MaterialIcons name="check" size={20} color={estado.color} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  pedidosContainer: {
    gap: 12,
  },
  filaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filaCardPar: {
    backgroundColor: '#FAFAFA',
  },
  filaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filaHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filaId: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212121',
  },
  filaInfoGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  filaInfoItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  filaInfoIcon: {
    marginTop: 2,
  },
  filaInfoContent: {
    flex: 1,
  },
  filaInfoLabel: {
    fontSize: 11,
    color: '#9E9E9E',
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 4,
  },
  filaInfoValue: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
  },
  filaInfoSubValue: {
    fontSize: 12,
    color: '#757575',
    marginTop: 2,
  },
  filaInfoValueBold: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '700',
  },
  filaObservaciones: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    backgroundColor: '#FFF9E6',
    padding: 10,
    borderRadius: 8,
  },
  filaObservacionesTexto: {
    flex: 1,
    fontSize: 13,
    color: '#666666',
    fontStyle: 'italic',
  },
  filaAccion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  filaAccionTexto: {
    fontSize: 12,
    color: '#9E9E9E',
    fontStyle: 'italic',
  },
  filaDireccion: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    backgroundColor: '#E8F5E9',
    padding: 10,
    borderRadius: 8,
  },
  filaDireccionTexto: {
    flex: 1,
    fontSize: 13,
    color: '#666666',
    fontWeight: '500',
  },
  estadoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 4,
  },
  estadoText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalSelectorContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalSelectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalSelectorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
  },
  modalOpcionEstado: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderLeftWidth: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    gap: 12,
  },
  modalOpcionEstadoActiva: {
    backgroundColor: '#F5F5F5',
  },
  modalIndicadorEstado: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  modalOpcionEstadoTexto: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
  },
  modalOpcionEstadoTextoActiva: {
    fontWeight: '700',
    color: '#000000',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999999',
    marginTop: 16,
  },
  filtrosContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingVertical: 12,
  },
  filtrosContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filtroChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginRight: 8,
  },
  filtroChipActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  filtroChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
  },
  filtroChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default PedidosTienderoScreen;

