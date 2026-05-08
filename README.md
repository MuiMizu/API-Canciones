# 🎵 API Canciones Favoritas (Proyecto Final)

Este proyecto es una aplicación web de gestión de canciones favoritas, dividida en **Frontend** y **Backend**, utilizando una arquitectura moderna para despliegue independiente. El backend está desarrollado en Node.js (Express) y el frontend utiliza HTML, CSS y JS con Bootstrap.

## 🚀 Arquitectura y Funcionalidades
- **Frontend:** Interfaz de usuario responsiva creada con HTML5, Bootstrap 5 y JavaScript (Fetch API).
- **Backend:** API RESTful construida con Node.js, Express y Sequelize ORM.
- **Base de Datos:** MySQL (Alojada en Aiven).
- **Despliegue:** Render (Web Service para Backend, Static Site para Frontend).
- **🎵 Integración con Spotify:** Autenticación OAuth 2.0 para importar automáticamente las canciones favoritas (Liked Songs) de los usuarios desde Spotify a la base de datos.

## 📂 Estructura del Proyecto
El repositorio está dividido en dos carpetas principales:
- `/backend`: Contiene el código del servidor, modelos de la base de datos, rutas (incluyendo las de Spotify) y controladores.
- `/frontend`: Contiene la interfaz gráfica y la lógica para consumir la API.

## 🛠️ Requisitos Previos
- Node.js (v16+)
- npm (Node Package Manager)
- Una base de datos MySQL (puede ser local o en Aiven)
- Una aplicación creada en el **Spotify Developer Dashboard** (para obtener credenciales).

## 📥 Clonar el Repositorio
Para descargar el proyecto a tu entorno local, ejecuta el siguiente comando en tu terminal:

```bash
git clone <URL_DE_TU_REPOSITORIO>
cd Mthings
```

## ⚙️ Ejecución Local

### 1. Configuración del Backend
Navega a la carpeta del backend, instala las dependencias y configura las variables de entorno.

```bash
cd backend
npm install
```

Crea un archivo `.env` en la carpeta `backend` (puedes basarte en `.env.example`) y configura tu conexión a MySQL y credenciales de Spotify:
```env
PORT=3000

# Base de datos
DB_HOST=tu_host.aivencloud.com
DB_PORT=18534
DB_USER=avnadmin
DB_PASSWORD=tu_password
DB_NAME=defaultdb

# Spotify API
SPOTIFY_CLIENT_ID=tu_client_id_de_spotify
SPOTIFY_CLIENT_SECRET=tu_client_secret_de_spotify
SPOTIFY_REDIRECT_URI=http://localhost:3000/api/spotify/callback
FRONTEND_URL=http://127.0.0.1:5500 # Ajusta según el puerto local de tu Live Server
```

Inicia el servidor backend:
```bash
npm start
# O para desarrollo:
node server.js
```
El servidor estará corriendo en `http://localhost:3000`.

### 2. Configuración del Frontend
El frontend son archivos estáticos, por lo que no requiere instalación de dependencias de Node. Solo necesitas abrir el archivo `index.html` en tu navegador.

1. Navega a la carpeta `/frontend`.
2. Abre el archivo `index.html` directamente en tu navegador web.
3. Asegúrate de que el backend esté ejecutándose en el puerto 3000 para que el frontend pueda cargar las canciones correctamente.

## 📡 Endpoints de la API (Backend)

| Método | Endpoint | Descripción |
|---|---|---|
| **GET** | `/api/canciones` | Lista todas las canciones. |
| **POST** | `/api/canciones` | Agrega una nueva canción. |
| **PUT** | `/api/canciones/:id` | Actualiza los datos de una canción. |
| **PATCH** | `/api/canciones/:id/favorita`| Invierte el estado de "favorita". |
| **DELETE**| `/api/canciones/:id` | Elimina la canción especificada. |
