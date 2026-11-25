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
