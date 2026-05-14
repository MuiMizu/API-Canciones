# MuiMizu API Canciones

Aplicacion web para gestionar musica favorita, creada con Node.js, Express, Sequelize, MySQL, HTML, CSS, Javascript y Bootstrap.

## Caracteristicas

API RESTful funcional, integracion con Spotify OAuth 2.0 para importar temas, diseño premium responsivo, base de datos en Aiven, despliegue automatico en Render.

## Instalacion Local

Ingresa a la carpeta backend, instala las dependencias con npm install, configura el archivo .env con tus credenciales de MySQL y Spotify, inicia el servidor ejecutando npm start.

## Uso del Frontend

Abre el archivo index.html en tu navegador, el frontend conectara automaticamente con el servidor activo para mostrar la lista de canciones.

## Rutas de la API

GET /api/canciones para listar todo, POST para agregar nuevas canciones, PUT para editar datos, PATCH para cambiar estado de favorita, DELETE para borrar temas.
