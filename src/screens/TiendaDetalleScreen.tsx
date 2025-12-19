import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  TextInput,
  FlatList,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useProductos } from '../hooks/useProductos';
import { useCategorias } from '../hooks/useCategorias';
import { useCarrito } from '../hooks/useCarrito';

interface RouteParams {
  tiendaId: number;
  tiendaNombre: string;
  tiendaImagen?: string | null;
  tiendaDescripcion?: string | null;
  tiendaDireccion?: string | null;
}

const TiendaDetalleScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {
    tiendaId,
    tiendaNombre,
    tiendaImagen,
    tiendaDescripcion,
    tiendaDireccion,
  } = (route.params as RouteParams) || {};

  const { productos, loading, error, fetchProductos } = useProductos(
    undefined,
    tiendaId,
  );
  const { categorias } = useCategorias();
  const { total, cantidadItems } = useCarrito();

  const [search, setSearch] = useState('');
  const [selectedCategoriaId, setSelectedCategoriaId] = useState<number | null>(
    null,
  );

  useEffect(() => {
    if (tiendaId) {
      fetchProductos();
    }
  }, [tiendaId, fetchProductos]);

  const categoriasDeLaTienda = useMemo(() => {
    const ids = new Set(productos.map((p) => p.id_categoria));
    return categorias.filter((c) => ids.has(c.id_categoria));
  }, [productos, categorias]);

  const productosFiltrados = useMemo(
    () =>
      productos.filter((p) => {
        if (selectedCategoriaId && p.id_categoria !== selectedCategoriaId) {
          return false;
        }
        if (!search.trim()) {
          return true;
        }
        const term = search.trim().toLowerCase();
        return (
          p.nombre.toLowerCase().includes(term) ||
          (p.descripcion ?? '').toLowerCase().includes(term)
        );
      }),
    [productos, selectedCategoriaId, search],
  );

  const renderProducto = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() =>
        (navigation as any).navigate('ProductoDetalle', {
          productoId: item.id_producto,
        })
      }
    >
      {item.imagen_url ? (
        <Image source={{ uri: item.imagen_url }} style={styles.productImage} />
      ) : (
        <View style={styles.productImagePlaceholder}>
          <MaterialIcons name="image" size={32} color="#CCCCCC" />
        </View>
      )}
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.nombre}
        </Text>
        {item.descripcion && (
          <Text style={styles.productDescription} numberOfLines={2}>
            {item.descripcion}
          </Text>
        )}
        <Text style={styles.productPrice}>${item.precio.toFixed(2)}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {tiendaNombre}
        </Text>
        <TouchableOpacity onPress={() => (navigation as any).navigate('Carrito')}>
          <MaterialIcons name="shopping-cart" size={24} color="#000000" />
        </TouchableOpacity>
      </View>

      {/* Imagen y datos de la tienda */}
      <FlatList
        data={productosFiltrados}
        keyExtractor={(item) => item.id_producto.toString()}
        numColumns={2}
        columnWrapperStyle={styles.productsRow}
        renderItem={renderProducto}
        ListHeaderComponent={
          <View>
            {tiendaImagen ? (
              <Image source={{ uri: tiendaImagen }} style={styles.storeImage} />
            ) : (
              <View style={styles.storeImagePlaceholder}>
                <MaterialIcons name="storefront" size={48} color="#666666" />
              </View>
            )}

            <View style={styles.storeInfo}>
              <Text style={styles.storeName}>{tiendaNombre}</Text>
              {tiendaDescripcion ? (
                <Text style={styles.storeDescription} numberOfLines={2}>
                  {tiendaDescripcion}
                </Text>
              ) : null}
              {tiendaDireccion ? (
                <View style={styles.storeAddressRow}>
                  <MaterialIcons
                    name="location-on"
                    size={16}
                    color="#4CAF50"
                  />
                  <Text style={styles.storeAddress} numberOfLines={1}>
                    {tiendaDireccion}
                  </Text>
                </View>
              ) : null}
            </View>

            {/* Barra de búsqueda */}
            <View style={styles.searchContainer}>
              <MaterialIcons
                name="search"
                size={20}
                color="#4CAF50"
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar productos en esta tienda"
                placeholderTextColor="#9E9E9E"
                value={search}
                onChangeText={setSearch}
              />
            </View>

            {/* Filtros por categoría */}
            <View style={styles.filtersContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filtersScroll}
              >
                <TouchableOpacity
                  style={[
                    styles.chip,
                    !selectedCategoriaId && styles.chipSelected,
                  ]}
                  onPress={() => setSelectedCategoriaId(null)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      !selectedCategoriaId && styles.chipTextSelected,
                    ]}
                  >
                    Todos
                  </Text>
                </TouchableOpacity>
                {categoriasDeLaTienda.map((cat) => (
                  <TouchableOpacity
                    key={cat.id_categoria}
                    style={[
                      styles.chip,
                      selectedCategoriaId === cat.id_categoria &&
                        styles.chipSelected,
                    ]}
                    onPress={() => setSelectedCategoriaId(cat.id_categoria)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        selectedCategoriaId === cat.id_categoria &&
                          styles.chipTextSelected,
                      ]}
                    >
                      {cat.nombre}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {error && (
              <View style={styles.errorContainer}>
                <MaterialIcons
                  name="error-outline"
                  size={20}
                  color="#F44336"
                />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
          </View>
        }
        contentContainerStyle={styles.listContent}
      />

      {/* Barra inferior de carrito */}
      <View style={styles.cartBar}>
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => (navigation as any).navigate('Carrito')}
        >
          <View style={styles.cartInfo}>
            <MaterialIcons name="shopping-cart" size={22} color="#FFFFFF" />
            <Text style={styles.cartText}>
              Ver carrito {cantidadItems > 0 ? `(${cantidadItems})` : ''}
            </Text>
          </View>
          <Text style={styles.cartTotal}>${total.toFixed(2)}</Text>
        </TouchableOpacity>
      </View>
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
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  storeImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  storeImagePlaceholder: {
    width: '100%',
    height: 180,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storeInfo: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  storeName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 4,
  },
  storeDescription: {
    fontSize: 14,
    color: '#616161',
    marginBottom: 4,
  },
  storeAddressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  storeAddress: {
    fontSize: 13,
    color: '#424242',
    marginLeft: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 8,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#000000',
  },
  filtersContainer: {
    marginTop: 8,
  },
  filtersScroll: {
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginRight: 8,
    backgroundColor: '#FFFFFF',
  },
  chipSelected: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  chipText: {
    fontSize: 13,
    color: '#424242',
  },
  chipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 100,
    paddingHorizontal: 16,
  },
  productsRow: {
    justifyContent: 'space-between',
    marginTop: 12,
  },
  productCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  productImagePlaceholder: {
    width: '100%',
    height: 120,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    padding: 10,
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 6,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  errorText: {
    fontSize: 13,
    color: '#F44336',
  },
  cartBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 12,
    backgroundColor: 'transparent',
  },
  cartButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cartInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cartText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  cartTotal: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TiendaDetalleScreen;


