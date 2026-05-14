const express = require('express');
const axios = require('axios');
const querystring = require('querystring');
const { Cancion } = require('../models/cancion.model');

const router = express.Router();

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5500';

router.get('/login', (req, res) => {
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

        // 3. Guardar las canciones (Sin género)
        let createdCount = 0;
        let skippedCount = 0;

        for (const item of items) {
            const track = item.track;
            const exists = await Cancion.findOne({ 
                where: { 
                    cancion: track.name, 
                    artista: track.artists[0].name 
                } 
            });
            
            if (!exists) {
                await Cancion.create({
                    cancion: track.name,
                    artista: track.artists.map(a => a.name).join(', '),
                    favorita: true,
                    imagen_url: track.album.images[0]?.url
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
