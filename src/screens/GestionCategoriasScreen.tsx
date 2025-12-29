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
import { useCategoriasAPI } from '../hooks/useCategoriasAPI';
import { useTiendasAPI } from '../hooks/useTiendasAPI';

const GestionCategoriasScreen: React.FC = () => {
  const navigation = useNavigation();
  const [tiendaId, setTiendaId] = useState<number | null>(null);
  const {
    categorias,
    loading,
    error,
    fetchCategorias,
    crearCategoria,
    actualizarCategoria,
    eliminarCategoria,
  } = useCategoriasAPI();
  const { tiendas, fetchTiendas } = useTiendasAPI();
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<any>(null);
  const [mostrarModalConfirmacion, setMostrarModalConfirmacion] = useState(false);
  const [categoriaAEliminar, setCategoriaAEliminar] = useState<any>(null);

  // Formulario
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');

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

  // Cargar categorías cuando cambie la tienda seleccionada
  useEffect(() => {
    if (tiendaId) {
      console.log('🔄 Cargando categorías para tienda:', tiendaId);
      fetchCategorias(tiendaId);
    }
  }, [tiendaId, fetchCategorias]);

  const abrirModalCrear = () => {
    setModoEdicion(false);
    setCategoriaSeleccionada(null);
    limpiarFormulario();
    setMostrarModal(true);
  };

  const abrirModalEditar = (categoria: any) => {
    setModoEdicion(true);
    setCategoriaSeleccionada(categoria);
    setNombre(categoria.nombre || '');
    setDescripcion(categoria.descripcion || '');
    setMostrarModal(true);
  };

  const limpiarFormulario = () => {
    setNombre('');
    setDescripcion('');
  };

  const handleGuardar = async () => {
    if (!nombre.trim()) {
      Alert.alert('Error', 'El nombre de la categoría es obligatorio');
      return;
    }

    if (!tiendaId) {
      Alert.alert('Error', 'No se pudo identificar la tienda');
      return;
    }

    try {
      if (modoEdicion && categoriaSeleccionada) {
        console.log('📝 Actualizando categoría:', categoriaSeleccionada.id_categoria);
        const resultado = await actualizarCategoria(categoriaSeleccionada.id_categoria, {
          nombre: nombre.trim(),
          descripcion: descripcion.trim() || null,
        });
        console.log('✅ Categoría actualizada:', resultado);
      } else {
        console.log('➕ Creando nueva categoría');
        const payload = {
          id_tienda: tiendaId,
          nombre: nombre.trim(),
          descripcion: descripcion.trim() || null,
        };
        console.log('📤 Payload:', payload);
        const resultado = await crearCategoria(payload);
        console.log('✅ Categoría creada:', resultado);
        
        if (!resultado) {
          Alert.alert('Error', 'No se pudo crear la categoría. Verifica la consola para más detalles.');
          return;
        }
      }
      setMostrarModal(false);
      limpiarFormulario();
      if (tiendaId) {
        await fetchCategorias(tiendaId);
      }
    } catch (err) {
      console.error('❌ Error en handleGuardar:', err);
      Alert.alert('Error', `No se pudo guardar la categoría: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    }
  };

  const handleEliminar = (categoria: any) => {
    console.log('🔔 handleEliminar llamado con categoría:', categoria);
    if (!categoria || !categoria.id_categoria) {
      console.error('❌ Error: categoría inválida en handleEliminar:', categoria);
      Alert.alert('Error', 'No se pudo identificar la categoría a eliminar');
      return;
    }
    
    // Mostrar modal de confirmación estilizado
    setCategoriaAEliminar(categoria);
    setMostrarModalConfirmacion(true);
  };

  const confirmarEliminacion = async () => {
    if (!categoriaAEliminar) return;
    
    console.log('✅ Usuario confirmó eliminación de categoría:', categoriaAEliminar.id_categoria);
    setMostrarModalConfirmacion(false);
    
    try {
      const resultado = await eliminarCategoria(categoriaAEliminar.id_categoria);
      console.log('📊 Resultado de eliminarCategoria:', resultado);
      if (resultado) {
        // La eliminación fue exitosa, actualizar la lista
        if (tiendaId) {
          await fetchCategorias(tiendaId);
        }
        Alert.alert('Éxito', 'La categoría ha sido eliminada correctamente');
      } else {
        // La eliminación falló
        Alert.alert('Error', 'No se pudo eliminar la categoría. Por favor intenta nuevamente.');
      }
    } catch (err) {
      console.error('❌ Error al eliminar categoría:', err);
      Alert.alert('Error', 'Ocurrió un error al eliminar la categoría.');
    } finally {
      setCategoriaAEliminar(null);
    }
  };

  const cancelarEliminacion = () => {
    console.log('❌ Eliminación cancelada');
    setMostrarModalConfirmacion(false);
    setCategoriaAEliminar(null);
  };

  const renderCategoria = ({ item }: { item: any }) => (
    <View style={styles.categoriaCard}>
      <View style={styles.categoriaInfo}>
        <Text style={styles.categoriaNombre}>{item.nombre}</Text>
        {item.descripcion && (
          <Text style={styles.categoriaDescripcion} numberOfLines={2}>
            {item.descripcion}
          </Text>
        )}
      </View>
      <View style={styles.categoriaActions}>
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
            console.log('🗑️ onPress - Botón de eliminar presionado para categoría:', item.id_categoria, item.nombre);
            if (!item || !item.id_categoria) {
              console.error('❌ Item inválido:', item);
              return;
            }
            handleEliminar(item);
          }}
          activeOpacity={0.7}
          testID={`delete-button-${item.id_categoria}`}
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
        <Text style={styles.headerTitle}>Gestión de Categorías</Text>
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
          data={categorias}
          renderItem={renderCategoria}
          keyExtractor={(item) => item.id_categoria.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons name="category" size={64} color="#CCCCCC" />
              <Text style={styles.emptyText}>
                {tiendaId 
                  ? 'No hay categorías en esta tienda'
                  : 'Selecciona una tienda para ver sus categorías'}
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
                {modoEdicion ? 'Editar Categoría' : 'Nueva Categoría'}
              </Text>
              <TouchableOpacity onPress={() => setMostrarModal(false)}>
                <MaterialIcons name="close" size={24} color="#000000" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalForm}>
              <Text style={styles.label}>Nombre *</Text>
              <TextInput
                style={styles.input}
                value={nombre}
                onChangeText={setNombre}
                placeholder="Nombre de la categoría"
              />

              <Text style={styles.label}>Descripción</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={descripcion}
                onChangeText={setDescripcion}
                placeholder="Descripción de la categoría"
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
              ¿Eliminar categoría?
            </Text>
            <Text style={styles.modalConfirmacionMessage}>
              Estás a punto de eliminar la categoría{' '}
              <Text style={styles.modalConfirmacionCategoriaNombre}>
                "{categoriaAEliminar?.nombre}"
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
  categoriaCard: {
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
  categoriaInfo: {
    flex: 1,
  },
  categoriaNombre: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  categoriaDescripcion: {
    fontSize: 14,
    color: '#666666',
  },
  categoriaActions: {
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
  modalConfirmacionCategoriaNombre: {
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

export default GestionCategoriasScreen;

