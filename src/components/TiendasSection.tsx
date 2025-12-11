import React, {useEffect} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Image, ScrollView} from 'react-native';
import {MaterialIcons} from '@expo/vector-icons';
import {useTiendas} from '../hooks/useTiendas';

const TiendasSection: React.FC = () => {
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
            key={tienda.id ?? `${tienda.nombre ?? 'tienda'}-${index}`}
            style={styles.tiendaCard}>
            {tienda.imagen_url ? (
              <Image source={{uri: tienda.imagen_url}} style={styles.tiendaImage} />
            ) : (
              <View style={[styles.tiendaImage, styles.tiendaImagePlaceholder]}>
                <MaterialIcons name="storefront" size={40} color="#666666" />
              </View>
            )}
            <View style={styles.tiendaContent}>
              <Text style={styles.tiendaName}>{tienda.nombre}</Text>
              <Text style={styles.tiendaType}>{tienda.categoria ?? 'Tienda'}</Text>
              <View style={styles.tiendaRating}>
                <MaterialIcons name="star" size={16} color="#FFC107" />
                <Text style={styles.ratingText}>
                  {tienda.rating ?? 'N/A'} ({tienda.reviews ?? 0})
                </Text>
              </View>
              <Text style={styles.tiendaDelivery}>
                {tienda.tiempoEntrega ?? '--'} • {tienda.distancia ?? '--'}
              </Text>
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
    minHeight: 140,
  },
  tiendaImage: {
    width: 110,
    height: 110,
    resizeMode: 'cover',
  },
  tiendaImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  tiendaContent: {
    flex: 1,
    paddingLeft: 12,
    justifyContent: 'space-evenly',
  },
  tiendaName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  tiendaType: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 8,
  },
  tiendaRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 14,
    color: '#000000',
    marginLeft: 4,
  },
  tiendaDelivery: {
    fontSize: 14,
    color: '#757575',
  },
});

export default TiendasSection;

