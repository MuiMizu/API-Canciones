require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

console.log('🛠️ Verificando variables de entorno...');
if (!process.env.SPOTIFY_CLIENT_ID) {
    console.error('❌ ERROR: SPOTIFY_CLIENT_ID no está definido');
} else {
    console.log(`✅ ID cargado (inicio): ${process.env.SPOTIFY_CLIENT_ID.substring(0, 4)}...`);
}

if (!process.env.SPOTIFY_CLIENT_SECRET) {
    console.error('❌ ERROR: SPOTIFY_CLIENT_SECRET no está definido');
} else {
    console.log(`✅ Secret cargado (inicio): ${process.env.SPOTIFY_CLIENT_SECRET.substring(0, 4)}...`);
}
const { sequelize, Cancion } = require('./models/cancion.model');
const cancionRoutes = require('./routes/cancion.routes');
const spotifyRoutes = require('./routes/spotify.routes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(morgan('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('trust proxy', 1); // Confiar en el proxy de Render para detectar HTTPS

app.use('/api/canciones', cancionRoutes);
app.use('/api/spotify', spotifyRoutes);

app.use(errorHandler);

const initDB = async () => {
    try {
        // Usamos alter: true para que se agreguen las columnas nuevas si no existen
        await sequelize.sync({ alter: true });
        console.log('Base de datos MySQL sincronizada y actualizada correctamente.');
    } catch (error) {
        console.error('No se pudo conectar a la base de datos:', error);
    }
};

app.listen(PORT, () => {
    console.log(`🚀 Servidor backend listo en puerto ${PORT}`);
    initDB();
});

