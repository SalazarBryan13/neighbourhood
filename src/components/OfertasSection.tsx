import React from 'react';
import {View, Text, ScrollView, StyleSheet, TouchableOpacity, Image} from 'react-native';
import {MaterialIcons} from '@expo/vector-icons';

interface Oferta {
  id: string;
  title: string;
  discount: string;
  validAt: string;
  image?: any;
  placeholderColor: string;
}

const ofertas: Oferta[] = [
  {
    id: '1',
    title: '20% en Frutas y Verduras',
    discount: '20%',
    validAt: "Válido en 'El Huerfanito'",
    placeholderColor: '#66BB6A',
  },
  {
    id: '2',
    title: 'Pan recién',
    discount: '',
    validAt: "Panadería 'Doña Julia'",
    placeholderColor: '#D7CCC8',
  },
];

const OfertasSection: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ofertas para ti</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {ofertas.map((oferta) => (
          <TouchableOpacity key={oferta.id} style={styles.ofertaCard}>
            {oferta.image ? (
              <Image source={oferta.image} style={styles.ofertaImage} />
            ) : (
              <View style={[styles.ofertaImage, {backgroundColor: oferta.placeholderColor}]}>
                <MaterialIcons 
                  name={oferta.id === '1' ? 'shopping-basket' : 'bakery-dining'} 
                  size={60} 
                  color="#FFFFFF" 
                />
              </View>
            )}
            <View style={styles.ofertaContent}>
              <Text style={styles.ofertaTitle}>{oferta.title}</Text>
              <Text style={styles.ofertaValidAt}>{oferta.validAt}</Text>
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
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  ofertaCard: {
    width: 280,
    borderRadius: 16,
    backgroundColor: '#2E7D32',
    overflow: 'hidden',
    marginRight: 16,
  },
  ofertaImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ofertaContent: {
    padding: 16,
  },
  ofertaTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  ofertaValidAt: {
    fontSize: 14,
    color: '#81C784',
  },
});

export default OfertasSection;

