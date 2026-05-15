# LiveKit-Church-Audio-Distribution

Low-latency local-network church audio distribution using:

- LiveKit SFU ([LiveKit SFU](https://livekit.io), GitHub: [LiveKit GitHub Repository](https://github.com/livekit/livekit)  
- WebRTC
- Node.js
- Mobile-friendly web UI
- Android/iPhone listeners
- HTTPS speaker microphone support

The system is optimized for:

- church live audio distribution
- simultaneous interpretation
- one speaker (translator) → many listeners
- local Wi-Fi networks
- ultra low latency audio

---

# Architecture

```text
Android Speaker
        ↓ HTTPS
Node HTTPS Server :9443
        ↓
LiveKit SFU :7880
        ↓
HTTP listeners :8088
```

Speaker uploads only ONE audio stream.

LiveKit SFU redistributes audio to all listeners.

---

# Features

- ultra low latency
- mobile friendly
- Android speaker support
- iPhone listener support
- HTTPS microphone access
- HTTP listener access
- Opus audio
- auto-start Windows services
- one-click connect UI
- low CPU usage on speaker device

---

# Folder Structure

```text
C:\
 ├── livekit\
 │    ├── livekit-server.exe
 │    └── config.yaml
 │
 ├── livekit-web\
 │    ├── server.js
 │    ├── certs\
 │    └── public\
 │         ├── speaker.html
 │         └── listener.html
 │
 └── nssm\
      └── win64\nssm.exe
```

---

# Requirements

## Windows Server / Windows PC

- Windows 10/11 or Windows Server
- Node.js installed
- LiveKit Server binary
- NSSM
- local Wi-Fi network

---

# Install Node.js

Download:

https://nodejs.org/

Verify:

```powershell
node -v
npm -v
```

---

# LiveKit Server Setup

Download LiveKit server binary:

https://github.com/livekit/livekit/releases

Place inside:

```text
C:\livekit
```

---

# LiveKit Config

`C:\livekit\config.yaml`

```yaml
port: 7880

rtc:
  tcp_port: 7881
  udp_port: 7882

keys:
  devkey: 12345678901234567890123456789012
```

---

# Install mkcert

Download:

https://github.com/FiloSottile/mkcert/releases

Install root CA:

```powershell
cd C:\mkcert
.\mkcert.exe -install
```

Generate local certificate:

```powershell
.\mkcert.exe XXX.XXX.XXX.XXX localhost 127.0.0.1
```

Copy generated files to:

```text
C:\livekit-web\certs\
```

---

# Install Node Dependencies

```powershell
cd C:\livekit-web

npm init -y

npm install express cors livekit-server-sdk
```

---

# server.js

The Node.js server provides:

- HTTP listener server
- HTTPS speaker server
- token generation endpoint

Ports:

| Port | Purpose |
|---|---|
| 8088 | HTTP listeners |
| 9443 | HTTPS speaker |
| 7880 | LiveKit signaling |
| 7881 | LiveKit TCP |
| 7882 | LiveKit UDP |

---

# Firewall Rules

```powershell
New-NetFirewallRule -DisplayName "LiveKit 7880" -Direction Inbound -Protocol TCP -LocalPort 7880 -Action Allow

New-NetFirewallRule -DisplayName "LiveKit 7881" -Direction Inbound -Protocol TCP -LocalPort 7881 -Action Allow

New-NetFirewallRule -DisplayName "LiveKit 7882 UDP" -Direction Inbound -Protocol UDP -LocalPort 7882 -Action Allow

New-NetFirewallRule -DisplayName "LiveKit HTTP 8088" -Direction Inbound -Protocol TCP -LocalPort 8088 -Action Allow

New-NetFirewallRule -DisplayName "LiveKit HTTPS 9443" -Direction Inbound -Protocol TCP -LocalPort 9443 -Action Allow
```

---

# Manual Server Startup

## Start LiveKit Server

```
cd C:\livekit

livekit-server.exe --config config.yaml
```

## Start Web + Token Server

```
cd C:\livekit-web

node server.js
```
---

# Windows Services (NSSM)

Download NSSM:

https://nssm.cc/download

---

## Create LiveKit Service

```powershell
C:\nssm\win64\nssm.exe install LiveKit "C:\livekit\livekit-server.exe" "--config config.yaml"

C:\nssm\win64\nssm.exe set LiveKit AppDirectory "C:\livekit"
```

---

## Create Web Service

```powershell
C:\nssm\win64\nssm.exe install LiveKitWeb "C:\Program Files\nodejs\node.exe" "server.js"

C:\nssm\win64\nssm.exe set LiveKitWeb AppDirectory "C:\livekit-web"
```

---

## Auto Start

```powershell
Set-Service LiveKit -StartupType Automatic

Set-Service LiveKitWeb -StartupType Automatic
```

---

## Start Services

```powershell
Start-Service LiveKit

Start-Service LiveKitWeb
```

---

# Usage

## Speaker

```text
https://XXX.XXX.XXX.XXX:9443/speaker.html
```

Example:

```text
https://192.168.1.45:9443/speaker.html
```

Speaker requires HTTPS because Android microphone access requires secure context.

---

## Listeners

```text
http://XXX.XXX.XXX.XXX:8088/listener.html
```

Example:

```text
http://192.168.1.45:8088/listener.html
```

Listeners use plain HTTP because they only receive audio.

---

# Mobile Support

## Speaker

- Android supported
- microphone supported via HTTPS
- wake lock supported

## Listeners

- Android supported
- iPhone supported
- no certificate installation required

---

# UI Features

## Speaker

- Start
- Pause Mic
- Resume
- Disconnect

## Speaker Audio Input Options

The `speaker.html` page includes four audio input controls for improving microphone quality and reducing background noise.

| Input | Default | Description |
|---|---|---|
| Echo Cancellation | Off | Reduces echo caused by speakers or room feedback. For external audio sources such as a translation receiver, this should usually stay off. |
| Noise Suppression | On | Enables browser noise reduction to reduce constant background noise. |
| Auto Gain Control | Off | Automatically increases or decreases microphone volume. For translation receivers, this should usually stay off because it can increase hiss when nobody is speaking. |
| Noise Gate Threshold | 0.018 | Controls how much signal is required before the microphone opens. Lower values are more sensitive. Higher values cut more background hiss when the translator is silent. |

### Recommended Settings For Translation Receivers

```text
Echo Cancellation: Off
Noise Suppression: On
Auto Gain Control: Off
Noise Gate Threshold: 0.018
```

### Reduce Background Hiss

If hiss is still audible when nobody is speaking, increase the threshold:

```text
0.022
0.025
0.030
```

### Avoid Cutting Off Words

If the beginning of words is being cut off, lower the threshold:

```text
0.012
0.015
```

The noise gate is especially useful when a translation receiver is connected to the speaker device as an external microphone.

## Listener

- Connect
- Disconnect
- Volume Slider

---

# Production Notes

Recommended for:

- church translation
- simultaneous interpretation
- local event audio distribution
- low-latency speech streaming

Typical capacity on local Wi-Fi:

```text
10-50 listeners
```

depending on network quality and device performance.

---

# Important Configuration Note

Before running the system, replace:

```text
XXX.XXX.XXX.XXX
```

with the actual local IP address of the server PC.

Example:

```text
192.168.1.45
```

This must be updated in:

- `speaker.html`
- `listener.html`
- `server.js`
- local HTTPS certificate generation

## Example

### speaker.html

```js
const SERVER_IP = '192.168.1.45';
```

### listener.html

```js
const SERVER_IP = '192.168.1.45';
```

### Generate Local Certificate

```powershell
.\mkcert.exe 192.168.1.45 localhost 127.0.0.1
```

### server.js certificate paths

```js
'C:/livekit-web/certs/192.168.1.45+2.pem'

'C:/livekit-web/certs/192.168.1.45+2-key.pem'
```

If the server IP changes, these values must be updated accordingly.




