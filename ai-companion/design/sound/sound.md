# Derby sound: the finish bell

One sound in the whole product. It means one thing: **a chat finished and it's your turn.** It lets people stop watching tabs. It is never a reward.

## The bell

| | |
| --- | --- |
| Character | A small brass counter bell at a carnival booth, struck once through felt. Warm, round, short. Not a chime melody, not a notification "pop", not a slot-machine ding. |
| Pitch | Fundamental C6 (1046.5 Hz) with inharmonic bell partials at ×2.0, ×2.76, ×5.4, ×8.93. Upper partials decay first, so it softens as it fades. |
| Envelope | 4 ms strike, exponential decay. The fundamental is inaudible by ~1.4 s; file length 1.5 s. |
| Tone | Low-pass at 4.2 kHz (the felt). No reverb tail. |
| Volume | Peak about −17 dBFS (Web Audio gain 0.14). Quieter than a typical OS notification. No volume setting in v1: on or off. |
| Files | `bell.js` synthesizes it live (no asset to load). `bell.wav` is the same sound rendered offline (mono, 44.1 kHz, 16-bit), for an offscreen document or for testing. Both are made here, so there's no licence to track. |

If you'd rather use a recording, search Freesound with the licence filter set to CC0 for a "counter bell" or "service bell", then trim it to under 1.5 s and match the level above.

## When it rings

- Rings once on the transition **working → your turn**, for any lane.
- **Never** rings for: sending a message, starting a session, opening the report, copying a handoff.
- Several lanes finishing within 1.5 s ring **once** (`bell.js` debounces).
- Doesn't ring if that chat's tab is already focused: you're looking at it.
- MV3: play it from the side panel when it's open, otherwise from an offscreen document (reason `AUDIO_PLAYBACK`). The service worker can't play audio.
- The first ring needs the audio context unlocked by a user gesture; resume it on the first click in the panel.

## Mute

- Settings › Signals: "Bell when it's your turn", default **On**. A "Play it" button next to it previews the bell.
- The bell icon in the panel header is a shortcut. Its accessible name says the current state and the action: "Bell is on. Mute" / "Bell is off. Turn on". The icon changes from bell to bell-with-slash.
- Muted means: no sound at all. The lane highlight, the "Your turn" chip, the bulb on the finish post and the toolbar badge all still show. Sound is never the only signal.
- `prefers-reduced-motion` doesn't change the bell. It isn't motion.
