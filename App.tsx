import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { usePerfilUsuario } from './src/hooks/usePerfilUsuario';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

// Tabs
import HomeScreen from './src/screens/HomeScreen';
import PedidosScreen from './src/screens/PedidosScreen';
import PerfilScreen from './src/screens/PerfilScreen';

// Auth / otras pantallas
import WelcomeScreen from './src/screens/WelcomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import RoleSelectionScreen from './src/screens/RoleSelectionScreen';
import RegisterScreen from './src/screens/RegisterScreen';

// Catalogo / tienda
import ProductosPorCategoriaScreen from './src/screens/ProductosPorCategoriaScreen';
import CarritoScreen from './src/screens/CarritoScreen';
import ProductoDetalleScreen from './src/screens/ProductoDetalleScreen';
import DetallePedidoScreen from './src/screens/DetallePedidoScreen';
import TiendaDetalleScreen from './src/screens/TiendaDetalleScreen';

// Pantallas del tiendero
import DashboardTienderoScreen from './src/screens/DashboardTienderoScreen';
import GestionProductosScreen from './src/screens/GestionProductosScreen';
import GestionInventarioScreen from './src/screens/GestionInventarioScreen';
import GestionTiendaScreen from './src/screens/GestionTiendaScreen';
import GestionCategoriasScreen from './src/screens/GestionCategoriasScreen';
import PedidosTienderoScreen from './src/screens/PedidosTienderoScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const HomeStack = createNativeStackNavigator();
const TienderoStack = createNativeStackNavigator();
const PedidosStack = createNativeStackNavigator();

/**
 * Stack interno para el tab "Inicio" (Vecino).
 * Aquí metemos todas las pantallas de catálogo / tienda / carrito
 * para que el tab bar siempre se vea.
 */
function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeMain" component={HomeScreen} />
      <HomeStack.Screen
        name="ProductosPorCategoria"
        component={ProductosPorCategoriaScreen}
      />
      <HomeStack.Screen
        name="ProductoDetalle"
        component={ProductoDetalleScreen}
      />
      <HomeStack.Screen name="Carrito" component={CarritoScreen} />
      <HomeStack.Screen name="DetallePedido" component={DetallePedidoScreen} />
      <HomeStack.Screen name="TiendaDetalle" component={TiendaDetalleScreen} />
    </HomeStack.Navigator>
  );
}

/**
 * Stack interno para el tab "Inicio" (Tiendero).
 * Pantallas de gestión del tiendero.
 */
function TienderoStackNavigator() {
  return (
    <TienderoStack.Navigator screenOptions={{ headerShown: false }}>
      <TienderoStack.Screen name="DashboardMain" component={DashboardTienderoScreen} />
      <TienderoStack.Screen name="GestionProductos" component={GestionProductosScreen} />
      <TienderoStack.Screen name="GestionInventario" component={GestionInventarioScreen} />
      <TienderoStack.Screen name="GestionTienda" component={GestionTiendaScreen} />
      <TienderoStack.Screen name="GestionCategorias" component={GestionCategoriasScreen} />
      <TienderoStack.Screen name="PedidosTiendero" component={PedidosTienderoScreen} />
      <TienderoStack.Screen name="DetallePedido" component={DetallePedidoScreen} />
    </TienderoStack.Navigator>
  );
}

/**
 * Tab Navigator para Vecinos
 */
function TabNavigatorVecino() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof MaterialIcons.glyphMap = 'help';

          if (route.name === 'Inicio') {
            iconName = 'home';
          } else if (route.name === 'Pedidos') {
            iconName = 'receipt';
          } else if (route.name === 'Perfil') {
            iconName = 'person';
          }

          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: '#9E9E9E',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E0E0E0',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
      })}
    >
      <Tab.Screen name="Inicio" component={HomeStackNavigator} />
      <Tab.Screen name="Pedidos" component={PedidosScreen} />
      <Tab.Screen name="Perfil" component={PerfilScreen} />
    </Tab.Navigator>
  );
}

/**
 * Stack interno para el tab "Pedidos" (Tiendero).
 * Permite navegar desde la lista de pedidos al detalle.
 */
function PedidosStackNavigator() {
  return (
    <PedidosStack.Navigator screenOptions={{ headerShown: false }}>
      <PedidosStack.Screen name="PedidosMain" component={PedidosTienderoScreen} />
      <PedidosStack.Screen name="DetallePedido" component={DetallePedidoScreen} />
    </PedidosStack.Navigator>
  );
}

/**
 * Tab Navigator para Tienderos
 */
function TabNavigatorTiendero() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof MaterialIcons.glyphMap = 'help';

          if (route.name === 'Inicio') {
            iconName = 'store';
          } else if (route.name === 'Pedidos') {
            iconName = 'receipt';
          } else if (route.name === 'Productos') {
            iconName = 'inventory';
          } else if (route.name === 'Perfil') {
            iconName = 'person';
          }

          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: '#9E9E9E',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E0E0E0',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
      })}
    >
      <Tab.Screen name="Inicio" component={TienderoStackNavigator} />
      <Tab.Screen name="Pedidos" component={PedidosStackNavigator} />
      <Tab.Screen name="Productos" component={GestionProductosScreen} />
      <Tab.Screen name="Perfil" component={PerfilScreen} />
    </Tab.Navigator>
  );
}

// ---------------------
// APP Principal
// ---------------------
export default function App() {
  const { perfil, loading } = usePerfilUsuario();
  const [isReady, setIsReady] = useState(false);

  // Normalizar el rol para comparación (trim y lowercase)
  const rolNormalizado = perfil?.rol?.toLowerCase()?.trim();
  const esTiendero = rolNormalizado === 'tiendero';

  useEffect(() => {
    // Esperar a que el perfil se cargue o que termine la carga (incluso si no hay perfil)
    if (!loading) {
      // Dar un pequeño delay para asegurar que todo esté listo
      const timer = setTimeout(() => {
        setIsReady(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  // Debug: mostrar información del perfil
  useEffect(() => {
    if (perfil) {
      console.log('📋 Perfil cargado:', {
        id_usuario: perfil.id_usuario,
        rol: perfil.rol,
        rolNormalizado,
        esTiendero,
      });
    } else {
      console.warn('⚠️ No se encontró perfil de usuario');
    }
  }, [perfil, rolNormalizado, esTiendero]);

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  // Determinar qué navegador usar según el rol
  const TabNavigator = esTiendero ? TabNavigatorTiendero : TabNavigatorVecino;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* Pantallas iniciales (sin tabs) */}
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />

        {/* Navegación principal con tabs persistentes */}
        <Stack.Screen name="Tabs" component={TabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});