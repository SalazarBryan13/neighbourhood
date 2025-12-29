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
  Modal,
  Alert,
  FlatList,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTiendasAPI } from '../hooks/useTiendasAPI';

const GestionTiendaScreen: React.FC = () => {
  const navigation = useNavigation();
  const {
    tiendas,
    loading,
    error,
    fetchTiendas,
    crearTienda,
    actualizarTienda,
    eliminarTienda,
  } = useTiendasAPI();
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [tiendaSeleccionada, setTiendaSeleccionada] = useState<any>(null);
  const [mostrarModalConfirmacion, setMostrarModalConfirmacion] = useState(false);
  const [tiendaAEliminar, setTiendaAEliminar] = useState<any>(null);

  // Formulario
  const [nombre_tienda, setNombreTienda] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [estado, setEstado] = useState('activo');
  const [imagen_url, setImagenUrl] = useState('');

  useEffect(() => {
    console.log('📱 GestionTiendaScreen montado, cargando tiendas...');
    fetchTiendas().catch(err => {
      console.error('❌ Error al cargar tiendas en useEffect:', err);
    });
  }, [fetchTiendas]);

  const abrirModalCrear = () => {
    setModoEdicion(false);
    setTiendaSeleccionada(null);
    limpiarFormulario();
    setMostrarModal(true);
  };

  const abrirModalEditar = (tienda: any) => {
    setModoEdicion(true);
    setTiendaSeleccionada(tienda);
    setNombreTienda(tienda.nombre_tienda || '');
    setDescripcion(tienda.descripcion || '');
    setTelefono(tienda.telefono || '');
    setDireccion(tienda.direccion || '');
    setEstado(tienda.estado || 'activo');
    setImagenUrl(tienda.imagen_url || '');
    setMostrarModal(true);
  };

  const limpiarFormulario = () => {
    setNombreTienda('');
    setDescripcion('');
    setTelefono('');
    setDireccion('');
    setEstado('activo');
    setImagenUrl('');
  };

  const handleGuardar = async () => {
    if (!nombre_tienda.trim()) {
      Alert.alert('Error', 'El nombre de la tienda es obligatorio');
      return;
    }

    try {
      if (modoEdicion && tiendaSeleccionada) {
        await actualizarTienda(tiendaSeleccionada.id_tienda, {
          nombre_tienda: nombre_tienda.trim(),
          descripcion: descripcion.trim() || undefined,
          telefono: telefono.trim() || undefined,
          direccion: direccion.trim() || undefined,
          estado,
          imagen_url: imagen_url.trim() || undefined,
        });
      } else {
        await crearTienda({
          nombre_tienda: nombre_tienda.trim(),
          descripcion: descripcion.trim() || undefined,
          telefono: telefono.trim() || undefined,
          direccion: direccion.trim() || undefined,
          estado,
          imagen_url: imagen_url.trim() || undefined,
        });
      }
      setMostrarModal(false);
      await fetchTiendas();
    } catch (err) {
      Alert.alert('Error', 'No se pudo guardar la tienda');
    }
  };

  const handleEliminar = (tienda: any) => {
    console.log('🔔 handleEliminar llamado con tienda:', tienda);
    if (!tienda || !tienda.id_tienda) {
      console.error('❌ Error: tienda inválida en handleEliminar:', tienda);
      Alert.alert('Error', 'No se pudo identificar la tienda a eliminar');
      return;
    }
    
    // Mostrar modal de confirmación estilizado
    setTiendaAEliminar(tienda);
    setMostrarModalConfirmacion(true);
  };

  const confirmarEliminacion = async () => {
    if (!tiendaAEliminar) return;
    
    console.log('✅ Usuario confirmó eliminación de tienda:', tiendaAEliminar.id_tienda);
    setMostrarModalConfirmacion(false);
    
    try {
      const resultado = await eliminarTienda(tiendaAEliminar.id_tienda);
      console.log('📊 Resultado de eliminarTienda:', resultado);
      if (resultado) {
        // La eliminación fue exitosa, actualizar la lista
        await fetchTiendas();
        Alert.alert('Éxito', 'La tienda ha sido eliminada correctamente');
      } else {
        // La eliminación falló
        Alert.alert('Error', 'No se pudo eliminar la tienda. Por favor intenta nuevamente.');
      }
    } catch (err) {
      console.error('❌ Error al eliminar tienda:', err);
      Alert.alert('Error', 'Ocurrió un error al eliminar la tienda.');
    } finally {
      setTiendaAEliminar(null);
    }
  };

  const cancelarEliminacion = () => {
    console.log('❌ Eliminación cancelada');
    setMostrarModalConfirmacion(false);
    setTiendaAEliminar(null);
  };

  const renderTienda = ({ item }: { item: any }) => (
    <View style={styles.tiendaCard}>
      <View style={styles.tiendaInfo}>
        <Text style={styles.tiendaNombre}>{item.nombre_tienda}</Text>
        {item.descripcion && (
          <Text style={styles.tiendaDescripcion} numberOfLines={2}>
            {item.descripcion}
          </Text>
        )}
        <View style={styles.tiendaDetails}>
          {item.telefono && (
            <View style={styles.detailRow}>
              <MaterialIcons name="phone" size={16} color="#666666" />
              <Text style={styles.detailText}>{item.telefono}</Text>
            </View>
          )}
          {item.direccion && (
            <View style={styles.detailRow}>
              <MaterialIcons name="location-on" size={16} color="#666666" />
              <Text style={styles.detailText} numberOfLines={1}>
                {item.direccion}
              </Text>
            </View>
          )}
          <View style={styles.detailRow}>
            <MaterialIcons name="info" size={16} color="#666666" />
            <Text style={styles.detailText}>Estado: {item.estado}</Text>
          </View>
        </View>
      </View>
      <View style={styles.tiendaActions}>
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
            console.log('🗑️ onPress - Botón de eliminar presionado para tienda:', item.id_tienda, item.nombre_tienda);
            if (!item || !item.id_tienda) {
              console.error('❌ Item inválido:', item);
              return;
            }
            handleEliminar(item);
          }}
          activeOpacity={0.7}
          testID={`delete-button-${item.id_tienda}`}
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
        <Text style={styles.headerTitle}>Gestión de Tiendas</Text>
        <TouchableOpacity onPress={abrirModalCrear}>
          <MaterialIcons name="add" size={24} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Cargando tiendas...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={48} color="#F44336" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => fetchTiendas()}>
            <MaterialIcons name="refresh" size={20} color="#FFFFFF" />
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={tiendas}
          renderItem={renderTienda}
          keyExtractor={(item) => item.id_tienda.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No hay tiendas</Text>
              <TouchableOpacity style={styles.emptyButton} onPress={abrirModalCrear}>
                <Text style={styles.emptyButtonText}>Crear primera tienda</Text>
              </TouchableOpacity>
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
                {modoEdicion ? 'Editar Tienda' : 'Nueva Tienda'}
              </Text>
              <TouchableOpacity onPress={() => setMostrarModal(false)}>
                <MaterialIcons name="close" size={24} color="#000000" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <Text style={styles.label}>Nombre de la Tienda *</Text>
              <TextInput
                style={styles.input}
                value={nombre_tienda}
                onChangeText={setNombreTienda}
                placeholder="Nombre de la tienda"
              />

              <Text style={styles.label}>Descripción</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={descripcion}
                onChangeText={setDescripcion}
                placeholder="Descripción de la tienda"
                multiline
                numberOfLines={3}
              />

              <Text style={styles.label}>Teléfono</Text>
              <TextInput
                style={styles.input}
                value={telefono}
                onChangeText={setTelefono}
                placeholder="Teléfono"
                keyboardType="phone-pad"
              />

              <Text style={styles.label}>Dirección</Text>
              <TextInput
                style={styles.input}
                value={direccion}
                onChangeText={setDireccion}
                placeholder="Dirección"
              />

              <Text style={styles.label}>Estado</Text>
              <View style={styles.estadoSelector}>
                <TouchableOpacity
                  style={[
                    styles.estadoChip,
                    estado === 'activo' && styles.estadoChipSelected,
                  ]}
                  onPress={() => setEstado('activo')}
                >
                  <Text
                    style={[
                      styles.estadoChipText,
                      estado === 'activo' && styles.estadoChipTextSelected,
                    ]}
                  >
                    Activo
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.estadoChip,
                    estado === 'inactivo' && styles.estadoChipSelected,
                  ]}
                  onPress={() => setEstado('inactivo')}
                >
                  <Text
                    style={[
                      styles.estadoChipText,
                      estado === 'inactivo' && styles.estadoChipTextSelected,
                    ]}
                  >
                    Inactivo
                  </Text>
                </TouchableOpacity>
              </View>

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
              ¿Eliminar tienda?
            </Text>
            <Text style={styles.modalConfirmacionMessage}>
              Estás a punto de eliminar la tienda{' '}
              <Text style={styles.modalConfirmacionTiendaNombre}>
                "{tiendaAEliminar?.nombre_tienda}"
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
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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
  tiendaCard: {
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
  tiendaInfo: {
    flex: 1,
  },
  tiendaNombre: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  tiendaDescripcion: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 12,
  },
  tiendaDetails: {
    gap: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#666666',
  },
  tiendaActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    minWidth: 40,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999999',
    marginBottom: 16,
  },
  emptyButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
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
  estadoSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  estadoChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  estadoChipSelected: {
    backgroundColor: '#4CAF50',
  },
  estadoChipText: {
    fontSize: 14,
    color: '#000000',
  },
  estadoChipTextSelected: {
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
  modalConfirmacionTiendaNombre: {
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

export default GestionTiendaScreen;

