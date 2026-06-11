# Comprehensive Technical Analysis: LiveKit Speaker Audio Processing Chain

The Speaker application utilizes the **Web Audio API** to construct a real-time Digital Signal Processing (DSP) pipeline specifically optimized for live speech transmission.

The primary design goals are:

* Maximize speech intelligibility
* Reduce environmental noise
* Improve Automatic Speech Recognition (ASR) accuracy
* Improve AI translation quality
* Normalize speaker volume
* Prevent clipping and listener fatigue
* Deliver a clean, broadcast-style signal to LiveKit

The complete processing chain is shown below.

```text
[ Microphone Input ]
         │
         ▼
1. High-Pass Filter (Low Cut)
         │
         ▼
2. Bass EQ (Low Shelf)
         │
         ▼
3. Treble EQ (High Shelf)
         │
         ▼
4. Presence EQ (3 kHz Clarity Boost)
         │
         ▼
5. Low-Pass Filter (High Cut)
         │
         ▼
6. Dynamics Compressor
         │
         ▼
7. Output Gain Boost
         │
         ▼
8. RMS Analyser + Noise Gate
         │
         ▼
[ LiveKit Audio Track ]
```

# 1. High-Pass Filter (Low Cut)

### Web Audio API Node

`BiquadFilterNode`

### Configuration

* Type: `highpass`
* Frequency: Adjustable (20 Hz – 250 Hz)
* Default: `80 Hz`

### Technical Functionality

The High-Pass Filter attenuates frequencies below the selected cutoff frequency while allowing higher frequencies to pass unaffected.

A second-order biquad filter provides approximately:

```text
-12 dB per octave
```

attenuation below the cutoff point.

### Operational Benefits

Human speech contains very little useful information below 80 Hz.

This filter removes:

* HVAC rumble
* Building vibration
* Handling noise
* Table bumps
* Microphone stand resonance
* Plosive energy from "P" and "B" sounds

Removing these frequencies before dynamic processing prevents unnecessary compressor triggering and improves overall speech clarity.

# 2. Bass EQ (Low Shelf)

### Web Audio API Node

`BiquadFilterNode`

### Configuration

* Type: `lowshelf`
* Frequency: `200 Hz`
* Gain: Adjustable from `-12 dB` to `+12 dB`

### Technical Functionality

A low-shelf equalizer boosts or attenuates all frequencies below 200 Hz.

### Operational Benefits

This control compensates for microphone placement and proximity effect.

Negative settings:

* Reduce boominess
* Reduce mud
* Improve articulation

Positive settings:

* Add warmth
* Add vocal body
* Improve perceived fullness

# 3. Treble EQ (High Shelf)

### Web Audio API Node

`BiquadFilterNode`

### Configuration

* Type: `highshelf`
* Frequency: `4000 Hz`
* Gain: Adjustable from `-12 dB` to `+12 dB`
* Default: `+2 dB`

### Technical Functionality

The High-Shelf filter boosts or attenuates frequencies above 4 kHz.

### Operational Benefits

This region contains:

* Consonant detail
* Speech transients
* Harmonic definition
* Vocal brightness

Moderate boosting improves:

* Speech intelligibility
* Listener comfort
* AI speech recognition performance

# 4. Presence EQ (Vocal Clarity Enhancement)

### Web Audio API Node

`BiquadFilterNode`

### Configuration

* Type: `peaking`
* Frequency: `3000 Hz`
* Q: `1.0`
* Gain: `+2.5 dB`

### Technical Functionality

A peaking equalizer selectively boosts a narrow frequency region centered at 3 kHz.

### Operational Benefits

The 2–4 kHz region is the most critical range for speech intelligibility.

This enhancement:

* Improves articulation
* Enhances consonant recognition
* Increases speech presence
* Helps AI translation systems distinguish words more accurately

The effect is intentionally subtle to avoid listener fatigue.

# 5. Low-Pass Filter (High Cut)

### Web Audio API Node

`BiquadFilterNode`

### Configuration

* Type: `lowpass`
* Frequency: Adjustable (4000 Hz – 15000 Hz)
* Default: `8500 Hz`

### Technical Functionality

The Low-Pass Filter attenuates frequencies above the selected cutoff point.

Typical slope:

```text
-12 dB per octave
```

### Operational Benefits

Useful speech information largely ends below 8–10 kHz.

This filter reduces:

* High-frequency hiss
* Electronic noise
* RF interference
* Harsh sibilance
* Keyboard clicks
* Paper noise

The result is a cleaner signal for both listeners and AI processing systems.

# 6. Dynamics Compressor

### Web Audio API Node

`DynamicsCompressorNode`

### Configuration

* Threshold: Adjustable (`-60 dB` to `0 dB`)
* Default: `-20 dB`
* Ratio: Adjustable (`1:1` to `12:1`)
* Default: `3.5:1`
* Knee: `20`
* Attack: `5 ms`
* Release: `150 ms`

### Technical Functionality

The compressor reduces the dynamic range of the speech signal.

Signals exceeding the threshold are automatically attenuated according to the selected ratio.

### Operational Benefits

The compressor:

* Reduces excessive peaks
* Prevents clipping
* Maintains consistent volume
* Improves listener comfort
* Improves ASR stability

Example:

If the speaker exceeds the threshold by:

```text
7 dB
```

with a ratio of:

```text
3.5 : 1
```

the resulting output increase is approximately:

```text
2 dB
```

This keeps speech controlled without sounding unnatural.

# 7. Output Gain Boost

### Web Audio API Node

`GainNode`

### Configuration

* Gain Range: `1x – 5x`
* Default: `2x`

### Technical Functionality

The Gain Stage provides final level adjustment after all equalization and dynamic processing.

### Operational Benefits

This stage:

* Compensates for low-output microphones
* Increases average signal level
* Improves translation engine input level
* Optimizes LiveKit publishing volume
* Allows quick adaptation to different microphone sensitivities

Because gain is applied after compression, speech remains controlled while achieving higher average loudness.

# 8. RMS Analyser & Noise Gate

### Web Audio API Nodes

* `AnalyserNode`
* `GainNode`

### Configuration

* FFT Size: `2048`
* Open Gain: `1.0`
* Closed Gain: `0.01`
* Noise Threshold: Adjustable (`0.000 – 0.100`)
* Default: `0.012`
* Gate Attack: `2 ms`
* Gate Release: `150 ms`

### Technical Functionality

The analyser continuously calculates the Root Mean Square (RMS) energy of the incoming signal.

```text
RMS = sqrt(sum(x²) / n)
```

When the measured RMS falls below the configured threshold, the gate gradually reduces output level.

When speech returns above the threshold, the gate reopens automatically.

### Operational Benefits

The Noise Gate acts as an intelligent mute system.

During pauses it suppresses:

* Room ambience
* Air conditioning noise
* Computer fan noise
* Electrical hum
* Distant background conversations

### Fast Attack Design

Attack Time:

```text
2 ms
```

This extremely fast response prevents:

* Missing syllables
* Clipped word beginnings
* Lost consonants

### Smooth Release Design

Release Time:

```text
150 ms
```

This prevents:

* Chattering
* Abrupt gate closure
* Unnatural speech decay

The result is a natural, transparent listening experience.

# Final Result

The complete processing chain transforms a raw microphone signal into a clean, broadcast-quality speech stream optimized for:

* Live church translation
* OpenAI Realtime Translation
* Automatic Speech Recognition (ASR)
* Conference interpretation
* Guided tours
* Public speaking
* Live streaming

The resulting LiveKit audio track contains significantly reduced noise, controlled dynamics, enhanced intelligibility, and consistent loudness while preserving natural speech characteristics.
