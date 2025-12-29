import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  FlatList,
  Image,
  Modal,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useProductosAPI } from '../hooks/useProductosAPI';
import { useCategoriasAPI } from '../hooks/useCategoriasAPI';
import { usePerfilUsuario } from '../hooks/usePerfilUsuario';
import { useTiendasAPI } from '../hooks/useTiendasAPI';
import { useInventarioAPI } from '../hooks/useInventarioAPI';

const GestionProductosScreen: React.FC = () => {
  const navigation = useNavigation();
  const { perfil } = usePerfilUsuario();
  const [tiendaId, setTiendaId] = useState<number | null>(null);
  const {
    productos,
    loading,
    error,
    fetchProductos,
    crearProducto,
    actualizarProducto,
    eliminarProducto,
  } = useProductosAPI();
  const { categorias, fetchCategorias } = useCategoriasAPI();
  const { tiendas, fetchTiendas } = useTiendasAPI();
  const { inventario, fetchInventario } = useInventarioAPI();
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState<any>(null);
  const [mostrarModalConfirmacion, setMostrarModalConfirmacion] = useState(false);
  const [productoAEliminar, setProductoAEliminar] = useState<any>(null);

  // Formulario
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [id_categoria, setIdCategoria] = useState<number | null>(null);
  const [id_inventario, setIdInventario] = useState<number | null>(null);
  const [imagen_url, setImagenUrl] = useState('');

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      await fetchTiendas().catch(err => {
        console.error('❌ Error cargando tiendas:', err);
      });
    } catch (err) {
      console.error('❌ Error en cargarDatos:', err);
    }
  };

  // Actualizar tiendaId cuando se carguen las tiendas (seleccionar la primera por defecto)
  useEffect(() => {
    if (tiendas.length > 0 && !tiendaId) {
      console.log('🏪 Seleccionando primera tienda por defecto:', tiendas[0].id_tienda);
      setTiendaId(tiendas[0].id_tienda);
    }
  }, [tiendas]);

  // Cargar categorías, productos e inventario cuando cambie la tienda seleccionada
  useEffect(() => {
    if (tiendaId) {
      console.log('🔄 Cargando categorías, productos e inventario para tienda:', tiendaId);
      fetchCategorias(tiendaId);
      fetchProductos(tiendaId);
      fetchInventario(tiendaId);
    }
  }, [tiendaId, fetchCategorias, fetchProductos, fetchInventario]);

  const abrirModalCrear = () => {
    setModoEdicion(false);
    setProductoSeleccionado(null);
    limpiarFormulario();
    setMostrarModal(true);
  };

  const abrirModalEditar = (producto: any) => {
    setModoEdicion(true);
    setProductoSeleccionado(producto);
    setNombre(producto.nombre || '');
    setDescripcion(producto.descripcion || '');
    setPrecio(producto.precio?.toString() || '');
    setIdCategoria(producto.id_categoria || null);
    setIdInventario(producto.id_inventario || null);
    setImagenUrl(producto.imagen_url || '');
    setMostrarModal(true);
  };

  const limpiarFormulario = () => {
    setNombre('');
    setDescripcion('');
    setPrecio('');
    setIdCategoria(null);
    setIdInventario(null);
    setImagenUrl('');
  };

  const handleGuardar = async () => {
    if (!nombre.trim() || !precio.trim() || !id_categoria || !id_inventario) {
      Alert.alert('Error', 'Completa todos los campos obligatorios (nombre, precio, categoría e inventario)');
      return;
    }

    if (!tiendaId) {
      Alert.alert('Error', 'No se pudo identificar la tienda');
      return;
    }

    const precioValue = parseFloat(precio);
    if (isNaN(precioValue) || precioValue < 0) {
      Alert.alert('Error', 'El precio debe ser un número válido mayor o igual a 0');
      return;
    }

    try {
      if (modoEdicion && productoSeleccionado) {
        // Actualizar producto
        console.log('📝 Actualizando producto:', productoSeleccionado.id_producto);
        const resultado = await actualizarProducto(productoSeleccionado.id_producto, {
          nombre: nombre.trim(),
          descripcion: descripcion.trim() || null,
          precio: precioValue,
          id_categoria,
          id_inventario,
          imagen_url: imagen_url.trim() || null,
        });
        console.log('✅ Producto actualizado:', resultado);
      } else {
        // Crear nuevo producto
        console.log('➕ Creando nuevo producto');
        const payload = {
          id_tienda: tiendaId,
          id_inventario,
          id_categoria,
          nombre: nombre.trim(),
          descripcion: descripcion.trim() || null,
          precio: precioValue,
          imagen_url: imagen_url.trim() || null,
          activo: true,
        };
        console.log('📤 Payload:', payload);
        const resultado = await crearProducto(payload);
        console.log('✅ Producto creado:', resultado);
        
        if (!resultado) {
          Alert.alert('Error', 'No se pudo crear el producto. Verifica la consola para más detalles.');
          return;
        }
      }
      setMostrarModal(false);
      limpiarFormulario();
      if (tiendaId) {
        await fetchProductos(tiendaId);
      }
    } catch (err) {
      console.error('❌ Error en handleGuardar:', err);
      Alert.alert('Error', `No se pudo guardar el producto: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    }
  };

  const handleEliminar = (producto: any) => {
    console.log('🔔 handleEliminar llamado con producto:', producto);
    if (!producto || !producto.id_producto) {
      console.error('❌ Error: producto inválido en handleEliminar:', producto);
      Alert.alert('Error', 'No se pudo identificar el producto a eliminar');
      return;
    }
    
    // Mostrar modal de confirmación estilizado
    setProductoAEliminar(producto);
    setMostrarModalConfirmacion(true);
  };

  const confirmarEliminacion = async () => {
    if (!productoAEliminar) return;
    
    console.log('✅ Usuario confirmó eliminación de producto:', productoAEliminar.id_producto);
    setMostrarModalConfirmacion(false);
    
    try {
      const resultado = await eliminarProducto(productoAEliminar.id_producto);
      console.log('📊 Resultado de eliminarProducto:', resultado);
      if (resultado) {
        // La eliminación fue exitosa, actualizar la lista
        if (tiendaId) {
          await fetchProductos(tiendaId);
        }
        Alert.alert('Éxito', 'El producto ha sido eliminado correctamente');
      } else {
        // La eliminación falló
        Alert.alert('Error', 'No se pudo eliminar el producto. Por favor intenta nuevamente.');
      }
    } catch (err) {
      console.error('❌ Error al eliminar producto:', err);
      Alert.alert('Error', 'Ocurrió un error al eliminar el producto.');
    } finally {
      setProductoAEliminar(null);
    }
  };

  const cancelarEliminacion = () => {
    console.log('❌ Eliminación cancelada');
    setMostrarModalConfirmacion(false);
    setProductoAEliminar(null);
  };

  const renderProducto = ({ item }: { item: any }) => {
    // Asegurar que el precio sea un número
    const precioNumero = typeof item.precio === 'number' 
      ? item.precio 
      : parseFloat(item.precio) || 0;
    
    return (
      <View style={styles.productoCard}>
        {item.imagen_url ? (
          <Image source={{ uri: item.imagen_url }} style={styles.productoImagen} />
        ) : (
          <View style={styles.productoImagenPlaceholder}>
            <MaterialIcons name="image" size={32} color="#CCCCCC" />
          </View>
        )}
        <View style={styles.productoInfo}>
          <Text style={styles.productoNombre}>{item.nombre}</Text>
          <Text style={styles.productoPrecio}>${precioNumero.toFixed(2)}</Text>
          {item.activo !== false && (
            <Text style={styles.productoActivo}>Activo</Text>
          )}
        </View>
      <View style={styles.productoActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => abrirModalEditar(item)}
        >
          <MaterialIcons name="edit" size={20} color="#2196F3" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPressIn={() => {
            console.log('👆 onPressIn - Botón de eliminar presionado');
          }}
          onPress={() => {
            console.log('🗑️ onPress - Botón de eliminar presionado para producto:', item.id_producto, item.nombre);
            if (!item || !item.id_producto) {
              console.error('❌ Item inválido:', item);
              return;
            }
            handleEliminar(item);
          }}
          activeOpacity={0.7}
          testID={`delete-button-${item.id_producto}`}
        >
          <MaterialIcons name="delete" size={20} color="#F44336" />
        </TouchableOpacity>
      </View>
    </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gestión de Productos</Text>
        <TouchableOpacity onPress={abrirModalCrear}>
          <MaterialIcons name="add" size={24} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      {/* Selector de Tienda */}
      {tiendas.length > 0 && (
        <View style={styles.tiendaSelectorContainer}>
          <Text style={styles.tiendaSelectorLabel}>Seleccionar Tienda:</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tiendaSelectorScroll}
          >
            {tiendas.map((tienda) => (
              <TouchableOpacity
                key={tienda.id_tienda}
                style={[
                  styles.tiendaChip,
                  tiendaId === tienda.id_tienda && styles.tiendaChipSelected,
                ]}
                onPress={() => {
                  console.log('🏪 Cambiando a tienda:', tienda.id_tienda, tienda.nombre_tienda);
                  setTiendaId(tienda.id_tienda);
                }}
              >
                <Text
                  style={[
                    styles.tiendaChipText,
                    tiendaId === tienda.id_tienda && styles.tiendaChipTextSelected,
                  ]}
                >
                  {tienda.nombre_tienda}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#4CAF50" />
          {error && (
            <Text style={styles.errorText}>
              {error}
            </Text>
          )}
        </View>
      ) : error ? (
        <View style={styles.center}>
          <MaterialIcons name="error-outline" size={64} color="#F44336" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => cargarDatos()}
          >
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={productos}
          renderItem={renderProducto}
          keyExtractor={(item) => item.id_producto.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons name="shopping-bag" size={64} color="#CCCCCC" />
              <Text style={styles.emptyText}>
                {tiendaId 
                  ? 'No hay productos en esta tienda'
                  : 'Selecciona una tienda para ver sus productos'}
              </Text>
            </View>
          }
        />
      )}

      {/* Modal de formulario */}
      <Modal
        visible={mostrarModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setMostrarModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {modoEdicion ? 'Editar Producto' : 'Nuevo Producto'}
              </Text>
              <TouchableOpacity onPress={() => setMostrarModal(false)}>
                <MaterialIcons name="close" size={24} color="#000000" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <Text style={styles.label}>Nombre *</Text>
              <TextInput
                style={styles.input}
                value={nombre}
                onChangeText={setNombre}
                placeholder="Nombre del producto"
              />

              <Text style={styles.label}>Descripción</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={descripcion}
                onChangeText={setDescripcion}
                placeholder="Descripción del producto"
                multiline
                numberOfLines={3}
              />

              <Text style={styles.label}>Precio *</Text>
              <TextInput
                style={styles.input}
                value={precio}
                onChangeText={setPrecio}
                placeholder="0.00"
                keyboardType="decimal-pad"
              />

              <Text style={styles.label}>Categoría *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {categorias.map((cat) => (
                  <TouchableOpacity
                    key={cat.id_categoria}
                    style={[
                      styles.categoriaChip,
                      id_categoria === cat.id_categoria && styles.categoriaChipSelected,
                    ]}
                    onPress={() => setIdCategoria(cat.id_categoria)}
                  >
                    <Text
                      style={[
                        styles.categoriaChipText,
                        id_categoria === cat.id_categoria && styles.categoriaChipTextSelected,
                      ]}
                    >
                      {cat.nombre}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.label}>Inventario *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {inventario.map((inv) => (
                    <TouchableOpacity
                      key={inv.id_inventario}
                      style={[
                        styles.categoriaChip,
                        id_inventario === inv.id_inventario && styles.categoriaChipSelected,
                      ]}
                      onPress={() => setIdInventario(inv.id_inventario)}
                    >
                      <Text
                        style={[
                          styles.categoriaChipText,
                          id_inventario === inv.id_inventario && styles.categoriaChipTextSelected,
                        ]}
                      >
                        Stock: {inv.stock} {inv.descripcion ? `- ${inv.descripcion}` : ''}
                      </Text>
                    </TouchableOpacity>
                  ))}
              </ScrollView>
              {inventario.length === 0 && (
                <Text style={styles.helperText}>
                  No hay inventarios disponibles. Crea uno primero en la sección de Inventario.
                </Text>
              )}

              <Text style={styles.label}>URL de Imagen</Text>
              <TextInput
                style={styles.input}
                value={imagen_url}
                onChangeText={setImagenUrl}
                placeholder="https://..."
              />

              <TouchableOpacity style={styles.saveButton} onPress={handleGuardar}>
                <Text style={styles.saveButtonText}>Guardar</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal de Confirmación de Eliminación */}
      <Modal
        visible={mostrarModalConfirmacion}
        transparent={true}
        animationType="fade"
        onRequestClose={cancelarEliminacion}
      >
        <View style={styles.modalConfirmacionOverlay}>
          <View style={styles.modalConfirmacionContent}>
            <View style={styles.modalConfirmacionIconContainer}>
              <MaterialIcons name="warning" size={64} color="#F44336" />
            </View>
            <Text style={styles.modalConfirmacionTitle}>
              ¿Eliminar producto?
            </Text>
            <Text style={styles.modalConfirmacionMessage}>
              Estás a punto de eliminar el producto{' '}
              <Text style={styles.modalConfirmacionProductoNombre}>
                "{productoAEliminar?.nombre}"
              </Text>
              . Esta acción no se puede deshacer.
            </Text>
            <View style={styles.modalConfirmacionButtons}>
              <TouchableOpacity
                style={styles.modalConfirmacionButtonCancel}
                onPress={cancelarEliminacion}
              >
                <Text style={styles.modalConfirmacionButtonCancelText}>
                  Cancelar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmacionButtonDelete}
                onPress={confirmarEliminacion}
              >
                <MaterialIcons name="delete" size={20} color="#FFFFFF" />
                <Text style={styles.modalConfirmacionButtonDeleteText}>
                  Eliminar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
  listContent: {
    padding: 16,
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
    marginRight: 12,
  },
  productoImagenPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  productoInfo: {
    flex: 1,
  },
  productoNombre: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  productoPrecio: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  productoActivo: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  productoActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999999',
    marginTop: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#F44336',
    marginTop: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  retryButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 20,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  tiendaSelectorContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tiendaSelectorLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  tiendaSelectorScroll: {
    gap: 8,
  },
  tiendaChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    marginRight: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  tiendaChipSelected: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  tiendaChipText: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '500',
  },
  tiendaChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  modalForm: {
    padding: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  categoriaChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    marginRight: 8,
    marginBottom: 8,
  },
  categoriaChipSelected: {
    backgroundColor: '#4CAF50',
  },
  categoriaChipText: {
    fontSize: 14,
    color: '#000000',
  },
  categoriaChipTextSelected: {
    color: '#FFFFFF',
  },
  helperText: {
    fontSize: 12,
    color: '#999999',
    marginTop: 4,
    fontStyle: 'italic',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Estilos del Modal de Confirmación
  modalConfirmacionOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalConfirmacionContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalConfirmacionIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalConfirmacionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalConfirmacionMessage: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  modalConfirmacionProductoNombre: {
    fontWeight: '600',
    color: '#F44336',
  },
  modalConfirmacionButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalConfirmacionButtonCancel: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalConfirmacionButtonCancelText: {
    color: '#666666',
    fontSize: 16,
    fontWeight: '600',
  },
  modalConfirmacionButtonDelete: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#F44336',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  modalConfirmacionButtonDeleteText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default GestionProductosScreen;

