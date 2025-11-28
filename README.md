# 📱 Catálogo App - NeighborHub

Aplicación móvil de catálogo de tiendas desarrollada con React Native y Expo. Permite a los usuarios explorar tiendas cercanas, ver ofertas, categorías y realizar pedidos.

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

- **React Native 0.81.5** - Framework para desarrollo móvil multiplataforma
- **Expo ~54.0.25** - Plataforma y herramientas de desarrollo
- **React Navigation 7.x** - Navegación entre pantallas
  - `@react-navigation/native`
  - `@react-navigation/bottom-tabs`
- **TypeScript 5.9.2** - Tipado estático para mayor seguridad
- **Expo Vector Icons 15.0.3** - Iconos Material Design
- **React Native Web 0.21.2** - Soporte para web
- **React DOM 19.1.0** - Para renderizado web
- **React Native Safe Area Context** - Manejo de áreas seguras
- **React Native Screens** - Optimización de pantallas

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

## 📚 Próximos Pasos

- [ ] Implementar funcionalidad de búsqueda
- [ ] Agregar filtros funcionales
- [ ] Implementar pantalla de detalle de tienda
- [ ] Agregar imágenes reales de ofertas y tiendas
- [ ] Implementar pantalla de Pedidos
- [ ] Implementar pantalla de Perfil
- [ ] Conectar con API backend
- [ ] Agregar autenticación de usuarios

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
