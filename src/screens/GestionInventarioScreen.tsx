import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  FlatList,
  Modal,
  Alert,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useInventarioAPI, Inventario } from '../hooks/useInventarioAPI';
import { useProductosAPI } from '../hooks/useProductosAPI';
import { usePerfilUsuario } from '../hooks/usePerfilUsuario';
import { useTiendasAPI } from '../hooks/useTiendasAPI';

const GestionInventarioScreen: React.FC = () => {
  const navigation = useNavigation();
  const { perfil } = usePerfilUsuario();
  const [tiendaId, setTiendaId] = useState<number | null>(null);
  const {
    inventario,
    loading,
    error,
    fetchInventario,
    crearInventario,
    actualizarInventario,
    eliminarInventario,
  } = useInventarioAPI();
  const { productos, fetchProductos } = useProductosAPI();
  const { tiendas, fetchTiendas } = useTiendasAPI();
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [itemSeleccionado, setItemSeleccionado] = useState<any>(null);
  const [mostrarModalConfirmacion, setMostrarModalConfirmacion] = useState(false);
  const [itemAEliminar, setItemAEliminar] = useState<Inventario | null>(null);

  // Formulario
  const [stock, setStock] = useState('');
  const [descripcion, setDescripcion] = useState('');

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    await fetchTiendas();
    await fetchProductos();
  };

  // Actualizar tiendaId cuando se carguen las tiendas (seleccionar la primera por defecto)
  useEffect(() => {
    if (tiendas.length > 0 && !tiendaId) {
      console.log('🏪 Seleccionando primera tienda por defecto:', tiendas[0].id_tienda);
      setTiendaId(tiendas[0].id_tienda);
    }
  }, [tiendas]);

  // Cargar inventario cuando cambie la tienda seleccionada
  useEffect(() => {
    if (tiendaId) {
      console.log('🔄 Cargando inventario para tienda:', tiendaId);
      fetchInventario(tiendaId);
    }
  }, [tiendaId, fetchInventario]);

  const abrirModalCrear = () => {
    setModoEdicion(false);
    setItemSeleccionado(null);
    limpiarFormulario();
    setMostrarModal(true);
  };

  const abrirModalEditar = (item: any) => {
    setModoEdicion(true);
    setItemSeleccionado(item);
    setStock(item.stock?.toString() || '0');
    setDescripcion(item.descripcion || '');
    setMostrarModal(true);
  };

  const limpiarFormulario = () => {
    setStock('');
    setDescripcion('');
  };

  const handleGuardar = async () => {
    console.log('💾 handleGuardar llamado', {
      modoEdicion,
      tiendaId,
      stock,
      descripcion,
    });

    // Validación: solo requerimos tiendaId y stock (según modelo Pydantic)
    if (!tiendaId) {
      console.error('❌ Error: No hay tiendaId');
      Alert.alert('Error', 'No se pudo identificar la tienda');
      return;
    }

    const stockValue = parseInt(stock) || 0;
    if (isNaN(stockValue) || stockValue < 0) {
      console.error('❌ Error: Stock inválido');
      Alert.alert('Error', 'El stock debe ser un número válido mayor o igual a 0');
      return;
    }

    try {
      if (modoEdicion && itemSeleccionado) {
        console.log('📝 Actualizando inventario:', itemSeleccionado.id_inventario);
        const resultado = await actualizarInventario(itemSeleccionado.id_inventario, {
          stock: stockValue,
          descripcion: descripcion.trim() || null,
        });
        console.log('✅ Inventario actualizado:', resultado);
      } else {
        console.log('➕ Creando nuevo inventario');
        const payload = {
          id_tienda: tiendaId,
          stock: stockValue,
          descripcion: descripcion.trim() || null,
        };
        console.log('📤 Payload:', payload);
        const resultado = await crearInventario(payload);
        console.log('✅ Inventario creado:', resultado);
        
        if (!resultado) {
          Alert.alert('Error', 'No se pudo crear el inventario. Verifica la consola para más detalles.');
          return;
        }
      }
      
      setMostrarModal(false);
      limpiarFormulario();
      if (tiendaId) {
        await fetchInventario(tiendaId);
      }
    } catch (err) {
      console.error('❌ Error en handleGuardar:', err);
      Alert.alert('Error', `No se pudo guardar el inventario: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    }
  };

  const handleEliminar = (item: Inventario) => {
    console.log('🔔 handleEliminar llamado con item:', item);
    if (!item || !item.id_inventario) {
      console.error('❌ Error: item inválido en handleEliminar:', item);
      Alert.alert('Error', 'No se pudo identificar el item a eliminar');
      return;
    }
    
    // Mostrar modal de confirmación estilizado
    setItemAEliminar(item);
    setMostrarModalConfirmacion(true);
  };

  const confirmarEliminacion = async () => {
    if (!itemAEliminar) return;
    
    console.log('✅ Usuario confirmó eliminación de inventario:', itemAEliminar.id_inventario);
    setMostrarModalConfirmacion(false);
    
    try {
      const resultado = await eliminarInventario(itemAEliminar.id_inventario);
      console.log('📊 Resultado de eliminarInventario:', resultado);
      if (resultado) {
        // La eliminación fue exitosa, actualizar la lista
        if (tiendaId) {
          await fetchInventario(tiendaId);
        }
        Alert.alert('Éxito', 'El item de inventario ha sido eliminado correctamente');
      } else {
        // La eliminación falló
        Alert.alert('Error', 'No se pudo eliminar el item de inventario. Por favor intenta nuevamente.');
      }
    } catch (err) {
      console.error('❌ Error al eliminar inventario:', err);
      Alert.alert('Error', 'Ocurrió un error al eliminar el item de inventario.');
    } finally {
      setItemAEliminar(null);
    }
  };

  const cancelarEliminacion = () => {
    console.log('❌ Eliminación cancelada');
    setMostrarModalConfirmacion(false);
    setItemAEliminar(null);
  };

  const renderItem = ({ item }: { item: Inventario }) => (
    <View style={styles.itemCard}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemNombre}>Inventario #{item.id_inventario}</Text>
        <Text style={styles.itemStock}>Stock: {item.stock}</Text>
        {item.descripcion && (
          <Text style={styles.itemDescripcion}>{item.descripcion}</Text>
        )}
        {item.fecha_actualizacion && (
          <Text style={styles.itemFecha}>
            Actualizado: {new Date(item.fecha_actualizacion).toLocaleDateString()}
          </Text>
        )}
      </View>
      <View style={styles.itemActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => abrirModalEditar(item)}
        >
          <MaterialIcons name="edit" size={20} color="#2196F3" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleEliminar(item)}
        >
          <MaterialIcons name="delete" size={20} color="#F44336" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gestión de Inventario</Text>
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
        </View>
      ) : (
        <FlatList
          data={inventario}
          renderItem={renderItem}
          keyExtractor={(item) => item.id_inventario.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons name="inventory-2" size={64} color="#CCCCCC" />
              <Text style={styles.emptyText}>
                {tiendaId 
                  ? 'No hay items en el inventario de esta tienda'
                  : 'Selecciona una tienda para ver su inventario'}
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
                {modoEdicion ? 'Editar Inventario' : 'Nuevo Item de Inventario'}
              </Text>
              <TouchableOpacity onPress={() => setMostrarModal(false)}>
                <MaterialIcons name="close" size={24} color="#000000" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalForm}>
              <Text style={styles.label}>Stock *</Text>
              <TextInput
                style={styles.input}
                value={stock}
                onChangeText={setStock}
                placeholder="0"
                keyboardType="numeric"
              />

              <Text style={styles.label}>Descripción</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={descripcion}
                onChangeText={setDescripcion}
                placeholder="Descripción del item"
                multiline
                numberOfLines={3}
              />

              <TouchableOpacity style={styles.saveButton} onPress={handleGuardar}>
                <Text style={styles.saveButtonText}>Guardar</Text>
              </TouchableOpacity>
            </View>
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
              ¿Eliminar item de inventario?
            </Text>
            <Text style={styles.modalConfirmacionMessage}>
              Estás a punto de eliminar el item de inventario{' '}
              <Text style={styles.modalConfirmacionItemNombre}>
                #{itemAEliminar?.id_inventario}
              </Text>
              {' '}con stock de{' '}
              <Text style={styles.modalConfirmacionItemNombre}>
                {itemAEliminar?.stock}
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
  listContent: {
    padding: 16,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemInfo: {
    flex: 1,
  },
  itemNombre: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  itemStock: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  itemDescripcion: {
    fontSize: 12,
    color: '#999999',
  },
  itemFecha: {
    fontSize: 11,
    color: '#999999',
    marginTop: 4,
    fontStyle: 'italic',
  },
  itemActions: {
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
  productoSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  productoChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    marginBottom: 8,
  },
  productoChipSelected: {
    backgroundColor: '#4CAF50',
  },
  productoChipText: {
    fontSize: 14,
    color: '#000000',
  },
  productoChipTextSelected: {
    color: '#FFFFFF',
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
  modalConfirmacionItemNombre: {
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

export default GestionInventarioScreen;

