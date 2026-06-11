# LiveKit-Church-Audio-Distribution

Low-latency local-network church audio distribution and realtime AI translation using:

- LiveKit SFU, https://livekit.io, https://github.com/livekit/livekit
- WebRTC
- Node.js
- OpenAI Realtime Translation API
- Mobile-friendly web UI
- Android/iPhone support

## Features

### Human Translation (Speaker)

- Live microphone broadcasting through LiveKit
- Microphone selection
- Real-time audio enhancement
- Output Gain Boost (1x–5x)
- Compressor / Voice Leveler
- Noise Gate
- High-Pass Filter
- Low-Pass Filter

### AI Translation (Translator)

- OpenAI Realtime Translation
- Real-time speech translation
- Translation Audio Boost (1x–5x)
- Compressor / Voice Leveler
- LiveKit publishing
- Designed for improved intelligibility in noisy environments

### Listener

- Connect from any modern browser
- Select Human Translation
- Select AI Translation Language
- Adjustable Volume Control
- Bass Boost Control
- Treble Boost Control
- Voice Leveler (Compressor)
- PWA Installation Support
- Wake Lock Support (prevents screen sleep)
- Automatic reconnection to translation streams

# Architecture

## Human Translation

```text
speaker.html
        ↓
LiveKit Room
        ↓
listener.html
````

## AI Translation

```text
Live Speech
        ↓
translator.html
        ↓
OpenAI Realtime Translation API
        ↓
Translated Speech
        ↓
LiveKit Room
        ↓
listener.html
```

# Translation Modes

The system supports two audio sources:

| Mode              | Source            |
| ----------------- | ----------------- |
| Human Translation | `speaker.html`    |
| AI Translation    | `translator.html` |


# Human Translation

When the listener selects:

```text
Human Translation
```

audio comes directly from:

```text
speaker.html
```

The speaker publishes audio using identity:

```text
speaker
```

Example:

```text
http://192.168.1.45:8088/listener.html
```

# AI Translation

The AI translator:

* captures live speech
* sends audio to OpenAI Realtime Translation API
* receives translated speech
* republishes translated audio into LiveKit

The translator supports multiple languages.

# Supported AI Languages

| Language   | Identity         |
|------------|------------------|
| English    | `translator-en` |
| Spanish    | `translator-es` |
| Portuguese | `translator-pt` |
| French     | `translator-fr` |
| Italian    | `translator-it` |
| German     | `translator-de` |
| Russian    | `translator-ru` |
| Chinese    | `translator-zh` |
| Japanese   | `translator-ja` |
| Korean     | `translator-ko` |
| Hindi      | `translator-hi` |
| Indonesian | `translator-id` |
| Vietnamese | `translator-vi` |

# Listener Source Selection

The listener page contains a dropdown selector:

| Dropdown Option   | Identity        |
| ----------------- | --------------- |
| Human Translation | `speaker`       |
| AI English        | `translator-en` |
| AI Spanish        | `translator-es` |
| AI Portuguese     | `translator-pt` |
| AI French         | `translator-fr` |
| AI Italian        | `translator-it` |
| AI German         | `translator-de` |
| AI Russian        | `translator-ru` |
| AI Chinese        | `translator-zh` |
| AI Japanese       | `translator-ja` |
| AI Korean         | `translator-ko` |
| AI Hindi          | `translator-hi` |
| AI Indonesian     | `translator-id` |
| AI Vietnamese     | `translator-vi` |

The listener automatically filters audio tracks by participant identity.

# Folder Structure

```text
C:\
 ├── livekit\
 │    ├── livekit-server.exe
 │    └── config.yaml
 │
 ├── livekit-web\
 │    ├── server.js
 │    ├── config.js
 │    ├── .env
 │    ├── certs\
 │    │    ├── server-cert.pem
 │    │    └── server-key.pem
 │    │
 │    └── public\
 │         ├── speaker.html
 │         ├── translator.html
 │         ├── listener.html
 │         └── config.js
 │
 └── nssm\
      └── win64\nssm.exe
```

# Requirements

## Windows PC / Server

* Windows 10/11 or Windows Server
* Node.js
* LiveKit Server
* NSSM
* local Wi-Fi network

Throughout this documentation:

192.168.1.45

is only an example local network IP address.

You must replace it with your own server/local PC IP address.

# Install Node.js

Download:

```text
https://nodejs.org/
```

Verify:

```powershell
node -v
npm -v
```

# Install LiveKit Server

Download:

```text
https://github.com/livekit/livekit/releases
```

Place inside:

```text
C:\livekit
```

# LiveKit Configuration

File:

```text
C:\livekit\config.yaml
```

Example:

```yaml
port: 7880

rtc:
  tcp_port: 7881
  udp_port: 7882

keys:
  devkey: 12345678901234567890123456789012
```

# Install mkcert

Download:

```text
https://github.com/FiloSottile/mkcert/releases
```

Install root certificate authority:

```powershell
cd C:\mkcert

.\mkcert.exe -install
```

Generate local certificate:

```powershell
.\mkcert.exe 192.168.1.45 localhost 127.0.0.1
```

Rename generated files to:

```text
server-cert.pem
server-key.pem
```

Copy to:

```text
C:\livekit-web\certs\
```

# Install Node Dependencies

```powershell
cd C:\livekit-web

npm init -y

npm install express cors dotenv livekit-server-sdk
```

# Environment Variables

Create:

```text
C:\livekit-web\.env
```

Add:

```env
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxx
```

# config.js

Create:

```text
C:\livekit-web\public\config.js
```

Contents:

```js
const SERVER_IP = 'XXX.XXX.XXX.XXX';
```
Example:

```js
const SERVER_IP = '192.168.1.45';
```

All frontend pages use this shared configuration.

# HTTPS Certificates

Example server configuration:

```js
const httpsOptions = {

    key: fs.readFileSync(
        'C:/livekit-web/certs/server-key.pem'
    ),

    cert: fs.readFileSync(
        'C:/livekit-web/certs/server-cert.pem'
    )

};
```

# server.js

The Node.js server provides:

* HTTPS speaker server (HTTP speaker server with a trusted local origin)
* HTTPS translator server (HTTP translator server with a trusted local origin)
* HTTP listener server
* LiveKit token endpoint
* OpenAI session endpoint

Ports:

| Port | Purpose                                                  |
| ---- | -------------------------------------------------------- |
| 9443 | HTTPS speaker + translator                               |
| 8088 | HTTPS speaker + translator (with a trusted local origin) |
| 8088 | HTTP listener                                            |
| 7880 | LiveKit signaling                                        |
| 7881 | LiveKit TCP                                              |
| 7882 | LiveKit UDP                                              |

# Firewall Rules

```powershell
New-NetFirewallRule -DisplayName "LiveKit 7880" -Direction Inbound -Protocol TCP -LocalPort 7880 -Action Allow

New-NetFirewallRule -DisplayName "LiveKit 7881" -Direction Inbound -Protocol TCP -LocalPort 7881 -Action Allow

New-NetFirewallRule -DisplayName "LiveKit 7882 UDP" -Direction Inbound -Protocol UDP -LocalPort 7882 -Action Allow

New-NetFirewallRule -DisplayName "LiveKit HTTP 8088" -Direction Inbound -Protocol TCP -LocalPort 8088 -Action Allow

New-NetFirewallRule -DisplayName "LiveKit HTTPS 9443" -Direction Inbound -Protocol TCP -LocalPort 9443 -Action Allow
```

# Manual Startup

## Start LiveKit

```powershell
cd C:\livekit

livekit-server.exe --config config.yaml
```

## Start Web Server

```powershell
cd C:\livekit-web

node server.js
```

# Windows Services (NSSM)

Download:

```text
https://nssm.cc/download
```

## Create LiveKit Service

```powershell
C:\nssm\win64\nssm.exe install LiveKit "C:\livekit\livekit-server.exe" "--config config.yaml"

C:\nssm\win64\nssm.exe set LiveKit AppDirectory "C:\livekit"
```

## Create Web Service

```powershell
C:\nssm\win64\nssm.exe install LiveKitWeb "C:\Program Files\nodejs\node.exe" "server.js"

C:\nssm\win64\nssm.exe set LiveKitWeb AppDirectory "C:\livekit-web"
```

# Start Services

```powershell
Start-Service LiveKit

Start-Service LiveKitWeb
```

# Usage

## Speaker

```text
https://192.168.1.45:9443/speaker.html

http://192.168.1.45:8088/speaker.html (with a trusted local origin)
```

Features:

* microphone selection
* audio processing
* auto reconnect microphone
* wake lock
* silent Reconnection Loop

## Translator

```text
https://192.168.1.45:9443/translator.html

http://192.168.1.45:8088/translator.html (with a trusted local origin)
```

Features:

* OpenAI realtime translation
* multilingual translation
* LiveKit publishing
* language selector
* speech-to-speech translation

## Listener

```text
http://192.168.1.45:8088/listener.html
```

Features:

* Human / AI selection
* audio processing
* Android support
* iPhone support
* ultra low latency playback

# Mobile Support

## Speaker / Translator

Requires HTTPS because browsers block microphone access on insecure origins or HTTP with a trusted local origin.

## Listener

Listeners use plain HTTP because they only receive audio and can be installed on:

- Android phones
- Android tablets
- iPhone
- iPad
- Desktop browsers supporting PWA

Features:

- Home screen installation
- Full-screen experience
- Wake Lock support
- Optimized for long listening sessions

# Audio Processing

## Speaker Audio Chain

Microphone
→ High-Pass Filter
→ Bass EQ
→ Treble EQ
→ Clarity EQ
→ Low-Pass Filter
→ Compressor
→ Output Gain Boost
→ Noise Gate
→ LiveKit

Features:

- Real-time Noise Gate
- Adjustable Bass EQ
- Adjustable Treble EQ
- Speech Clarity Enhancement
- Compressor / Dynamics Control
- Output Gain Boost (1x–5x)
- High-Pass and Low-Pass Filters

The complete DSP implementation is documented in `SpeakerAudio.md`.

## Translator Audio Chain

Microphone
→ OpenAI Realtime Translation
→ Translation Gain Boost
→ Compressor / Voice Leveler
→ LiveKit

Features:

- Translation Audio Boost (1x–5x)
- Compressor / Voice Leveler
- Real-time language translation
- LiveKit audio publishing

## Listener Audio Processing

The Listener application includes local audio enhancement controls that run directly in the user's browser.

Audio Chain:

LiveKit Audio
→ Bass EQ
→ Treble EQ
→ Optional Voice Leveler
→ Device Speaker / Headphones

Features:

- Volume Control
- Bass Boost (-10 dB to +12 dB)
- Treble Boost (-10 dB to +12 dB)
- Optional Voice Leveler / Compressor
- Real-time audio adjustments
- No server-side processing required

# Typical Capacity

Recommended:

```text
10-50 listeners
```

depending on:

* Wi-Fi quality
* device performance
* network congestion


