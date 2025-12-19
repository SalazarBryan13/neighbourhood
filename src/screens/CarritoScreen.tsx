import React, { useState, useEffect } from 'react';
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
  ScrollView,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useCarrito } from '../hooks/useCarrito';
import { usePedidos } from '../hooks/usePedidos';
import { useDirecciones } from '../hooks/useDirecciones';
import { supabase } from '../lib/supabaseClient';

const CarritoScreen: React.FC = () => {
  const navigation = useNavigation();
  const { carrito, loading, total, cantidadItems, actualizarCantidad, eliminarDelCarrito, refetch } = useCarrito();
  const { crearPedido, obtenerPedidos, loading: pedidoLoading, error } = usePedidos();
  const { direcciones, loading: direccionesLoading, refetch: refetchDirecciones } = useDirecciones();
  
  const [showDirecciones, setShowDirecciones] = useState(false);
  const [direccionSeleccionada, setDireccionSeleccionada] = useState<number | null>(null);
  const [tiendaId, setTiendaId] = useState<number | null>(null);
  const [mostrarHistorial, setMostrarHistorial] = useState(false);
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [loadingPedidos, setLoadingPedidos] = useState(false);
  const [errorPedido, setErrorPedido] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: number; nombre: string } | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [pedidoConfirmado, setPedidoConfirmado] = useState<any>(null);

  // Log de renderizado (solo cuando cambian valores importantes)
  useEffect(() => {
    if (carrito.length > 0 || direccionSeleccionada || tiendaId) {
      console.log('🔄 CarritoScreen renderizado:', {
        carritoLength: carrito.length,
        direccionSeleccionada,
        tiendaId,
        total,
        pedidoLoading
      });
    }
  }, [carrito.length, direccionSeleccionada, tiendaId, total, pedidoLoading]);

  useEffect(() => {
    // Obtener tienda del primer producto del carrito
    if (carrito.length > 0 && carrito[0].producto?.inventario?.id_tienda) {
      setTiendaId(carrito[0].producto.inventario.id_tienda);
    }
  }, [carrito]);

  const handleActualizarCantidad = async (idCarrito: number, cantidad: number, nuevaCantidad: number) => {
    await actualizarCantidad(idCarrito, nuevaCantidad);
  };

  const handleEliminar = (idCarrito: number, nombreProducto: string) => {
    console.log('🗑️ handleEliminar llamado:', { idCarrito, nombreProducto });
    setItemToDelete({ id: idCarrito, nombre: nombreProducto });
    setShowDeleteModal(true);
  };

  const confirmarEliminar = async () => {
    if (!itemToDelete) return;

    console.log('✅ Confirmado eliminar, ejecutando eliminarDelCarrito...');
    setShowDeleteModal(false);
    
    try {
      const result = await eliminarDelCarrito(itemToDelete.id);
      console.log('📦 Resultado de eliminarDelCarrito:', result);
      if (!result) {
        console.error('❌ eliminarDelCarrito retornó false');
        setErrorPedido('No se pudo eliminar el producto del carrito');
      } else {
        setItemToDelete(null);
      }
    } catch (err) {
      console.error('❌ Error al eliminar:', err);
      setErrorPedido(`Error al eliminar: ${err instanceof Error ? err.message : 'Error desconocido'}`);
      setItemToDelete(null);
    }
  };

  const handleConfirmarPedido = () => {
    console.log('🛒 handleConfirmarPedido llamado');
    console.log('📊 Estado actual:', {
      carritoLength: carrito.length,
      direccionSeleccionada,
      tiendaId,
      total,
      pedidoLoading
    });

    // Limpiar error anterior
    setErrorPedido(null);

    if (carrito.length === 0) {
      console.log('❌ Carrito vacío');
      setErrorPedido('El carrito está vacío');
      return;
    }

    if (!direccionSeleccionada) {
      console.log('❌ No hay dirección seleccionada');
      setErrorPedido('Por favor selecciona una dirección de entrega');
      setShowDirecciones(true);
      return;
    }

    // Obtener tienda del primer producto (asumiendo todos son de la misma tienda)
    // Esto debería mejorarse para validar que todos los productos sean de la misma tienda
    if (!tiendaId) {
      console.log('❌ No hay tiendaId');
      setErrorPedido('No se pudo determinar la tienda. Verifica que los productos tengan una tienda asignada.');
      return;
    }

    console.log('✅ Validaciones pasadas, mostrando Modal de confirmación');
    // Mostrar modal de confirmación en lugar de Alert
    setShowConfirmModal(true);
  };

  const confirmarPedidoDirecto = async () => {
    console.log('🚀 confirmarPedidoDirecto INICIADO');
    setErrorPedido(null);
    console.log('=== INICIANDO CONFIRMACIÓN DE PEDIDO ===');
    console.log('Tienda ID:', tiendaId);
    console.log('Dirección ID:', direccionSeleccionada);
    console.log('Total:', total);
    console.log('Items en carrito:', carrito.length);
    console.log('Carrito completo:', JSON.stringify(carrito, null, 2));
    
    try {
      console.log('📞 Llamando a crearPedido...');
      const pedido = await crearPedido(tiendaId!, direccionSeleccionada!);
      console.log('📦 Respuesta de crearPedido:', pedido);
      
      // Esperar un momento para que el estado de error se actualice
      await new Promise(resolve => setTimeout(resolve, 300));
      
      if (pedido) {
        console.log('✅ Pedido confirmado exitosamente:', pedido.id_pedido);
        setErrorPedido(null);
        setPedidoConfirmado(pedido);
        setShowSuccessModal(true);
        // Refrescar el carrito (debería estar vacío ahora)
        refetch();
        // Redirigir al historial después de un breve delay
        setTimeout(() => {
          setMostrarHistorial(true);
          cargarHistorial();
        }, 1500);
      } else {
        console.log('⚠️ crearPedido retornó null/undefined');
        // Obtener el error del hook después de esperar
        await new Promise(resolve => setTimeout(resolve, 500));
        const errorMsg = error || 'No se pudo crear el pedido. Por favor intenta nuevamente.';
        console.error('❌ Error al crear pedido. Error del hook:', error);
        console.error('❌ Mensaje de error final:', errorMsg);
        setErrorPedido(errorMsg);
        // También mostrar en Alert para asegurar que se vea
        Alert.alert('Error al crear pedido', errorMsg);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error inesperado al crear el pedido';
      console.error('❌ Excepción al crear pedido:', err);
      console.error('❌ Stack trace:', err instanceof Error ? err.stack : 'N/A');
      setErrorPedido(errorMsg);
      Alert.alert('Error', errorMsg);
    }
  };

  const cargarHistorial = async () => {
    setLoadingPedidos(true);
    const pedidosData = await obtenerPedidos();
    setPedidos(pedidosData);
    setLoadingPedidos(false);
  };

  const renderItemCarrito = ({ item }: { item: any }) => (
    <View style={styles.itemCarrito}>
      {item.producto?.imagen_url ? (
        <Image source={{ uri: item.producto.imagen_url }} style={styles.itemImagen} />
      ) : (
        <View style={styles.itemImagenPlaceholder}>
          <MaterialIcons name="image" size={32} color="#CCCCCC" />
        </View>
      )}
      <View style={styles.itemInfo}>
        <Text style={styles.itemNombre} numberOfLines={2}>
          {item.producto?.nombre || 'Producto'}
        </Text>
        <Text style={styles.itemPrecio}>
          ${item.precio_unitario.toFixed(2)} c/u
        </Text>
        <View style={styles.cantidadContainer}>
          <TouchableOpacity
            style={styles.cantidadButton}
            onPress={() => handleActualizarCantidad(item.id_carrito, item.cantidad, item.cantidad - 1)}
          >
            <MaterialIcons name="remove" size={20} color="#4CAF50" />
          </TouchableOpacity>
          <Text style={styles.cantidadText}>{item.cantidad}</Text>
          <TouchableOpacity
            style={styles.cantidadButton}
            onPress={() => handleActualizarCantidad(item.id_carrito, item.cantidad, item.cantidad + 1)}
          >
            <MaterialIcons name="add" size={20} color="#4CAF50" />
          </TouchableOpacity>
        </View>
        <Text style={styles.itemSubtotal}>
          Subtotal: ${item.subtotal.toFixed(2)}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.eliminarButton}
        onPress={() => {
          console.log('👆 Botón eliminar presionado para item:', item.id_carrito);
          handleEliminar(item.id_carrito, item.producto?.nombre || 'Producto');
        }}
        activeOpacity={0.7}
      >
        <MaterialIcons name="delete-outline" size={24} color="#F44336" />
      </TouchableOpacity>
    </View>
  );

  const renderPedido = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.pedidoCard}
      onPress={() => {
        console.log('👆 Pedido presionado:', item.id_pedido);
        (navigation as any).navigate('DetallePedido', {
          pedidoId: item.id_pedido,
          pedido: item,
        });
      }}
      activeOpacity={0.7}
    >
      <View style={styles.pedidoHeader}>
        <Text style={styles.pedidoId}>Pedido #{item.id_pedido}</Text>
        <View style={[styles.estadoBadge, { backgroundColor: getEstadoColor(item.estado) }]}>
          <Text style={styles.estadoText}>{item.estado}</Text>
        </View>
      </View>
      <Text style={styles.pedidoFecha}>
        {new Date(item.fecha_pedido).toLocaleDateString('es-ES')}
      </Text>
      <Text style={styles.pedidoTotal}>Total: ${item.total.toFixed(2)}</Text>
      {item.tienda && (
        <Text style={styles.pedidoTienda}>{item.tienda.nombre_tienda}</Text>
      )}
      <View style={styles.pedidoFooter}>
        <MaterialIcons name="chevron-right" size={24} color="#4CAF50" />
        <Text style={styles.verDetalleText}>Ver detalles</Text>
      </View>
    </TouchableOpacity>
  );

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

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color="#000000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Carrito</Text>
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
        <View style={styles.headerTabs}>
          <TouchableOpacity
            style={[styles.tab, !mostrarHistorial && styles.tabActive]}
            onPress={() => setMostrarHistorial(false)}
          >
            <Text style={[styles.tabText, !mostrarHistorial && styles.tabTextActive]}>
              Carrito ({cantidadItems})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, mostrarHistorial && styles.tabActive]}
            onPress={() => {
              setMostrarHistorial(true);
              cargarHistorial();
            }}
          >
            <Text style={[styles.tabText, mostrarHistorial && styles.tabTextActive]}>
              Historial
            </Text>
          </TouchableOpacity>
        </View>
        <View style={{ width: 24 }} />
      </View>

      {mostrarHistorial ? (
        <View style={styles.content}>
          {loadingPedidos ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4CAF50" />
            </View>
          ) : pedidos.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="receipt-long" size={64} color="#CCCCCC" />
              <Text style={styles.emptyText}>No tienes pedidos aún</Text>
            </View>
          ) : (
            <FlatList
              data={pedidos}
              renderItem={renderPedido}
              keyExtractor={(item) => item.id_pedido.toString()}
              contentContainerStyle={styles.listContainer}
            />
          )}
        </View>
      ) : (
        <View style={styles.content}>
          {carrito.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="shopping-cart" size={64} color="#CCCCCC" />
              <Text style={styles.emptyText}>Tu carrito está vacío</Text>
              <TouchableOpacity
                style={styles.continuarButton}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.continuarButtonText}>Continuar comprando</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <FlatList
                data={carrito}
                renderItem={renderItemCarrito}
                keyExtractor={(item) => item.id_carrito.toString()}
                contentContainerStyle={styles.listContainer}
              />
              <View style={styles.footer}>
                {(errorPedido || error) && (
                  <View style={styles.errorContainer}>
                    <MaterialIcons name="error-outline" size={20} color="#F44336" />
                    <Text style={styles.errorText}>
                      {errorPedido || error || 'Error desconocido'}
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        setErrorPedido(null);
                      }}
                      style={styles.errorCloseButton}
                    >
                      <MaterialIcons name="close" size={18} color="#F44336" />
                    </TouchableOpacity>
                  </View>
                )}
                <View style={styles.totalContainer}>
                  <Text style={styles.totalLabel}>Total:</Text>
                  <Text style={styles.totalAmount}>${total.toFixed(2)}</Text>
                </View>
                <TouchableOpacity
                  style={styles.direccionButton}
                  onPress={() => {
                    refetchDirecciones();
                    setShowDirecciones(true);
                  }}
                >
                  <MaterialIcons name="location-on" size={20} color="#4CAF50" />
                  <Text style={styles.direccionButtonText}>
                    {direccionSeleccionada
                      ? direcciones.find(d => d.id_direccion === direccionSeleccionada)?.direccion || 'Seleccionar dirección'
                      : 'Seleccionar dirección'}
                  </Text>
                  <MaterialIcons name="arrow-drop-down" size={20} color="#4CAF50" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.confirmarButton, (!direccionSeleccionada || pedidoLoading) && styles.confirmarButtonDisabled]}
                  onPress={() => {
                    console.log('👆 Botón Confirmar Pedido presionado');
                    console.log('Estado del botón:', {
                      direccionSeleccionada,
                      pedidoLoading,
                      disabled: !direccionSeleccionada || pedidoLoading
                    });
                    if (!direccionSeleccionada) {
                      console.log('⚠️ Botón deshabilitado: no hay dirección');
                      setErrorPedido('Por favor selecciona una dirección de entrega');
                      setShowDirecciones(true);
                      return;
                    }
                    if (pedidoLoading) {
                      console.log('⚠️ Botón deshabilitado: cargando...');
                      return;
                    }
                    handleConfirmarPedido();
                  }}
                  disabled={!direccionSeleccionada || pedidoLoading}
                  activeOpacity={0.7}
                >
                  {pedidoLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.confirmarButtonText}>Confirmar Pedido</Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      )}

      {/* Modal de direcciones */}
      <Modal
        visible={showDirecciones}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDirecciones(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar dirección</Text>
              <TouchableOpacity onPress={() => setShowDirecciones(false)}>
                <MaterialIcons name="close" size={24} color="#000000" />
              </TouchableOpacity>
            </View>
            {direccionesLoading ? (
              <View style={styles.modalLoading}>
                <ActivityIndicator size="large" color="#4CAF50" />
              </View>
            ) : direcciones.length === 0 ? (
              <View style={styles.modalEmpty}>
                <Text style={styles.modalEmptyText}>No tienes direcciones guardadas</Text>
                <Text style={styles.modalEmptySubtext}>Agrega una dirección en tu perfil</Text>
              </View>
            ) : (
              <FlatList
                data={direcciones}
                keyExtractor={(item) => item.id_direccion.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.direccionItem,
                      direccionSeleccionada === item.id_direccion && styles.direccionItemSelected,
                    ]}
                    onPress={() => {
                      setDireccionSeleccionada(item.id_direccion);
                      setShowDirecciones(false);
                    }}
                  >
                    <MaterialIcons
                      name={direccionSeleccionada === item.id_direccion ? 'radio-button-checked' : 'radio-button-unchecked'}
                      size={24}
                      color={direccionSeleccionada === item.id_direccion ? '#4CAF50' : '#CCCCCC'}
                    />
                    <View style={styles.direccionItemInfo}>
                      <Text style={styles.direccionItemText}>{item.direccion}</Text>
                      {item.referencia && (
                        <Text style={styles.direccionItemReferencia}>{item.referencia}</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </View>
      </Modal>

      {/* Modal de confirmación de eliminación */}
      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setShowDeleteModal(false);
          setItemToDelete(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalConfirmContent}>
            <Text style={styles.modalConfirmTitle}>Eliminar producto</Text>
            <Text style={styles.modalConfirmText}>
              ¿Deseas eliminar {itemToDelete?.nombre || 'este producto'} del carrito?
            </Text>
            <View style={styles.modalConfirmButtons}>
              <TouchableOpacity
                style={[styles.modalConfirmButton, styles.modalCancelButton]}
                onPress={() => {
                  console.log('❌ Eliminación cancelada');
                  setShowDeleteModal(false);
                  setItemToDelete(null);
                }}
              >
                <Text style={styles.modalCancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalConfirmButton, styles.modalDeleteButton]}
                onPress={confirmarEliminar}
              >
                <Text style={styles.modalDeleteButtonText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de éxito de pedido confirmado */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setShowSuccessModal(false);
          setPedidoConfirmado(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSuccessContent}>
            <View style={styles.successIconContainer}>
              <MaterialIcons name="check-circle" size={64} color="#4CAF50" />
            </View>
            <Text style={styles.modalSuccessTitle}>¡Pedido confirmado!</Text>
            <Text style={styles.modalSuccessText}>
              Tu pedido #{pedidoConfirmado?.id_pedido || ''} ha sido creado exitosamente
            </Text>
            <Text style={styles.modalSuccessSubtext}>
              Redirigiendo al historial...
            </Text>
            <TouchableOpacity
              style={[styles.modalConfirmButton, styles.modalConfirmButtonPrimary]}
              onPress={() => {
                console.log('✅ Usuario presionó OK en modal de éxito');
                setShowSuccessModal(false);
                setPedidoConfirmado(null);
                setDireccionSeleccionada(null);
                setErrorPedido(null);
                setMostrarHistorial(true);
                cargarHistorial();
              }}
            >
              <Text style={styles.modalConfirmButtonText}>Ver historial</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal de confirmación de pedido */}
      <Modal
        visible={showConfirmModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalConfirmContent}>
            <Text style={styles.modalConfirmTitle}>Confirmar pedido</Text>
            <Text style={styles.modalConfirmText}>
              ¿Deseas confirmar este pedido por un total de ${total.toFixed(2)}?
            </Text>
            <View style={styles.modalConfirmButtons}>
              <TouchableOpacity
                style={[styles.modalConfirmButton, styles.modalCancelButton]}
                onPress={() => {
                  console.log('❌ Confirmación cancelada');
                  setShowConfirmModal(false);
                }}
              >
                <Text style={styles.modalCancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalConfirmButton, styles.modalConfirmButtonPrimary]}
                onPress={async () => {
                  console.log('✅ Confirmado, ejecutando confirmarPedidoDirecto...');
                  console.log('🔍 Valores antes de ejecutar:', { tiendaId, direccionSeleccionada, total });
                  setShowConfirmModal(false);
                  await confirmarPedidoDirecto();
                }}
              >
                <Text style={styles.modalConfirmButtonText}>Confirmar</Text>
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
  headerTabs: {
    flexDirection: 'row',
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#E8F5E9',
  },
  tabText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
  },
  itemCarrito: {
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
  itemImagen: {
    width: 80,
    height: 80,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  itemImagenPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemNombre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  itemPrecio: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  cantidadContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cantidadButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cantidadText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginHorizontal: 16,
    minWidth: 30,
    textAlign: 'center',
  },
  itemSubtotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  eliminarButton: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#C62828',
    marginLeft: 8,
    marginRight: 8,
  },
  errorCloseButton: {
    padding: 4,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
  direccionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  direccionButtonText: {
    flex: 1,
    fontSize: 14,
    color: '#000000',
    marginLeft: 8,
  },
  confirmarButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  confirmarButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  confirmarButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
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
  continuarButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    minWidth: 200,
    alignItems: 'center',
  },
  continuarButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  pedidoCard: {
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
  pedidoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  pedidoId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  pedidoEstado: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
    textTransform: 'capitalize',
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
  pedidoFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  verDetalleText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
    marginLeft: 4,
  },
  pedidoFecha: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  pedidoTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  pedidoTienda: {
    fontSize: 14,
    color: '#666666',
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
    maxHeight: '80%',
    paddingBottom: 32,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  modalLoading: {
    padding: 32,
    alignItems: 'center',
  },
  modalEmpty: {
    padding: 32,
    alignItems: 'center',
  },
  modalEmptyText: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 8,
  },
  modalEmptySubtext: {
    fontSize: 14,
    color: '#999999',
  },
  direccionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  direccionItemSelected: {
    backgroundColor: '#E8F5E9',
  },
  direccionItemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  direccionItemText: {
    fontSize: 16,
    color: '#000000',
    marginBottom: 4,
  },
  direccionItemReferencia: {
    fontSize: 12,
    color: '#666666',
  },
  modalConfirmContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalConfirmTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 16,
  },
  modalConfirmText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
  },
  modalConfirmButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalConfirmButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCancelButton: {
    backgroundColor: '#E0E0E0',
  },
  modalCancelButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '500',
  },
  modalConfirmButtonPrimary: {
    backgroundColor: '#4CAF50',
  },
  modalConfirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalDeleteButton: {
    backgroundColor: '#F44336',
  },
  modalDeleteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalSuccessContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    alignItems: 'center',
  },
  successIconContainer: {
    marginBottom: 16,
  },
  modalSuccessTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalSuccessText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSuccessSubtext: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    marginBottom: 24,
    fontStyle: 'italic',
  },
});

export default CarritoScreen;

