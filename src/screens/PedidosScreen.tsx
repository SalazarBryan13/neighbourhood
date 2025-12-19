import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { usePedidos } from '../hooks/usePedidos';

const getEstadoColor = (estado: string) => {
  switch (estado) {
    case 'pendiente':
      return '#FFA000';
    case 'aceptado':
      return '#4CAF50';
    case 'rechazado':
      return '#F44336';
    case 'entregado':
      return '#2196F3';
    default:
      return '#9E9E9E';
  }
};

const PedidosScreen: React.FC = () => {
  const navigation = useNavigation();
  const { obtenerPedidos, loading, error } = usePedidos();
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [loadingPedidos, setLoadingPedidos] = useState(false);

  const cargarHistorial = async () => {
    setLoadingPedidos(true);
    const data = await obtenerPedidos();
    setPedidos(data);
    setLoadingPedidos(false);
  };

  useEffect(() => {
    cargarHistorial();
  }, []);

  const renderPedido = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.pedidoCard}
      onPress={() =>
        (navigation as any).navigate('DetallePedido', {
          pedidoId: item.id_pedido,
          pedido: item,
        })
      }
      activeOpacity={0.7}
    >
      <View style={styles.pedidoHeader}>
        <Text style={styles.pedidoId}>Pedido #{item.id_pedido}</Text>
        <View
          style={[
            styles.estadoBadge,
            { backgroundColor: getEstadoColor(item.estado) },
          ]}
        >
          <Text style={styles.estadoText}>{item.estado}</Text>
        </View>
      </View>
      <Text style={styles.pedidoFecha}>
        {new Date(item.fecha_pedido).toLocaleDateString('es-ES')}
      </Text>
      <Text style={styles.pedidoTotal}>
        Total: ${item.total.toFixed(2)}
      </Text>
      {item.tienda && (
        <Text style={styles.pedidoTienda}>
          {item.tienda.nombre_tienda}
        </Text>
      )}
    </TouchableOpacity>
  );

  if (loading || loadingPedidos) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mis pedidos</Text>
        <TouchableOpacity onPress={cargarHistorial}>
          <MaterialIcons name="refresh" size={24} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      {error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : pedidos.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>
            Aún no tienes pedidos realizados.
          </Text>
        </View>
      ) : (
        <FlatList
          data={pedidos}
          keyExtractor={(item) => item.id_pedido.toString()}
          renderItem={renderPedido}
          contentContainerStyle={styles.listaContenido}
        />
      )}
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
  },
  header: {
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212121',
  },
  listaContenido: {
    padding: 16,
  },
  pedidoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  pedidoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pedidoId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212121',
  },
  estadoBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  estadoText: {
    fontSize: 12,
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
  pedidoFecha: {
    marginTop: 4,
    fontSize: 13,
    color: '#757575',
  },
  pedidoTotal: {
    marginTop: 8,
    fontSize: 15,
    fontWeight: 'bold',
    color: '#212121',
  },
  pedidoTienda: {
    marginTop: 4,
    fontSize: 14,
    color: '#616161',
  },
  errorText: {
    color: '#F44336',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  emptyText: {
    color: '#757575',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
});

export default PedidosScreen;