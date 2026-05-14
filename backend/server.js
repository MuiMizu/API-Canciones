const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
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

app.use('/api/canciones', cancionRoutes);
app.use('/api/spotify', spotifyRoutes);

app.use(errorHandler);

const initDB = async () => {
    try {
        // Usamos alter: true para que se agreguen las columnas nuevas (imagen_url, audio_url) si no existen
        await sequelize.sync({ alter: true });
        console.log('Base de datos MySQL sincronizada y actualizada correctamente.');

        const count = await Cancion.count();
        if (count === 0) {
            const fs = require('fs');
            if (fs.existsSync('./canciones.json')) {
                const data = JSON.parse(fs.readFileSync('./canciones.json', 'utf8'));
                for (const item of data) {
                    await Cancion.create({
                        cancion: item.cancion,
                        artista: item.artista,
                        genero: item.genero,
                        favorita: item.favorita || false
                    });
                }
                console.log('Datos importados desde canciones.json');
            }
        }
    } catch (error) {
        console.error('No se pudo conectar a la base de datos:', error);
    }
};

app.listen(PORT, () => {
    console.log(`🚀 Servidor backend listo en puerto ${PORT}`);
    initDB();
});

