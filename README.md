# 📱 Catálogo App - NeighborHub

Aplicación móvil de catálogo de tiendas desarrollada con React Native y Expo. Permite a los usuarios explorar tiendas cercanas, ver ofertas, categorías y realizar pedidos.

## ⚙️ Configuración Inicial

### Variables de Entorno

Antes de ejecutar la aplicación, necesitas configurar las variables de entorno de Supabase:

1. **Crea un archivo `.env` en la raíz del proyecto `catalogo-expo/`:**

```bash
# Variables de entorno para Supabase
EXPO_PUBLIC_SUPABASE_URL=tu_url_de_supabase_aqui
EXPO_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anon_de_supabase_aqui

# Variable de entorno para API FastAPI (solo para tienderos)
EXPO_PUBLIC_API_URL=http://localhost:8000
```

2. **Obtén tus credenciales de Supabase:**
   - Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
   - Navega a **Settings** → **API**
   - Copia la **URL** del proyecto y la **anon/public key**

3. **Nota importante:** En Expo, las variables de entorno deben tener el prefijo `EXPO_PUBLIC_` para que sean accesibles en el código del cliente.

---

## 🚀 Inicio Rápido

### 🌐 Opción 1: Ver en el Navegador Web (Recomendado para Desarrollo)

La forma más rápida de ver la aplicación sin necesidad de instalar nada adicional:

```bash
cd catalogo-expo
npm install
npm run web
```

La app se abrirá automáticamente en tu navegador en `http://localhost:8081` o `http://localhost:19006`.

**Ventajas:**
- ✅ No requiere Android Studio ni Xcode
- ✅ No requiere instalar Expo Go en el teléfono
- ✅ Desarrollo rápido y fácil
- ✅ Hot reload automático

### 📱 Opción 2: Ver en tu Teléfono con Expo Go

1. **Descarga Expo Go** en tu teléfono:
   - [Android - Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - [iOS - App Store](https://apps.apple.com/app/expo-go/id982107779)

2. **Ejecuta el proyecto:**
   ```bash
   cd catalogo-expo
   npm start
   ```

3. **Escanear el código QR** que aparece en la terminal con la app Expo Go

**Nota:** Tu teléfono y computadora deben estar en la misma red WiFi.

### 📲 Opción 3: Emulador/Simulador

- **Android**: `npm run android` (requiere Android Studio y un emulador corriendo)
- **iOS**: `npm run ios` (solo Mac, requiere Xcode y simulador)

---

## 📋 Características Implementadas

### ✅ Pantalla de Inicio Completa

La pantalla principal incluye todos los elementos según los criterios de aceptación:

- **📍 Ubicación**: Header con icono de ubicación y dirección "Entregar en: Av. Siempreviva 742"
- **🔔 Notificaciones**: Icono de campana en el header
- **🔍 Búsqueda**: Barra de búsqueda con placeholder "¿Qué buscas hoy?"
- **🔽 Filtros**: Tres botones de filtro:
  - Ordenar por (con icono de ordenamiento)
  - Distancia (con icono de avión)
  - Calidad (con icono de estrella)
- **🎁 Ofertas**: Sección horizontal desplazable con tarjetas de ofertas:
  - Oferta de "20% en Frutas y Verduras" (El Huerfanito)
  - Oferta de "Pan recién" (Panadería Doña Julia)
- **📂 Categorías**: Cuatro categorías con iconos circulares:
  - Frutas y Verduras
  - Panadería
  - Carnicería
  - Abarrotes
- **🏪 Tiendas**: Lista de tiendas cercanas con:
  - Imagen de la tienda (placeholder con icono)
  - Nombre y tipo de tienda
  - Calificación con estrellas
  - Tiempo de entrega y distancia
- **🧭 Navegación**: Barra inferior con tres tabs:
  - Inicio (activa)
  - Pedidos
  - Perfil

---

## 🛠️ Comandos Disponibles

```bash
# Instalar dependencias (primera vez)
npm install

# Iniciar servidor de desarrollo (muestra QR para Expo Go)
npm start

# Ver en navegador web
npm run web

# Ver en emulador Android (requiere Android Studio)
npm run android

# Ver en simulador iOS (solo Mac, requiere Xcode)
npm run ios
```

---

## 📁 Estructura del Proyecto

```
catalogo-expo/
├── src/
│   ├── components/              # Componentes reutilizables
│   │   ├── OfertasSection.tsx  # Sección de ofertas con scroll horizontal
│   │   ├── CategoriasSection.tsx # Grid de categorías con iconos
│   │   └── TiendasSection.tsx  # Lista de tiendas con tarjetas
│   └── screens/                 # Pantallas de la aplicación
│       ├── HomeScreen.tsx       # Pantalla principal (implementada)
│       ├── PedidosScreen.tsx    # Pantalla de pedidos (placeholder)
│       └── PerfilScreen.tsx     # Pantalla de perfil (placeholder)
├── assets/
│   ├── images/                  # Imágenes de ofertas y tiendas
│   ├── icon.png                 # Icono de la app
│   ├── adaptive-icon.png        # Icono adaptativo Android
│   ├── splash-icon.png          # Splash screen
│   └── favicon.png              # Favicon para web
├── App.tsx                      # Componente principal con navegación
├── index.ts                     # Punto de entrada de Expo
├── app.json                     # Configuración de Expo
├── package.json                 # Dependencias del proyecto
└── tsconfig.json               # Configuración de TypeScript
```

---

## 🎨 Tecnologías Utilizadas

### Dependencias Principales

- **React Native 0.81.5** - Framework para desarrollo móvil multiplataforma
- **React 19.1.0** - Biblioteca de UI
- **Expo ~54.0.25** - Plataforma y herramientas de desarrollo
- **TypeScript 5.9.2** - Tipado estático para mayor seguridad

### Navegación

- **@react-navigation/native ^7.1.22** - Navegación base
- **@react-navigation/bottom-tabs ^7.8.7** - Navegación por tabs
- **@react-navigation/native-stack ^7.8.1** - Navegación por stack
- **react-native-safe-area-context ^5.6.2** - Manejo de áreas seguras
- **react-native-screens ^4.18.0** - Optimización de pantallas

### Backend y Base de Datos

- **@supabase/supabase-js ^2.87.1** - Cliente de Supabase para autenticación y base de datos

### UI y Componentes

- **@expo/vector-icons ^15.0.3** - Iconos Material Design
- **expo-status-bar ~3.0.8** - Barra de estado de Expo

### Web Support

- **react-dom ^19.1.0** - Para renderizado web
- **react-native-web ^0.21.2** - Soporte para web

### Instalación de Dependencias

```bash
cd catalogo-expo
npm install
```

Todas las dependencias están listadas en `package.json`. Ejecuta `npm install` para instalar todas las dependencias necesarias.

---

## 🎨 Paleta de Colores

El diseño sigue una paleta verde consistente:

- **Verde Principal**: `#4CAF50` - Botones activos, iconos principales
- **Verde Oscuro**: `#2E7D32` - Fondo de tarjetas de ofertas
- **Verde Claro**: `#E8F5E9` - Fondos de botones, barra de búsqueda
- **Verde Secundario**: `#81C784` - Texto secundario en ofertas
- **Amarillo**: `#FFC107` - Estrellas de calificación
- **Gris Claro**: `#E0E0E0` - Bordes
- **Gris Medio**: `#757575` - Texto secundario
- **Gris Oscuro**: `#9E9E9E` - Texto deshabilitado
- **Negro**: `#000000` - Texto principal
- **Blanco**: `#FFFFFF` - Fondos

---

## 📸 Imágenes y Placeholders

Actualmente la aplicación usa **placeholders con iconos** para las imágenes. Los placeholders muestran:

- **Ofertas**: Iconos de canasta (frutas/verduras) y panadería
- **Tiendas**: Iconos de tienda con colores distintivos

### Para Agregar Imágenes Reales:

1. Coloca las imágenes en `assets/images/`:
   - `oferta-frutas-verduras.jpg` (o .png)
   - `oferta-pan.jpg` (o .png)
   - `tienda-huerfanito.jpg` (o .png)
   - `tienda-dona-julia.jpg` (o .png)

2. Edita los componentes `OfertasSection.tsx` y `TiendasSection.tsx` para descomentar las líneas de `require()` y agregar las referencias a las imágenes.

**Tamaños recomendados:**
- Ofertas: 280x180 píxeles (proporción 1.55:1)
- Tiendas: 100x100 píxeles (cuadradas)

---

## 🔧 Requisitos del Sistema

### Para Desarrollo Web:
- Node.js 16 o superior (recomendado 20+)
- npm o yarn

### Para Desarrollo Móvil:
- **Android**: Android Studio con Android SDK
- **iOS**: macOS con Xcode (solo para simulador)
- **Expo Go**: App móvil para pruebas en dispositivo real

---

## ✅ Funcionalidades Implementadas

### Autenticación y Usuario
- ✅ Registro de usuarios (Vecino/Tiendero)
- ✅ Login con validación de email
- ✅ Confirmación automática de email
- ✅ Gestión de sesión

### Productos y Catálogo
- ✅ Visualización de categorías desde Supabase
- ✅ Listado de productos por categoría
- ✅ Detalle de producto con stock disponible
- ✅ Búsqueda y filtrado de productos

### Carrito de Compras
- ✅ Agregar productos al carrito
- ✅ Actualizar cantidades
- ✅ Eliminar productos
- ✅ Cálculo automático de totales
- ✅ Validación de stock

### Pedidos
- ✅ Confirmación de pedidos
- ✅ Selección de dirección de entrega
- ✅ Historial de pedidos
- ✅ Detalle de pedido con productos

### Base de Datos
- ✅ Esquema completo de base de datos
- ✅ Tablas: usuario, tienda, inventario, producto, categoria, carrito, pedido, direcciones_usuario
- ✅ Row Level Security (RLS) configurado
- ✅ Relaciones y constraints implementadas

## 📚 Próximos Pasos

- [ ] Implementar funcionalidad de búsqueda avanzada
- [ ] Agregar filtros funcionales (precio, distancia, etc.)
- [ ] Implementar pantalla de Perfil completa
- [ ] Implementar pantalla de Pedidos independiente
- [ ] Gestión de direcciones (agregar/editar/eliminar)
- [ ] Funcionalidad para Tiendero (gestión de productos, inventario, pedidos recibidos)
- [ ] Agregar imágenes reales de productos y tiendas
- [ ] Notificaciones push
- [ ] Sistema de calificaciones y reseñas

---

## 🌐 Repositorio

Este proyecto está en GitHub:
- **Repositorio**: [NeighborHub](https://github.com/Nick09V/NeighborHub.git)
- **Rama actual**: `feature/inicio`

---

## 📝 Notas de Desarrollo

- El proyecto está configurado para funcionar en **web, Android e iOS**
- Los placeholders de imágenes funcionan perfectamente para desarrollo
- La navegación está implementada con React Navigation
- Todos los componentes están en TypeScript para mayor seguridad de tipos
- El diseño es responsive y se adapta a diferentes tamaños de pantalla

---

## 🆘 Solución de Problemas

### Error al ejecutar `npm run web`:
```bash
npm install react-dom react-native-web --legacy-peer-deps
```

### La app no se conecta en Expo Go:
- Verifica que estés en la misma red WiFi
- Usa modo tunnel: `npx expo start --tunnel`

### Error de dependencias:
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 📄 Licencia

Este proyecto es parte de NeighborHub.

---

¡Disfruta desarrollando! 🚀
