import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {MaterialIcons} from '@expo/vector-icons';

interface Categoria {
  id: string;
  name: string;
  icon: any;
}

const categorias: Categoria[] = [
  {
    id: '1',
    name: 'Frutas y Verduras',
    icon: 'local-florist',
  },
  {
    id: '2',
    name: 'Panadería',
    icon: 'cake',
  },
  {
    id: '3',
    name: 'Carnicería',
    icon: 'restaurant',
  },
  {
    id: '4',
    name: 'Abarrotes',
    icon: 'storefront',
  },
];

const CategoriasSection: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Explora por Categorías</Text>
      <View style={styles.categoriasGrid}>
        {categorias.map((categoria) => (
          <TouchableOpacity key={categoria.id} style={styles.categoriaItem}>
            <View style={styles.categoriaIcon}>
              <MaterialIcons name={categoria.icon} size={32} color="#4CAF50" />
            </View>
            <Text style={styles.categoriaName}>{categoria.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
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
  categoriasGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  categoriaItem: {
    alignItems: 'center',
    width: '23%',
    marginBottom: 16,
  },
  categoriaIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoriaName: {
    fontSize: 12,
    color: '#000000',
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default CategoriasSection;

