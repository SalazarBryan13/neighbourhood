# 📱 Catálogo App

Aplicación móvil de catálogo de tiendas desarrollada con React Native y Expo.

## 🚀 Inicio Rápido

### Opción 1: Ver en el Navegador Web (Más Fácil)

```bash
cd catalogo-expo
npm run web
```

La app se abrirá automáticamente en tu navegador.

### Opción 2: Ver en tu Teléfono con Expo Go

1. **Descarga Expo Go** en tu teléfono:
   - [Android](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - [iOS](https://apps.apple.com/app/expo-go/id982107779)

2. **Ejecuta el proyecto:**
   ```bash
   cd catalogo-expo
   npm start
   ```

3. **Escanear el código QR** que aparece en la terminal con la app Expo Go

### Opción 3: Emulador/Simulador

- **Android**: `npm run android` (requiere Android Studio)
- **iOS**: `npm run ios` (solo Mac, requiere Xcode)

---

## 📋 Características Implementadas

✅ Pantalla de inicio completa con:
- Ubicación del cliente
- Barra de búsqueda "¿Qué buscas hoy?"
- Filtros (Ordenar por, Distancia, Calidad)
- Sección de Ofertas horizontales
- Sección de Categorías (4 categorías con iconos)
- Sección de Tiendas cercanas con calificaciones
- Navegación inferior (Inicio, Pedidos, Perfil)

---

## 🛠️ Comandos Disponibles

```bash
npm start          # Iniciar servidor de desarrollo (muestra QR)
npm run web        # Abrir en navegador web
npm run android    # Abrir en emulador Android
npm run ios        # Abrir en simulador iOS (solo Mac)
```

---

## 📁 Estructura del Proyecto

```
catalogo-expo/
├── src/
│   ├── components/      # Componentes reutilizables
│   │   ├── OfertasSection.tsx    # Sección de ofertas
│   │   ├── CategoriasSection.tsx # Categorías con iconos
│   │   └── TiendasSection.tsx    # Lista de tiendas
│   └── screens/         # Pantallas
│       ├── HomeScreen.tsx        # Pantalla principal
│       ├── PedidosScreen.tsx     # Pantalla de pedidos (placeholder)
│       └── PerfilScreen.tsx      # Pantalla de perfil (placeholder)
├── assets/
│   └── images/          # Imágenes de ofertas y tiendas (agregar aquí)
├── App.tsx             # Componente principal con navegación
└── package.json
```

---

## 🎨 Tecnologías

- **React Native** - Framework móvil
- **Expo** - Plataforma de desarrollo
- **React Navigation** - Navegación entre pantallas
- **TypeScript** - Tipado estático
- **Expo Vector Icons** - Iconos

---

## 📸 Agregar Imágenes

Actualmente la app usa placeholders con iconos. Para agregar imágenes reales:

1. Coloca las imágenes en `assets/images/`:
   - `oferta-frutas-verduras.jpg`
   - `oferta-pan.jpg`
   - `tienda-huerfanito.jpg`
   - `tienda-dona-julia.jpg`

2. Edita los componentes para usar las imágenes (ver `AGREGAR_IMAGENES.md`)

---

## 📚 Documentación Adicional

- **AGREGAR_IMAGENES.md** - Guía para agregar imágenes reales
- **VER_SIN_EXPO_GO.md** - Todas las formas de ver la app sin Expo Go

---

## 🎯 Colores del Diseño

- Verde principal: `#4CAF50`
- Verde oscuro (ofertas): `#2E7D32`
- Fondo claro: `#E8F5E9`
- Texto: `#000000`
- Texto secundario: `#757575`

---

¡Disfruta tu aplicación! 🎉
