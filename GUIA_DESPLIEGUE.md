# Guía de Despliegue y Configuración (Aiven + Spotify + Render + GitHub)

Este documento contiene los pasos detallados para configurar la base de datos en Aiven, obtener credenciales de Spotify y desplegar el Frontend y Backend de forma independiente en Render.

---

## 1. Subir el proyecto a GitHub (Control de Versiones)
Antes de desplegar en Render, tu código debe estar en un repositorio remoto de GitHub.

1. Crea un repositorio vacío en [GitHub](https://github.com/).
2. Abre la terminal en la raíz de tu proyecto local (`Mthings`) y ejecuta:
   ```bash
   git init
   git add .
   git commit -m "Primer commit: Estructura del proyecto separada con Spotify"
   git branch -M main
   git remote add origin <URL_DE_TU_REPOSITORIO>
   git push -u origin main
   ```
*(Nota: Asegúrate de tener un archivo `.gitignore` en la carpeta raíz que ignore la carpeta `node_modules` y el archivo `.env`)*

---

## 2. Configurar la Base de Datos en Aiven (MySQL)

1. Crea una cuenta en [Aiven.io](https://aiven.io/).
2. En la consola, haz clic en **Create Service**.
3. Selecciona el servicio **MySQL** (busca la opción gratuita o "Hobbyist" si está disponible).
4. Elige tu región (preferiblemente US East) y haz clic en **Create Service**.
5. Ve a la pestaña **Overview** o **Connection Information** del servicio creado. Allí verás los siguientes datos:
   - **Host**
   - **Port**
   - **User**
   - **Password**
   - **Database Name** (normalmente `defaultdb`)
6. Guarda estos datos, los necesitarás tanto localmente como en Render.

---

## 3. Configurar Spotify Developer Dashboard

Para que la función de "Importar desde Spotify" funcione, necesitas registrar la aplicación en Spotify.

1. Ve a [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) e inicia sesión con tu cuenta de Spotify.
2. Haz clic en **Create app**.
3. Llena el nombre y la descripción de tu app.
4. En **Redirect URIs**, debes agregar dos URLs (una para pruebas locales y otra para producción):
   - Local: `http://localhost:3000/api/spotify/callback`
   - Producción: `https://TU-API-RENDER.onrender.com/api/spotify/callback` *(Añade esta después de que crees el backend en Render).*
5. Selecciona la opción de Web API y guarda.
6. En la pestaña **Settings** de tu aplicación, copia el **Client ID** y el **Client Secret**.

---

## 4. Desplegar el Backend en Render

1. Crea una cuenta en [Render.com](https://render.com/) e inicia sesión con GitHub.
2. Haz clic en **New** y selecciona **Web Service**.
3. Conecta el repositorio de GitHub donde subiste tu código.
4. Rellena los datos de configuración:
   - **Name:** `api-canciones` (o el nombre que prefieras).
   - **Root Directory:** Escribe `backend`. *(Esto es crucial porque tu backend está dentro de esta carpeta).*
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
5. Baja a la sección **Environment Variables** y haz clic en **Add Environment Variable**. Agrega las de Aiven y Spotify:
   - `DB_HOST` = (Tu host de Aiven)
   - `DB_PORT` = (Tu puerto de Aiven)
   - `DB_USER` = (Tu usuario de Aiven)
   - `DB_PASSWORD` = (Tu contraseña de Aiven)
   - `DB_NAME` = (Tu base de datos, ej: defaultdb)
   - `SPOTIFY_CLIENT_ID` = (Tu Client ID de Spotify)
   - `SPOTIFY_CLIENT_SECRET` = (Tu Client Secret de Spotify)
   - `SPOTIFY_REDIRECT_URI` = `https://NOMBRE-DE-TU-APP.onrender.com/api/spotify/callback` *(La URL que te dará Render)*
   - `FRONTEND_URL` = `https://TU-FRONTEND.onrender.com` *(Lo ajustaremos luego de publicar el Frontend)*
6. Haz clic en **Create Web Service**. 
7. Cuando termine, copia la URL que te da Render (ej: `https://api-canciones.onrender.com`).

> ⚠️ **IMPORTANTE:** Ve a tu Dashboard de Spotify y añade esta URL a los **Redirect URIs**: `https://api-canciones.onrender.com/api/spotify/callback`.

---

## 5. Conectar el Frontend con el Backend Desplegado

1. En tu código local, abre `frontend/app.js`.
2. Cambia la primera línea:
   ```javascript
   // Cambia esto:
   const API_URL = 'http://localhost:3000/api/canciones';
   // Por esto:
   const API_URL = 'https://TU-URL-DE-RENDER.onrender.com/api/canciones';
   ```
3. Abre `frontend/index.html` y actualiza la URL del botón de Spotify (línea ~36):
   ```html
   <!-- Cambia localhost:3000 por la URL de tu API -->
   <button class="btn btn-success w-100" id="btnSpotify" onclick="window.location.href='https://TU-URL-DE-RENDER.onrender.com/api/spotify/login'">
   ```
4. Guarda los archivos, haz commit y súbelos a GitHub:
   ```bash
   git add .
   git commit -m "Actualizar URLs para producción"
   git push origin main
   ```

---

## 6. Desplegar el Frontend en Render

1. Vuelve a [Render.com](https://render.com/), haz clic en **New** y selecciona **Static Site**.
2. Selecciona el mismo repositorio de GitHub.
3. Rellena los datos de configuración:
   - **Name:** `frontend-canciones`
   - **Root Directory:** Escribe `frontend`.
   - **Build Command:** *(Déjalo en blanco)*
   - **Publish Directory:** `.` o `frontend`
4. Haz clic en **Create Static Site**.
5. Copia la URL de tu nuevo frontend (ej: `https://frontend-canciones.onrender.com`).

> ⚠️ **ÚLTIMO PASO:** Vuelve a la configuración de tu Backend en Render (Web Service > Environment) y actualiza la variable `FRONTEND_URL` para que apunte a la URL de tu frontend (ej: `https://frontend-canciones.onrender.com`). Guarda los cambios para que el servidor se reinicie.

¡Listo! Ya tienes una aplicación Fullstack alojada con base de datos en la nube e inicio de sesión con Spotify. Cada vez que hagas `git push` a `main`, Render actualizará el código automáticamente.
