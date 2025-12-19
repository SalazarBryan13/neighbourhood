import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {MaterialIcons} from '@expo/vector-icons';
import HomeScreen from './src/screens/HomeScreen';
import PedidosScreen from './src/screens/PedidosScreen';
import PerfilScreen from './src/screens/PerfilScreen';
// Pantallas Alejandro
import WelcomeScreen from './src/screens/WelcomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import RoleSelectionScreen from './src/screens/RoleSelectionScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import ProductosPorCategoriaScreen from './src/screens/ProductosPorCategoriaScreen';
import CarritoScreen from './src/screens/CarritoScreen';
import ProductoDetalleScreen from './src/screens/ProductoDetalleScreen';
import DetallePedidoScreen from './src/screens/DetallePedidoScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon: ({focused, color, size}) => {
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
      <Tab.Screen name="Inicio" component={HomeScreen} />
      <Tab.Screen name="Pedidos" component={PedidosScreen} />
      <Tab.Screen name="Perfil" component={PerfilScreen} />
    </Tab.Navigator>
  );
}

// ---------------------
//  APP Principal (Stack arriba)
// ---------------------
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        
        {/* Pantallas iniciales */}
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />

        {/* Navegación principal */}
        <Stack.Screen name="Tabs" component={TabNavigator} />
        
        {/* Pantalla de productos por categoría */}
        <Stack.Screen name="ProductosPorCategoria" component={ProductosPorCategoriaScreen} />
        
        {/* Pantalla de detalle del producto */}
        <Stack.Screen name="ProductoDetalle" component={ProductoDetalleScreen} />
        
        {/* Pantalla de carrito */}
        <Stack.Screen name="Carrito" component={CarritoScreen} />
        
        {/* Pantalla de detalle del pedido */}
        <Stack.Screen name="DetallePedido" component={DetallePedidoScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
