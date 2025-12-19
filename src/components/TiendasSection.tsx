import React, {useEffect} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Image, ScrollView} from 'react-native';
import {MaterialIcons} from '@expo/vector-icons';
import {useNavigation} from '@react-navigation/native';
import {useTiendas} from '../hooks/useTiendas';

const TiendasSection: React.FC = () => {
  const navigation = useNavigation();
  const {tiendas, loading, error, fetchTiendas} = useTiendas();

  useEffect(() => {
    fetchTiendas();
  }, [fetchTiendas]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tiendas Cerca de Ti</Text>

      {loading && <Text style={styles.helperText}>Cargando tiendas...</Text>}
      {error && <Text style={styles.errorText}>{error}</Text>}
      {!loading && !error && tiendas.length === 0 && (
        <Text style={styles.helperText}>No hay tiendas disponibles.</Text>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {tiendas.map((tienda, index) => (
          <TouchableOpacity
            key={tienda.id_tienda ?? `${tienda.nombre_tienda ?? 'tienda'}-${index}`}
            style={styles.tiendaCard}
            onPress={() =>
              (navigation as any).navigate('TiendaDetalle', {
                tiendaId: tienda.id_tienda,
                tiendaNombre: tienda.nombre_tienda,
                tiendaImagen: tienda.imagen_url,
                tiendaDescripcion: tienda.descripcion,
                tiendaDireccion: tienda.direccion,
              })
            }>
            {tienda.imagen_url ? (
              <Image source={{uri: tienda.imagen_url}} style={styles.tiendaImage} />
            ) : (
              <View style={[styles.tiendaImage, styles.tiendaImagePlaceholder]}>
                <MaterialIcons name="storefront" size={40} color="#666666" />
              </View>
            )}
            <View style={styles.tiendaContent}>
              <View style={styles.tiendaHeader}>
                <Text style={styles.tiendaName} numberOfLines={1}>
                  {tienda.nombre_tienda}
                </Text>
              </View>
              
              <View style={styles.tiendaInfo}>
                {tienda.descripcion ? (
                  <Text style={styles.descripcion} numberOfLines={2}>
                    {tienda.descripcion}
                  </Text>
                ) : (
                  <Text style={styles.descripcionPlaceholder}>
                    Sin descripción
                  </Text>
                )}

                <View style={styles.infoRow}>
                  {tienda.direccion && (
                    <View style={styles.infoItem}>
                      <MaterialIcons name="location-on" size={16} color="#4CAF50" />
                      <Text style={styles.infoText} numberOfLines={1}>
                        {tienda.direccion}
                      </Text>
                    </View>
                  )}
                  {tienda.telefono && (
                    <View style={styles.infoItem}>
                      <MaterialIcons name="call" size={16} color="#4CAF50" />
                      <Text style={styles.infoText}>{tienda.telefono}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.estadoRow}>
                  <View style={styles.estadoBadge}>
                    <Text style={styles.estadoText}>{tienda.estado}</Text>
                  </View>
                  {tienda.rating !== undefined && (
                    <View style={styles.ratingContainer}>
                      <MaterialIcons name="star" size={18} color="#FFC107" />
                      <Text style={styles.ratingText}>
                        {tienda.rating ? tienda.rating.toFixed(1) : 'N/A'}
                      </Text>
                      {tienda.reviews !== undefined && tienda.reviews > 0 && (
                        <Text style={styles.reviewsText}>
                          ({tienda.reviews})
                        </Text>
                      )}
                    </View>
                  )}
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 16,
  },
  helperText: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#D32F2F',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  tiendaCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 16,
    padding: 12,
    minHeight: 120,
  },
  tiendaImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    resizeMode: 'cover',
    backgroundColor: '#F5F5F5',
  },
  tiendaImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  tiendaContent: {
    flex: 1,
    paddingLeft: 12,
    justifyContent: 'space-between',
  },
  tiendaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  tiendaName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    flex: 1,
    marginRight: 8,
  },
  tiendaInfo: {
    gap: 8,
  },
  descripcion: {
    fontSize: 14,
    color: '#424242',
  },
  descripcionPlaceholder: {
    fontSize: 13,
    color: '#9E9E9E',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    maxWidth: '100%',
  },
  infoText: {
    fontSize: 13,
    color: '#616161',
    maxWidth: 180,
  },
  estadoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  estadoBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  estadoText: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 15,
    color: '#212121',
    fontWeight: '600',
  },
  reviewsText: {
    fontSize: 13,
    color: '#757575',
    marginLeft: 2,
  },
});

export default TiendasSection;

