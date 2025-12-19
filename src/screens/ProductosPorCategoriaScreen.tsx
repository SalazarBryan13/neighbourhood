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
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useProductos } from '../hooks/useProductos';

interface RouteParams {
  categoriaId: number;
  categoriaNombre: string;
}

const ProductosPorCategoriaScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { categoriaId, categoriaNombre } = (route.params as RouteParams) || {};
  
  const { productos, loading, error, fetchProductos } = useProductos(categoriaId);

  useEffect(() => {
    fetchProductos();
  }, [categoriaId, fetchProductos]);

  const handleProductoPress = (producto: any) => {
    (navigation as any).navigate('ProductoDetalle', {
      productoId: producto.id_producto,
      categoriaId: categoriaId,
    });
  };

  const renderProducto = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.productoCard}
      onPress={() => handleProductoPress(item)}
    >
      {item.imagen_url ? (
        <Image source={{ uri: item.imagen_url }} style={styles.productoImagen} />
      ) : (
        <View style={styles.productoImagenPlaceholder}>
          <MaterialIcons name="image" size={40} color="#CCCCCC" />
        </View>
      )}
      <View style={styles.productoInfo}>
        <Text style={styles.productoNombre} numberOfLines={2}>
          {item.nombre}
        </Text>
        {item.descripcion && (
          <Text style={styles.productoDescripcion} numberOfLines={2}>
            {item.descripcion}
          </Text>
        )}
        <Text style={styles.productoPrecio}>
          ${item.precio.toFixed(2)}
        </Text>
        {item.inventario?.tienda && (
          <Text style={styles.productoTienda} numberOfLines={1}>
            {item.inventario.tienda.nombre_tienda}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color="#000000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{categoriaNombre}</Text>
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
        <Text style={styles.headerTitle}>{categoriaNombre}</Text>
        <TouchableOpacity onPress={() => (navigation as any).navigate('Tabs')}>
          <MaterialIcons name="home" size={24} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      {error ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="error-outline" size={64} color="#F44336" />
          <Text style={styles.emptyText}>{error}</Text>
        </View>
      ) : productos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="inventory" size={64} color="#CCCCCC" />
          <Text style={styles.emptyText}>No hay productos en esta categoría</Text>
        </View>
      ) : (
        <FlatList
          data={productos}
          renderItem={renderProducto}
          keyExtractor={(item) => item.id_producto.toString()}
          contentContainerStyle={styles.listContainer}
          numColumns={2}
          columnWrapperStyle={styles.row}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
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
  listContainer: {
    padding: 16,
  },
  row: {
    justifyContent: 'space-between',
  },
  productoCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  productoImagen: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  productoImagenPlaceholder: {
    width: '100%',
    height: 120,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productoInfo: {
    padding: 12,
  },
  productoNombre: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  productoDescripcion: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 8,
  },
  productoPrecio: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  productoTienda: {
    fontSize: 11,
    color: '#999999',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    marginTop: 16,
    textAlign: 'center',
  },
});

export default ProductosPorCategoriaScreen;

