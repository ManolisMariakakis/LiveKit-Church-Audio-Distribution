const express = require('express');
const cors = require('cors');

const http = require('http');
const https = require('https');

const fs = require('fs');

const { AccessToken } = require('livekit-server-sdk');

const app = express();

app.use(cors());

app.use(express.static('public'));

const API_KEY = 'devkey';

const API_SECRET =
    '12345678901234567890123456789012';

// -------------------------------------
// TOKEN
// -------------------------------------

app.get('/token', async (req, res) => {

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

});

// -------------------------------------
// HTTP SERVER (Listeners)
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
        'C:/livekit-web/certs/XXX.XXX.XXX.XXX+2-key.pem'
    ),

    cert: fs.readFileSync(
        'C:/livekit-web/certs/XXX.XXX.XXX.XXX+2.pem'
    )

};

// -------------------------------------
// HTTPS SERVER (Speaker)
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
