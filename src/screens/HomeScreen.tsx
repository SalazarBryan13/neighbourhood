import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  SafeAreaView,
} from 'react-native';
import {MaterialIcons} from '@expo/vector-icons';
import OfertasSection from '../components/OfertasSection';
import CategoriasSection from '../components/CategoriasSection';
import TiendasSection from '../components/TiendasSection';

const HomeScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}>
        {/* Header con Ubicación y Notificaciones */}
        <View style={styles.header}>
          <View style={styles.locationContainer}>
            <MaterialIcons name="location-on" size={20} color="#000000" />
            <Text style={styles.locationText}>
              Entregar en: Av. Siempreviva 742
            </Text>
          </View>
          <TouchableOpacity>
            <MaterialIcons name="notifications" size={24} color="#000000" />
          </TouchableOpacity>
        </View>

        {/* Barra de Búsqueda */}
        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={24} color="#4CAF50" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="¿Qué buscas hoy?"
            placeholderTextColor="#9E9E9E"
          />
        </View>

        {/* Filtros */}
        <View style={styles.filtersContainer}>
          <TouchableOpacity style={styles.filterButton}>
            <MaterialIcons name="swap-vert" size={18} color="#4CAF50" />
            <Text style={styles.filterText}>Ordenar por</Text>
            <MaterialIcons name="arrow-drop-down" size={18} color="#4CAF50" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton}>
            <MaterialIcons name="flight" size={18} color="#4CAF50" />
            <Text style={styles.filterText}>Distancia</Text>
            <MaterialIcons name="arrow-drop-down" size={18} color="#4CAF50" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton}>
            <MaterialIcons name="star" size={18} color="#4CAF50" />
            <Text style={styles.filterText}>Calidad</Text>
            <MaterialIcons name="arrow-drop-down" size={18} color="#4CAF50" />
          </TouchableOpacity>
        </View>

        {/* Sección de Ofertas */}
        <OfertasSection />

        {/* Sección de Categorías */}
        <CategoriasSection />

        {/* Sección de Tiendas */}
        <TiendasSection />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationText: {
    fontSize: 14,
    color: '#000000',
    marginLeft: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 50,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  filterText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
});

export default HomeScreen;

