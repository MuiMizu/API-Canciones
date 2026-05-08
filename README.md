# API Canciones Favoritas

Este proyecto es una aplicacion web de gestion de canciones favoritas dividida en frontend y backend utilizando una arquitectura moderna para despliegue independiente, el backend esta desarrollado en Node.js y el frontend utiliza HTML, CSS y JavaScript con Bootstrap.

## Arquitectura y Funcionalidades
El frontend consiste en una interfaz de usuario responsiva creada con HTML5, Bootstrap 5 y JavaScript con Fetch API, el backend es una API RESTful construida con Node.js, Express y Sequelize ORM, la base de datos utilizada es MySQL alojada en Aiven, para el despliegue se emplea Render manejando un Web Service para el backend y un Static Site para el frontend, ademas existe una integracion con Spotify mediante autenticacion OAuth 2.0 para importar automaticamente las canciones favoritas de los usuarios directamente a la base de datos.

## Estructura del Proyecto
El repositorio esta dividido en dos carpetas principales, la carpeta backend contiene el codigo del servidor, los modelos de la base de datos, las rutas incluyendo las de Spotify y los controladores, por otro lado la carpeta frontend contiene la interfaz grafica y la logica para consumir la API.

## Requisitos Previos
Se necesita Node.js en su version 16 o superior, npm como gestor de paquetes, una base de datos MySQL que puede ser local o en Aiven y una aplicacion creada en el Spotify Developer Dashboard para obtener las credenciales necesarias.

## Clonar el Repositorio
Para descargar el proyecto a tu entorno local ejecuta el comando git clone seguido de la URL de tu repositorio y luego ingresa a la carpeta del proyecto.

## Ejecucion Local

### Configuracion del Backend
Navega a la carpeta del backend, instala las dependencias con npm install y configura las variables de entorno creando un archivo env basado en el archivo de ejemplo, alli deberas configurar los datos de tu conexion a MySQL con DB_HOST, DB_PORT, DB_USER, DB_PASSWORD y DB_NAME, junto a las credenciales de Spotify que incluyen SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REDIRECT_URI y la direccion de tu FRONTEND_URL local, finalmente inicia el servidor backend ejecutando npm start o node server.js.

### Configuracion del Frontend
El frontend se compone de archivos estaticos por lo que no requiere instalacion de dependencias de Node, solo necesitas abrir el archivo index html directamente en tu navegador web asegurandote de que el backend este ejecutandose previamente para que la conexion a la base de datos funcione correctamente.

## Endpoints de la API
El sistema cuenta con un metodo GET en /api/canciones para listar todas las canciones, un metodo POST en la misma ruta para agregar una nueva cancion, un metodo PUT en /api/canciones/:id para actualizar los datos, un metodo PATCH en /api/canciones/:id/favorita para invertir el estado de favorita y finalmente un metodo DELETE en la misma ruta para eliminar la cancion especificada.
