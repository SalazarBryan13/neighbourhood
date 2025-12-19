import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, ActivityIndicator} from 'react-native';
import {MaterialIcons} from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useCategorias } from '../hooks/useCategorias';

// Mapeo de iconos por nombre de categoría
const getIconForCategoria = (nombre: string): keyof typeof MaterialIcons.glyphMap => {
  const nombreLower = nombre.toLowerCase();
  if (nombreLower.includes('fruta') || nombreLower.includes('verdura')) {
    return 'local-florist';
  }
  if (nombreLower.includes('pan') || nombreLower.includes('panadería')) {
    return 'cake';
  }
  if (nombreLower.includes('carne') || nombreLower.includes('carnicería')) {
    return 'restaurant';
  }
  if (nombreLower.includes('abarrote')) {
    return 'storefront';
  }
  return 'category'; // Icono por defecto
};

const CategoriasSection: React.FC = () => {
  const navigation = useNavigation();
  const { categorias, loading, error } = useCategorias();

  const handleCategoriaPress = (categoriaId: number, categoriaNombre: string) => {
    (navigation as any).navigate('ProductosPorCategoria', {
      categoriaId,
      categoriaNombre,
    });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Explora por Categorías</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#4CAF50" />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Explora por Categorías</Text>
        <Text style={styles.errorText}>Error al cargar categorías</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Explora por Categorías</Text>
      <View style={styles.categoriasGrid}>
        {categorias.map((categoria) => (
          <TouchableOpacity
            key={categoria.id_categoria}
            style={styles.categoriaItem}
            onPress={() => handleCategoriaPress(categoria.id_categoria, categoria.nombre)}
          >
            <View style={styles.categoriaIcon}>
              <MaterialIcons
                name={getIconForCategoria(categoria.nombre)}
                size={32}
                color="#4CAF50"
              />
            </View>
            <Text style={styles.categoriaName} numberOfLines={2}>
              {categoria.nombre}
            </Text>
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
  loadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  errorText: {
    color: '#F44336',
    textAlign: 'center',
    paddingVertical: 20,
  },
});

export default CategoriasSection;

