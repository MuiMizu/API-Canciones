const express = require('express');
const axios = require('axios');
const querystring = require('querystring');
const { Cancion } = require('../models/cancion.model');

const router = express.Router();

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5500';

// Función para mapear los géneros de Spotify a las categorías de la app
const mapSpotifyGenres = (spotifyGenres) => {
    if (!spotifyGenres || spotifyGenres.length === 0) return 'otro';

    const genresStr = spotifyGenres.join(' ').toLowerCase();

    if (genresStr.includes('rock') || genresStr.includes('metal') || genresStr.includes('punk')) return 'rock';
    if (genresStr.includes('reggaeton') || genresStr.includes('trap latino') || genresStr.includes('urbano') || genresStr.includes('perreo')) return 'reggaeton';
    if (genresStr.includes('pop') || genresStr.includes('dance')) return 'pop';
    if (genresStr.includes('hip hop') || genresStr.includes('rap')) return 'hip hop';
    if (genresStr.includes('electronica') || genresStr.includes('house') || genresStr.includes('techno') || genresStr.includes('edm')) return 'electronica';
    if (genresStr.includes('jazz')) return 'jazz';
    if (genresStr.includes('classical') || genresStr.includes('clasica')) return 'clasica';

    return 'otro';
};

router.get('/login', (req, res) => {
    // Forzamos la URL exacta que tienes en tu Dashboard de Spotify
    const dynamicRedirectUri = 'https://api-canciones-yf16.onrender.com/api/spotify/callback';
    
    console.log(`📡 Iniciando login con Redirect URI fija: ${dynamicRedirectUri}`);

    const scope = 'user-library-read';
    const authUrl = 'https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: CLIENT_ID,
            scope: scope,
            redirect_uri: dynamicRedirectUri,
        });
    res.redirect(authUrl);
});

router.get('/callback', async (req, res) => {
    const code = req.query.code || null;
    const dynamicRedirectUri = 'https://api-canciones-yf16.onrender.com/api/spotify/callback';

    if (!code) {
        return res.redirect(`${FRONTEND_URL}?error=codigo_no_proveido`);
    }

    try {
        console.log('📡 Intercambiando código por token...');
        const tokenResponse = await axios.post('https://accounts.spotify.com/api/token',
            querystring.stringify({
                code: code,
                redirect_uri: dynamicRedirectUri,
                grant_type: 'authorization_code'
            }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + (Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'))
            }
        }
        );

        const accessToken = tokenResponse.data.access_token;

        // 1. Obtener las canciones guardadas
        console.log('📡 Solicitando canciones a Spotify...');
        const tracksResponse = await axios.get('https://api.spotify.com/v1/me/tracks?limit=50', {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });

        const items = tracksResponse.data.items;
        console.log(`✅ Spotify devolvió ${items.length} canciones.`);

        if (items.length === 0) {
            console.log('⚠️ No se encontraron canciones en la biblioteca del usuario.');
            return res.redirect(`${FRONTEND_URL}?import=empty`);
        }

        // 2. Obtener IDs de artistas únicos para consultar sus géneros
        const artistIds = [...new Set(items.map(item => item.track.artists[0].id))].filter(id => id).slice(0, 50).join(',');
        let artistGenreMap = {};

        if (artistIds) {
            try {
                console.log('📡 Consultando géneros de artistas...');
                const artistsResponse = await axios.get(`https://api.spotify.com/v1/artists?ids=${artistIds}`, {
                    headers: { 'Authorization': `Bearer ${accessToken}` }
                });

                artistsResponse.data.artists.forEach(artist => {
                    if (artist) artistGenreMap[artist.id] = mapSpotifyGenres(artist.genres);
                });
                console.log('✅ Géneros de artistas procesados.');
            } catch (genreError) {
                console.error('⚠️ Error al consultar géneros (403), continuando con géneros por defecto.');
            }
        }

        // 3. Guardar las canciones con su género detectado
        let createdCount = 0;
        let skippedCount = 0;

        for (const item of items) {
            const track = item.track;
            // Búsqueda más flexible para evitar duplicados falsos
            const exists = await Cancion.findOne({
                where: {
                    cancion: track.name,
                    artista: track.artists[0].name
                }
            });

            if (!exists) {
                const detectedGenre = artistGenreMap[track.artists[0].id] || 'otro';

                await Cancion.create({
                    cancion: track.name,
                    artista: track.artists.map(a => a.name).join(', '),
                    genero: detectedGenre,
                    favorita: true,
                    imagen_url: track.album.images[0]?.url,
                    audio_url: track.preview_url
                });
                createdCount++;
            } else {
                skippedCount++;
            }
        }

        console.log(`🚀 Importación finalizada: ${createdCount} creadas, ${skippedCount} saltadas.`);
        res.redirect(`${FRONTEND_URL}?import=success&count=${createdCount}`);

    } catch (error) {
        const errData = error.response?.data || error.message;
        console.error('❌ Error en Spotify callback:', JSON.stringify(errData));
        const errMsg = encodeURIComponent(typeof errData === 'object' ? JSON.stringify(errData) : errData);
        res.redirect(`${FRONTEND_URL}?error=true&msg=${errMsg}`);
    }
});

module.exports = router;

