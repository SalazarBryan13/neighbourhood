import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useCarrito } from '../hooks/useCarrito';
import { supabase } from '../lib/supabaseClient';
import type { Producto } from '../hooks/useProductos';

interface RouteParams {
  productoId: number;
  categoriaId?: number;
}

const ProductoDetalleScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { productoId, categoriaId } = (route.params as RouteParams) || {};
  
  const { agregarAlCarrito, loading: carritoLoading, cantidadItems } = useCarrito();
  
  const [producto, setProducto] = useState<Producto | null>(null);
  const [loading, setLoading] = useState(true);
  const [cantidad, setCantidad] = useState(1);
  const [agregando, setAgregando] = useState(false);

  React.useEffect(() => {
    const fetchProducto = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('producto')
          .select(`
            *,
            inventario:inventario(
              id_inventario,
              id_tienda,
              stock,
              tienda:tienda(
                id_tienda,
                nombre_tienda
              )
            )
          `)
          .eq('id_producto', productoId)
          .eq('activo', true)
          .single();

        if (error) {
          console.error('Error obteniendo producto:', error);
          Alert.alert('Error', 'No se pudo obtener el producto');
        } else {
          setProducto(data as Producto);
        }
      } catch (err) {
        console.error('Error:', err);
        Alert.alert('Error', 'Ocurrió un error al obtener el producto');
      } finally {
        setLoading(false);
      }
    };

    if (productoId) {
      fetchProducto();
    }
  }, [productoId]);

  const handleIncrementar = () => {
    if (producto?.inventario?.stock) {
      setCantidad(prev => Math.min(prev + 1, producto.inventario!.stock));
    } else {
      setCantidad(prev => prev + 1);
    }
  };

  const handleDecrementar = () => {
    setCantidad(prev => Math.max(1, prev - 1));
  };

  const handleAgregarAlCarrito = async () => {
    if (!producto) {
      Alert.alert('Error', 'Producto no encontrado');
      return;
    }

    if (!producto.inventario?.id_tienda) {
      Alert.alert('Error', 'No se pudo obtener la tienda del producto');
      return;
    }

    // Validar stock
    if (producto.inventario.stock !== undefined && cantidad > producto.inventario.stock) {
      Alert.alert('Error', `Solo hay ${producto.inventario.stock} unidades disponibles`);
      return;
    }

    setAgregando(true);
    const success = await agregarAlCarrito(
      producto.id_producto,
      cantidad,
      producto.precio
    );

    setAgregando(false);

    if (success) {
      Alert.alert(
        'Éxito',
        `${cantidad} ${cantidad === 1 ? 'unidad' : 'unidades'} de ${producto.nombre} agregada${cantidad === 1 ? '' : 's'} al carrito`,
        [
          {
            text: 'Seguir comprando',
            onPress: () => navigation.goBack(),
          },
          {
            text: 'Ver carrito',
            onPress: () => {
              navigation.goBack();
              (navigation as any).navigate('Carrito');
            },
            style: 'default',
          },
        ]
      );
    } else {
      Alert.alert('Error', 'No se pudo agregar al carrito');
    }
  };

  const handleVolverMenu = () => {
    navigation.navigate('Tabs' as never);
  };

  if (loading || !producto) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color="#000000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalle del Producto</Text>
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
        <Text style={styles.headerTitle}>Detalle</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity
            style={styles.carritoButton}
            onPress={() => (navigation as any).navigate('Carrito')}
          >
            <MaterialIcons name="shopping-cart" size={24} color="#000000" />
            {cantidadItems && cantidadItems > 0 ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {cantidadItems > 99 ? '99+' : cantidadItems}
                </Text>
              </View>
            ) : null}
          </TouchableOpacity>
          <TouchableOpacity onPress={handleVolverMenu}>
            <MaterialIcons name="home" size={24} color="#4CAF50" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Imagen del producto */}
        <View style={styles.imagenContainer}>
          {producto.imagen_url ? (
            <Image source={{ uri: producto.imagen_url }} style={styles.imagen} />
          ) : (
            <View style={styles.imagenPlaceholder}>
              <MaterialIcons name="image" size={64} color="#CCCCCC" />
            </View>
          )}
        </View>

        {/* Información del producto */}
        <View style={styles.infoContainer}>
          <Text style={styles.nombre}>{producto.nombre}</Text>
          
          {producto.descripcion && (
            <Text style={styles.descripcion}>{producto.descripcion}</Text>
          )}

          <View style={styles.precioContainer}>
            <Text style={styles.precio}>${producto.precio.toFixed(2)}</Text>
            {producto.inventario?.stock !== undefined && (
              <Text style={styles.stock}>
                {producto.inventario.stock > 0 
                  ? `${producto.inventario.stock} disponibles`
                  : 'Agotado'}
              </Text>
            )}
          </View>

          {producto.inventario?.tienda && (
            <View style={styles.tiendaContainer}>
              <MaterialIcons name="store" size={20} color="#4CAF50" />
              <Text style={styles.tiendaNombre}>
                {producto.inventario.tienda.nombre_tienda}
              </Text>
            </View>
          )}

          {/* Selector de cantidad */}
          <View style={styles.cantidadSection}>
            <Text style={styles.cantidadLabel}>Cantidad:</Text>
            <View style={styles.cantidadControls}>
              <TouchableOpacity
                style={[styles.cantidadButton, cantidad === 1 && styles.cantidadButtonDisabled]}
                onPress={handleDecrementar}
                disabled={cantidad === 1}
              >
                <MaterialIcons 
                  name="remove" 
                  size={24} 
                  color={cantidad === 1 ? "#CCCCCC" : "#4CAF50"} 
                />
              </TouchableOpacity>
              
              <Text style={styles.cantidadText}>{cantidad}</Text>
              
              <TouchableOpacity
                style={[
                  styles.cantidadButton,
                  producto.inventario?.stock !== undefined && 
                  cantidad >= producto.inventario.stock && 
                  styles.cantidadButtonDisabled
                ]}
                onPress={handleIncrementar}
                disabled={
                  producto.inventario?.stock !== undefined && 
                  cantidad >= producto.inventario.stock
                }
              >
                <MaterialIcons 
                  name="add" 
                  size={24} 
                  color={
                    producto.inventario?.stock !== undefined && 
                    cantidad >= producto.inventario.stock
                      ? "#CCCCCC" 
                      : "#4CAF50"
                  } 
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.subtotal}>
              Subtotal: ${(producto.precio * cantidad).toFixed(2)}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Botón agregar al carrito */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.agregarButton,
            (agregando || carritoLoading || 
             (producto.inventario?.stock !== undefined && producto.inventario.stock === 0)) && 
            styles.agregarButtonDisabled
          ]}
          onPress={handleAgregarAlCarrito}
          disabled={
            agregando || 
            carritoLoading || 
            (producto.inventario?.stock !== undefined && producto.inventario.stock === 0)
          }
        >
          {agregando || carritoLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <MaterialIcons name="add-shopping-cart" size={24} color="#FFFFFF" />
              <Text style={styles.agregarButtonText}>
                {producto.inventario?.stock === 0 
                  ? 'Producto Agotado' 
                  : 'Agregar al Carrito'}
              </Text>
            </>
          )}
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
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  carritoButton: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#F44336',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  imagenContainer: {
    width: '100%',
    height: 300,
    backgroundColor: '#F5F5F5',
  },
  imagen: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagenPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  infoContainer: {
    padding: 16,
  },
  nombre: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  descripcion: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 24,
    marginBottom: 16,
  },
  precioContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  precio: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  stock: {
    fontSize: 14,
    color: '#666666',
  },
  tiendaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    padding: 12,
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
  },
  tiendaNombre: {
    fontSize: 16,
    color: '#000000',
    marginLeft: 8,
    fontWeight: '500',
  },
  cantidadSection: {
    marginTop: 8,
    padding: 16,
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
  },
  cantidadLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 12,
  },
  cantidadControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  cantidadButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  cantidadButtonDisabled: {
    borderColor: '#CCCCCC',
    backgroundColor: '#F5F5F5',
  },
  cantidadText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginHorizontal: 24,
    minWidth: 40,
    textAlign: 'center',
  },
  subtotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    textAlign: 'center',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  agregarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  agregarButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  agregarButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ProductoDetalleScreen;

