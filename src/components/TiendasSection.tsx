import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Image, ScrollView} from 'react-native';
import {MaterialIcons} from '@expo/vector-icons';

interface Tienda {
  id: string;
  name: string;
  type: string;
  rating: number;
  reviews: number;
  deliveryTime: string;
  distance: string;
  image?: any;
  placeholderColor: string;
}

const tiendas: Tienda[] = [
  {
    id: '1',
    name: 'El Huerfanito',
    type: 'Verdulería',
    rating: 4.8,
    reviews: 120,
    deliveryTime: '15-25 min',
    distance: '1.2 km',
    placeholderColor: '#C8E6C9',
  },
  {
    id: '2',
    name: 'Panadería Doña Julia',
    type: 'Panadería',
    rating: 4.9,
    reviews: 250,
    deliveryTime: '20-30 min',
    distance: '1.8 km',
    placeholderColor: '#FFE0B2',
  },
];

const TiendasSection: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tiendas Cerca de Ti</Text>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {tiendas.map((tienda) => (
          <TouchableOpacity key={tienda.id} style={styles.tiendaCard}>
            {tienda.image ? (
              <Image source={tienda.image} style={styles.tiendaImage} />
            ) : (
              <View style={[styles.tiendaImage, styles.tiendaImagePlaceholder, {backgroundColor: tienda.placeholderColor}]}>
                <MaterialIcons 
                  name={tienda.id === '1' ? 'store' : 'storefront'} 
                  size={40} 
                  color="#666666" 
                />
              </View>
            )}
            <View style={styles.tiendaContent}>
              <Text style={styles.tiendaName}>{tienda.name}</Text>
              <Text style={styles.tiendaType}>{tienda.type}</Text>
              <View style={styles.tiendaRating}>
                <MaterialIcons name="star" size={16} color="#FFC107" />
                <Text style={styles.ratingText}>
                  {tienda.rating} ({tienda.reviews})
                </Text>
              </View>
              <Text style={styles.tiendaDelivery}>
                {tienda.deliveryTime} • {tienda.distance}
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
  },
  tiendaImage: {
    width: 100,
    height: 100,
    resizeMode: 'cover',
  },
  tiendaImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  tiendaContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  tiendaName: {
    fontSize: 16,
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

