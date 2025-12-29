import React, { useEffect, useState } from 'react';
import {View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView} from 'react-native';
import {MaterialIcons} from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useCategorias } from '../hooks/useCategorias';
import { useTiendas } from '../hooks/useTiendas';
import { apiClient } from '../lib/apiClient';

// Mapeo de iconos por nombre de categoría
const getIconForCategoria = (nombre: string): keyof typeof MaterialIcons.glyphMap => {
  const nombreLower = nombre.toLowerCase();
  if (nombreLower.includes('pan') || nombreLower.includes('panadería') || nombreLower.includes('panaderia')) {
    return 'cake'; // Icono de pastel para panadería
  }
  if (nombreLower.includes('carne') || nombreLower.includes('carnicería') || nombreLower.includes('carniceria')) {
    return 'restaurant'; // Icono de restaurante para carnicería
  }
  if (nombreLower.includes('caramelo') || nombreLower.includes('caramelos')) {
    return 'local-cafe'; // Icono de café/dulces para caramelos
  }
  if (nombreLower.includes('chupete') || nombreLower.includes('chupetes')) {
    return 'child-care'; // Icono de niño/chupete
  }
  return 'category'; // Icono por defecto
};

// Categorías permitidas
const CATEGORIAS_PERMITIDAS = ['Panadería', 'Panaderia', 'Carnicería', 'Carniceria', 'Caramelos', 'Chupetes'];

const CategoriasSection: React.FC = () => {
  const navigation = useNavigation();
  const { tiendas, loading: loadingTiendas, fetchTiendas } = useTiendas();
  const [categoriasUnicas, setCategoriasUnicas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarCategorias();
  }, []);

  const cargarCategorias = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Cargar tiendas primero
      await fetchTiendas();
    } catch (err) {
      console.error('❌ Error cargando tiendas:', err);
      setError('Error al cargar tiendas');
    } finally {
      setLoading(false);
    }
  };

  // Cargar categorías cuando se obtengan las tiendas
  useEffect(() => {
    if (tiendas.length > 0) {
      obtenerCategoriasDeTiendas();
    }
  }, [tiendas]);

  const obtenerCategoriasDeTiendas = async () => {
    try {
      setLoading(true);
      const todasLasCategorias: any[] = [];
      
      // Obtener categorías de las primeras 2 tiendas (o todas si hay menos)
      const tiendasAConsultar = tiendas.slice(0, 2);
      
      for (const tienda of tiendasAConsultar) {
        try {
          const categorias = await apiClient.get<any[]>(`/categorias/${tienda.id_tienda}`);
          todasLasCategorias.push(...(categorias || []));
        } catch (err) {
          console.error(`❌ Error obteniendo categorías de tienda ${tienda.id_tienda}:`, err);
        }
      }

      // Filtrar categorías permitidas y eliminar duplicados por nombre
      const categoriasFiltradas = todasLasCategorias
        .filter(cat => CATEGORIAS_PERMITIDAS.some(permitida => 
          cat.nombre.toLowerCase().includes(permitida.toLowerCase()) || 
          permitida.toLowerCase().includes(cat.nombre.toLowerCase())
        ))
        .filter((cat, index, self) => 
          index === self.findIndex(c => c.nombre.toLowerCase() === cat.nombre.toLowerCase())
        );

      console.log('✅ Categorías únicas obtenidas:', categoriasFiltradas.length);
      setCategoriasUnicas(categoriasFiltradas);
    } catch (err) {
      console.error('❌ Error obteniendo categorías:', err);
      setError('Error al cargar categorías');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoriaPress = (categoriaId: number, categoriaNombre: string) => {
    (navigation as any).navigate('ProductosPorCategoria', {
      categoriaId,
      categoriaNombre,
    });
  };

  if (loading || loadingTiendas) {
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
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (categoriasUnicas.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Explora por Categorías</Text>
        <Text style={styles.emptyText}>No hay categorías disponibles</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Explora por Categorías</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriasScroll}
        style={styles.scrollView}
      >
        {categoriasUnicas.map((categoria) => (
          <TouchableOpacity
            key={categoria.id_categoria}
            style={styles.categoriaCard}
            onPress={() => handleCategoriaPress(categoria.id_categoria, categoria.nombre)}
            activeOpacity={0.7}
          >
            <View style={styles.categoriaIconContainer}>
              <MaterialIcons
                name={getIconForCategoria(categoria.nombre)}
                size={40}
                color="#4CAF50"
              />
            </View>
            <Text style={styles.categoriaName} numberOfLines={2}>
              {categoria.nombre}
            </Text>
            {categoria.descripcion && (
              <Text style={styles.categoriaDescripcion} numberOfLines={1}>
                {categoria.descripcion}
              </Text>
            )}
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
  scrollView: {
    marginHorizontal: -16,
  },
  categoriasScroll: {
    paddingHorizontal: 16,
    gap: 16,
  },
  categoriaCard: {
    width: 140,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E8F5E9',
  },
  categoriaIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoriaName: {
    fontSize: 14,
    color: '#000000',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 4,
  },
  categoriaDescripcion: {
    fontSize: 11,
    color: '#666666',
    textAlign: 'center',
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
  emptyText: {
    color: '#999999',
    textAlign: 'center',
    paddingVertical: 20,
    fontSize: 14,
  },
});

export default CategoriasSection;


