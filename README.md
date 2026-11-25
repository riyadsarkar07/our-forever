# Our Forever — A Museum of Us

An interactive browser-based 3D museum prototype. No credentials or database needed.

## Run locally
```sh
npm install
npm run dev
```
Visit http://localhost:3000. Production: npm run build && npm start.

## Vercel
Import riyadsarkar07/our-forever, select Next.js, root directory ./, default build settings. No environment variables required.

## Demo scope
- Real Three.js gallery, walking avatars, photo frames, surprise room, keyboard/drag/touch controls.
- Museum editor, six media slots, local photo persistence, session-only videos and custom songs, original synthesized ambient melody, outfit and graphics options.
- Sample dashboard, admin interface, invitation URL, simulated partner and chat, simple gesture animations.
- No authentication, payments, real multiplayer, voice chat, authorization, server storage or remote sharing. Do not treat the demo as a private remote museum.
- Procedural stylized geometry and original illustrated placeholders rather than photorealistic licensed 3D assets.
- Supabase integration is deferred; data is local to the current browser and can be lost if browser storage is cleared.

## Future backend
Replace the local demo data adapter with authenticated museum/membership tables, RLS, private storage with signed URLs, and room-scoped realtime presence. Do not expose service-role keys to the browser. Enforce room membership for every resource.

## V2 — expanded museum
Seven connected spaces: entrance, memory hall, surprise suite, photo wing, cinema, music lounge and starlight terrace. New room navigator, marble/wood architectural materials, environment reflections, animated introduction and proposal hearts. Animated CC0 GLB characters are loaded from https://tevy.dev/models/casual-walker and https://tevy.dev/models/hiker (CC0 1.0); procedural fallback if unavailable. Walking/idle/wave use rigged animation when loaded; hug/hold are approximate avatar positioning, not motion-captured clips. No backend or environment variables. External GLB availability and actual device performance require browser testing.

## V3 character pipeline
KTX2 + Meshopt decoding, build-time same-origin cache and pinned CDN fallback, no toy placeholder avatars, visible failure/retry UI. Gesture controller uses two-bone inverse kinematics and coordinated positioning, cross-fades, timed release and an alternate hug camera. Hug and hand-holding are procedural, not motion-capture animations. Casual Walker and Hiker are CC0 models from tevy.dev. Realism is limited by the assets; outfit recolor depends on the mesh material names. Backend remains disabled.

## V4 couple update
Replaces the hiker and casual walker with Arjun and Priya from Avatar Studio's MIT-licensed Rocketbox-derived library (pinned commit 2fd9ec82fbe1613d40ae38aadcca3f410725f740). More detailed face textures and original outfits; native mocap for walking/idle/wave, procedural paired approach/embrace/release with back-reaching IK, facial smiles/blinks and closer cinematic camera. Hug is not a captured paired clip. See THIRD_PARTY_NOTICES.md. No backend.
