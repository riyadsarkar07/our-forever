# Our Forever
A seven-room couple museum for one browser. Explore on foot with WASD, arrow keys or touch. Rooms and Our Story also provide direct access to rooms, memories and letters.

## Run and verify
Use Node 24 and npm. Run `npm ci`, then `npm run dev`. For production use `npm run build` and `npm start`. Both modes download or verify cached avatars at an immutable upstream revision. A missing or corrupt cache is fetched again. An unavailable upstream or a checksum mismatch stops preparation. The browser requests both GLBs from this site when the visitor enters or explicitly previews the gallery. Failed loads offer Retry.

Run `npm run lint`, `npm test` and `npm run build`. Install the Playwright Chromium browser with `npx playwright install chromium` and run `npm run test:browser`. Set MUSEUM_CHROMIUM to test a specific Chromium executable. Run `node scripts/inspect-avatars.mjs` to print the exact joint, morph, clip, material and embedded image inventory. Append `&metrics=1` to `/?demo=1` for renderer counters and GLB timings in the canvas's data-metrics attribute.

## Local features
Photos and settings use browser storage. Videos, local voice clips and music last for the session. The invitation opens the sample route, chat replies are simulated, and the admin view displays sample data. The app has no accounts, remote couple media, shared presence or voice cloning.

The scene moves the character roots in world space, blends native animation clips, and overlays procedural gaze and arm IK. The hug uses coordinated procedural poses. Automatic graphics start at medium and can lower resolution and disable shadows after sustained poor frame times. Low, medium and high are manual overrides. The landing poster is an actual render of this museum.

## Optional speech
Our Story accepts a local voice file. Playback drives approximate jaw motion from an audio envelope. Closing the panel or stopping playback releases the audio. The separate Azure button asks the server for a fixed public English greeting. Only the server reads AZURE_SPEECH_KEY and AZURE_SPEECH_REGION. It caches one greeting per running server instance. Without credentials the endpoint returns 503 and the local museum continues to work. No personal letter or local clip is sent to Azure. Timed frames are sampled from audio playback time. The selected voice still requires a live provider acceptance test before publishing speech claims.

[Azure facial animation documentation](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/how-to-speech-synthesis-viseme) · [Third-party notices](THIRD_PARTY_NOTICES.md)
