const express = require('express');
const axios = require('axios');
const querystring = require('querystring');
const { Cancion } = require('../models/cancion.model');

const router = express.Router();

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5500';

router.get('/login', (req, res) => {
    const scope = 'user-library-read';
    const authUrl = 'https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: CLIENT_ID,
            scope: scope,
            redirect_uri: REDIRECT_URI,
        });
    res.redirect(authUrl);
});

router.get('/callback', async (req, res) => {
    const code = req.query.code || null;

    if (!code) {
        return res.redirect(`${FRONTEND_URL}?error=codigo_no_proveido`);
    }

    try {
        const tokenResponse = await axios.post('https://accounts.spotify.com/api/token', 
            querystring.stringify({
                code: code,
                redirect_uri: REDIRECT_URI,
                grant_type: 'authorization_code'
            }), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Basic ' + (Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'))
                }
            }
        );

        const accessToken = tokenResponse.data.access_token;

        const tracksResponse = await axios.get('https://api.spotify.com/v1/me/tracks?limit=50', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        const items = tracksResponse.data.items;

        for (const item of items) {
            const track = item.track;
            const exists = await Cancion.findOne({ where: { cancion: track.name, artista: track.artists[0].name } });
            
            if (!exists) {
                await Cancion.create({
                    cancion: track.name,
                    artista: track.artists.map(a => a.name).join(', '),
                    genero: 'otro',
                    favorita: true
                });
            }
        }

        res.redirect(`${FRONTEND_URL}?import=success`);

    } catch (error) {
        console.error(error);
        res.redirect(`${FRONTEND_URL}?error=fallo_importacion`);
    }
});

module.exports = router;
