import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';

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

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const HomeStack = createNativeStackNavigator();

/**
 * Stack interno para el tab "Inicio".
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

function TabNavigator() {
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
      {/* Ahora Inicio usa el stack interno */}
      <Tab.Screen name="Inicio" component={HomeStackNavigator} />
      <Tab.Screen name="Pedidos" component={PedidosScreen} />
      <Tab.Screen name="Perfil" component={PerfilScreen} />
    </Tab.Navigator>
  );
}

// ---------------------
// APP Principal
// ---------------------
export default function App() {
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