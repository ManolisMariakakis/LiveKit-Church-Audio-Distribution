require('dotenv').config();

const express = require('express');
const cors = require('cors');

const http = require('http');
const https = require('https');

const fs = require('fs');

const { AccessToken } = require('livekit-server-sdk');

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static('public'));

const API_KEY = 'devkey';

const API_SECRET =
    '12345678901234567890123456789012';

// -------------------------------------
// LIVEKIT TOKEN
// -------------------------------------

app.get('/token', async(req, res) => {

    try {

        const room =
            req.query.room || 'translation-room';

        const identity =
            req.query.identity || 'guest';

        const at = new AccessToken(
            API_KEY,
            API_SECRET,
            { identity }
        );

        at.addGrant({
            roomJoin: true,
            room,
            canPublish: true,
            canSubscribe: true
        });

        const token = await at.toJwt();

        res.json({ token });

    } catch(err) {

        console.error('LiveKit token error:', err);

        res.status(500).json({
            error: err.message
        });

    }

});

// -------------------------------------
// OPENAI REALTIME TRANSLATION SESSION
// -------------------------------------

app.post('/session', async(req, res) => {

    try {

        const targetLanguage =
            req.body.targetLanguage || 'en';

        const response = await fetch(
            'https://api.openai.com/v1/realtime/translations/client_secrets',
            {
                method: 'POST',

                headers: {

                    'Authorization':
                        `Bearer ${process.env.OPENAI_API_KEY}`,

                    'Content-Type':
                        'application/json'

                },

                body: JSON.stringify({

                    session: {

                        model:
                            'gpt-realtime-translate',

                        audio: {

                            output: {

                                language:
                                    targetLanguage

                            }

                        }

                    }

                })

            }
        );

        const data =
            await response.json();

        console.log(
            'OpenAI session response:'
        );

        console.log(data);

        if (!response.ok) {

            return res
                .status(response.status)
                .json(data);

        }

        res.json(data);

    } catch(err) {

        console.error(
            'OpenAI session error:',
            err
        );

        res.status(500).json({
            error: err.message
        });

    }

});

// -------------------------------------
// HTTP SERVER
// -------------------------------------

http.createServer(app).listen(
    8088,
    '0.0.0.0',
    () => {

        console.log(
            'HTTP server running on http://0.0.0.0:8088'
        );

    }
);

// -------------------------------------
// HTTPS CERTIFICATE
// -------------------------------------

const httpsOptions = {

    key: fs.readFileSync(
        'C:/livekit-web/certs/server-key.pem'
    ),

    cert: fs.readFileSync(
        'C:/livekit-web/certs/server-cert.pem'
    )

};

// -------------------------------------
// HTTPS SERVER
// -------------------------------------

https.createServer(
    httpsOptions,
    app
).listen(
    9443,
    '0.0.0.0',
    () => {

        console.log(
            'HTTPS server running on https://0.0.0.0:9443'
        );

    }
);