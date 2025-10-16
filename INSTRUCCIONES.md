# Mapa Mental de Seguros - Instrucciones

## 🎯 Descripción

Este proyecto ahora cuenta con dos versiones:
- **Versión Pública** (lectura): Para que los usuarios consulten información sobre seguros
- **Versión Admin** (edición): Para administrar el contenido del mapa mental

## 📊 Contenido Actualizado

El mapa mental ahora incluye dos secciones principales:

### 1. **Seguro de Vida** 
Con información sobre:
- Tipos de moneda (MXN, USD, UDIS)
- Actualización por inflación
- Valores garantizados
- Fideicomisos
- Tipos de planes
- Deducibilidad fiscal
- Coberturas adicionales

### 2. **Gastos Médicos**
Con información sobre:
- Planes nacionales e internacionales
- Niveles de hospitales
- Honorarios médicos
- Suma asegurada
- Deducible y coaseguro
- Coberturas adicionales
- Cirugía robótica, trasplantes, cámara hiperbárica
- Exclusiones
- Ventajas sin costo

## 🌐 Rutas de la Aplicación

### Versión Pública: `/`
- **URL**: `https://tu-dominio.web.app/`
- **Funcionalidad**: Solo lectura
- **Características**:
  - Los usuarios pueden hacer clic en cualquier nodo para ver su contenido
  - No se pueden editar, crear o eliminar nodos
  - No se pueden modificar conexiones
  - Interfaz limpia y simple

### Versión Admin: `/admin`
- **URL**: `https://tu-dominio.web.app/admin`
- **Funcionalidad**: Edición completa
- **Características**:
  - Crear nuevos nodos (botón +)
  - Editar nodos existentes (click en nodo)
  - Eliminar nodos
  - Conectar nodos (Alt + Click y arrastrar)
  - Eliminar conexiones (click en línea)
  - Mover nodos arrastrando
  - **Reiniciar DB**: Botón rojo para reinicializar la base de datos con los datos por defecto

## 🔧 Uso del Admin

### Reiniciar Base de Datos
Si necesitas volver a los datos originales:
1. Accede a `/admin`
2. Haz clic en el botón rojo "Reiniciar DB"
3. Confirma la acción
4. La base de datos se limpiará y se cargarán los 21 nodos con toda la información sobre seguros

### Crear Nodos
1. Click en el botón "+"
2. Rellena título, contenido y elige color
3. Guarda

### Editar Nodos
1. Click en cualquier nodo
2. Modifica la información
3. Guarda los cambios

### Conectar Nodos
1. Mantén presionada la tecla Alt/Option
2. Click en el nodo origen
3. Arrastra hasta el nodo destino
4. Suelta

### Eliminar Conexiones
1. Click en la línea de conexión
2. Click en el botón "×" que aparece

## 🚀 Despliegue

### Para desplegar a Firebase Hosting:

```bash
# 1. Construir la aplicación
npm run build

# 2. Desplegar
firebase deploy
```

### Configuración de Firebase
El archivo `firebase.json` ya está configurado con rewrites para que ambas rutas funcionen correctamente:
- `/` → Versión pública
- `/admin` → Versión admin
- Cualquier otra ruta → Redirige a `/`

## 🎨 Estructura de Nodos

Cada nodo tiene:
- **ID único**: Identificador en formato `vida-xxx` o `gm-xxx`
- **Título**: Nombre corto del concepto
- **Contenido**: Descripción detallada
- **Color**: Color distintivo por tema
- **Posición**: Coordenadas x, y
- **Conexiones**: Array de IDs de nodos conectados

## 📱 Responsive Design

Ambas versiones están optimizadas para:
- Desktop
- Tablet
- Mobile

En dispositivos móviles, los nodos se reorganizan automáticamente en una columna vertical.

## 🔐 Seguridad

**Importante**: La ruta `/admin` no tiene protección por contraseña. Si necesitas seguridad:

1. Puedes agregar Firebase Authentication
2. O mantener la URL `/admin` privada
3. O implementar reglas de seguridad en Firestore

## 📝 Notas de Desarrollo

- Los datos se almacenan en Firebase Firestore
- La colección se llama `mindmapNodes`
- Los cambios en admin se reflejan en tiempo real en la versión pública
- Usa el botón "Reiniciar DB" solo cuando quieras volver al estado inicial

