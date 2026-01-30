import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { usePedidos } from '../hooks/usePedidos';

interface RouteParams {
  pedidoId: number;
  pedido: any;
}

const DetallePedidoScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { pedidoId, pedido: pedidoParam } = (route.params as RouteParams) || {};
  const { obtenerProductosPedido, loading } = usePedidos();
  
  const [productos, setProductos] = useState<any[]>([]);
  const [loadingProductos, setLoadingProductos] = useState(true);

  useEffect(() => {
    const cargarProductos = async () => {
      if (pedidoId) {
        setLoadingProductos(true);
        const productosData = await obtenerProductosPedido(pedidoId);
        setProductos(productosData);
        setLoadingProductos(false);
      }
    };

    cargarProductos();
  }, [pedidoId, obtenerProductosPedido]);

  const pedido = pedidoParam || {};

  const renderProducto = ({ item }: { item: any }) => (
    <View style={styles.productoCard}>
      {item.producto?.imagen_url ? (
        <Image source={{ uri: item.producto.imagen_url }} style={styles.productoImagen} />
      ) : (
        <View style={styles.productoImagenPlaceholder}>
          <MaterialIcons name="image" size={32} color="#CCCCCC" />
        </View>
      )}
      <View style={styles.productoInfo}>
        <Text style={styles.productoNombre} numberOfLines={2}>
          {item.producto?.nombre || 'Producto'}
        </Text>
        <Text style={styles.productoPrecio}>
          ${item.precio_unitario.toFixed(2)} c/u
        </Text>
        <Text style={styles.productoCantidad}>
          Cantidad: {item.cantidad}
        </Text>
        <Text style={styles.productoSubtotal}>
          Subtotal: ${item.subtotal.toFixed(2)}
        </Text>
      </View>
    </View>
  );

  if (loadingProductos) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color="#000000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalle del Pedido</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalle del Pedido</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Información del pedido */}
        <View style={styles.pedidoInfoCard}>
          <View style={styles.pedidoInfoRow}>
            <Text style={styles.pedidoInfoLabel}>Pedido #</Text>
            <Text style={styles.pedidoInfoValue}>{pedido.id_pedido || pedidoId}</Text>
          </View>
          <View style={styles.pedidoInfoRow}>
            <Text style={styles.pedidoInfoLabel}>Estado</Text>
            <View style={[styles.estadoBadge, { backgroundColor: getEstadoColor(pedido.estado) }]}>
              <Text style={styles.estadoText}>{pedido.estado || 'pendiente'}</Text>
            </View>
          </View>
          <View style={styles.pedidoInfoRow}>
            <Text style={styles.pedidoInfoLabel}>Fecha</Text>
            <Text style={styles.pedidoInfoValue}>
              {pedido.fecha_pedido 
                ? new Date(pedido.fecha_pedido).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                : 'N/A'}
            </Text>
          </View>
          {pedido.tienda && (
            <View style={styles.pedidoInfoRow}>
              <Text style={styles.pedidoInfoLabel}>Tienda</Text>
              <Text style={styles.pedidoInfoValue}>{pedido.tienda.nombre_tienda}</Text>
            </View>
          )}
          {pedido.direccion && (
            <View style={styles.pedidoInfoRow}>
              <MaterialIcons name="location-on" size={20} color="#4CAF50" />
              <Text style={[styles.pedidoInfoValue, styles.direccionText]}>
                {pedido.direccion.direccion}
              </Text>
            </View>
          )}
          {pedido.observaciones && (
            <View style={styles.observacionesContainer}>
              <Text style={styles.observacionesLabel}>Observaciones:</Text>
              <Text style={styles.observacionesText}>{pedido.observaciones}</Text>
            </View>
          )}
        </View>

        {/* Lista de productos */}
        <View style={styles.productosSection}>
          <Text style={styles.sectionTitle}>Productos ({productos.length})</Text>
          {productos.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="inventory" size={64} color="#CCCCCC" />
              <Text style={styles.emptyText}>No hay productos en este pedido</Text>
            </View>
          ) : (
            <FlatList
              data={productos}
              renderItem={renderProducto}
              keyExtractor={(item) => item.id_carrito.toString()}
              scrollEnabled={false}
            />
          )}
        </View>

        {/* Resumen total */}
        <View style={styles.totalCard}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total del pedido:</Text>
            <Text style={styles.totalAmount}>
              ${pedido.total?.toFixed(2) || '0.00'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const getEstadoColor = (estado?: string) => {
  switch (estado?.toLowerCase()) {
    case 'pendiente':
      return '#FFC107';
    case 'confirmado':
      return '#2196F3';
    case 'en camino':
      return '#9C27B0';
    case 'entregado':
      return '#4CAF50';
    case 'cancelado':
      return '#F44336';
    default:
      return '#9E9E9E';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  pedidoInfoCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pedidoInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  pedidoInfoLabel: {
    fontSize: 14,
    color: '#666666',
    width: 80,
    fontWeight: '500',
  },
  pedidoInfoValue: {
    fontSize: 14,
    color: '#000000',
    flex: 1,
    fontWeight: '500',
  },
  estadoBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  estadoText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  direccionText: {
    marginLeft: 8,
    flex: 1,
  },
  observacionesContainer: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  observacionesLabel: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
    marginBottom: 4,
  },
  observacionesText: {
    fontSize: 14,
    color: '#000000',
  },
  productosSection: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 12,
  },
  productoCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productoImagen: {
    width: 80,
    height: 80,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  productoImagenPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productoInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  productoNombre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  productoPrecio: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  productoCantidad: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  productoSubtotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  totalCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    marginTop: 16,
    textAlign: 'center',
  },
});

export default DetallePedidoScreen;



















